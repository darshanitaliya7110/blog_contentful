import axios from "axios";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const CONTENT_REVIEW_MODEL_TYPE_ID = "review";
const CONTENT_APP_MODEL_TYPE_ID = "partnerApps";

export default async function handleAddReview(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  // Get data from request body
  const { customerName, comment, rate, appId } = req.body;
  try {
    // Add review to Contentful
    const reviewData = {
      fields: {
        name: { "en-US": "" },
        customerName: { "en-US": customerName || "" },
        rate: { "en-US": rate || 0 },
        date: { "en-US": new Date().toISOString() },
        comment: { "en-US": comment || "" },
      },
      content_type_id: CONTENT_REVIEW_MODEL_TYPE_ID,
      publish: true,
    };

    const reviewResponse = await axios.post(
      `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Content-Type": CONTENT_REVIEW_MODEL_TYPE_ID,
        },
      }
    );

    if (reviewResponse.status !== 201) {
      throw new Error("Failed to add review to Contentful");
    }

    // Publish review entry
    const reviewId = reviewResponse.data.sys.id;
    await publishEntry({
      publishedurl: `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${reviewId}`,
      contentfulVersion: reviewResponse.data.sys.version,
      contentType: CONTENT_REVIEW_MODEL_TYPE_ID,
    });

    // Fetch app data
    const appResponse = await axios.get(
      `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${appId}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Content-Type": CONTENT_APP_MODEL_TYPE_ID,
        },
      }
    );

    // Update app with new review
    const appData = appResponse.data;
    const existingReviews = appData.fields?.reviews?.["en-US"] || [];
    const updatedReviews = [
      ...existingReviews,
      { sys: { type: "Link", linkType: "Entry", id: reviewId } },
    ];
    const updatedEntryData = {
      fields: { ...appData.fields, reviews: { "en-US": updatedReviews } },
    };

    const updateAppResponse = await axios.put(
      `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${appId}`,
      updatedEntryData,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Content-Type": CONTENT_APP_MODEL_TYPE_ID,
          "X-Contentful-Version": appData.sys.version,
        },
      }
    );

    if (updateAppResponse.status !== 200) {
      throw new Error("Failed to update app entry");
    }

    // Publish app entry
    await publishEntry({
      publishedurl: `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${appId}`,
      contentfulVersion: updateAppResponse.data.sys.version,
      contentType: CONTENT_APP_MODEL_TYPE_ID,
    });
    const data = {
      date: reviewResponse.data.fields.date["en-US"],
      comment: reviewResponse.data.fields.comment["en-US"],
      rate: reviewResponse.data.fields.rate["en-US"],
      customerName: reviewResponse.data.fields.customerName["en-US"],
    };
    return res.status(201).json({ review: data });
  } catch (error) {
    console.error("Error adding entry to Contentful:", error);
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Internal Server Error" });
  }
}

async function publishEntry({ publishedurl, contentfulVersion, contentType }) {
  try {
    const publishResponse = await axios.put(
      `${publishedurl}/published`,
      {},
      {
        headers: {
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Version": contentfulVersion,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "X-Contentful-Content-Type": contentType,
        },
      }
    );

    if (
      !publishResponse.data ||
      !publishResponse.data.sys ||
      publishResponse.data.sys.publishedCounter <= 0
    ) {
      throw new Error("Failed to publish entry");
    }

    return publishResponse;
  } catch (error) {
    throw new Error(error);
  }
}
