"use client"


import axios from 'axios';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const CompanyData = () => {

    const [companyData, setCompanyData] = useState(null)
    const params = useParams();
    console.log(params.slug)

    const query = `{
        company(id: "${params.slug}") {
            companyName
            company
        }`

    const getData = useCallback(async () => {
        const tempData = await axios.post(
            `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}`,
            { query },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }
        )
        setCompanyData(tempData.data.company)
    }, [query])

    useEffect(() => {
        getData()
    }, [getData])

    console.log(companyData)

    return (
        <div>
            <h1>{companyData?.companyName}</h1>
        </div>
    )
}

export default CompanyData
