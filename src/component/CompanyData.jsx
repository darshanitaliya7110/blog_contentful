"use client"


import axios from 'axios';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const CompanyData = () => {

    const params = useParams();
    const [companyData, setCompanyData] = useState(null)

    const query = `{
            company(id: "${params.slug}") {
                companyName
                company
            }
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
        setCompanyData(tempData.data.data)
    }, [query])

    useEffect(() => {
        getData()
    }, [getData])


    return (
        <div>
            <h1>{companyData?.company?.companyName}</h1>
            {
                companyData?.company?.company.map((item, i) => <p key={i}>{item}</p>)
            }
        </div>
    )
}

export default CompanyData
