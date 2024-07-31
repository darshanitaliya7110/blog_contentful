import BlogList from "@/component/BlogList";
import axios from "axios";

const getData = async () => {
  const query = `{
    blogCollection {
        items {
        _id
        title
        verified
        description
        date
        image{
            title
            url
        }
        body{
            json
        }
        author{
            authorName
            authorImage{
            url
            }
        }
        companyCollection{
            items{
            sys{
            id
            }
            companyName
            }
        }
        }
    }
}`;

  const response = await axios.post(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.SPACE_ID}`,
    { query },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  return {
    blogData: response.data.data.blogCollection.items,
  };
};

export default async function Home() {
  const { blogData } = await getData();
  return <BlogList blogData={blogData} />;
}
