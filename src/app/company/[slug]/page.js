import React from "react";
import axios from "axios";
import CompanyData from "@/component/CompanyData";

export async function getData(slug) {
  const query = `{
      company(id: "${slug}") {
          companyName
          company
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
    companyData: response.data.data.company,
  };
}

const Page = async ({ params }) => {
  const { companyData } = await getData(params.slug);
  return (
    <div>
      <CompanyData companyData={companyData} />
    </div>
  );
};

export default Page;
