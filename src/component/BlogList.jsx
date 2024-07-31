"use client"

import axios from 'axios';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link';

const BlogList = () => {

    const [blogData, setBlogData] = useState(null)

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
        setBlogData(tempData.data.data.blogCollection.items)
    }, [query])

    useEffect(() => {
        getData()
    }, [getData])


    return (
        <div>
            {blogData?.map((item) =>
                <div key={item._id}>
                    <h1>{item.title}</h1>
                    <p>{item.verified ? "verified" : "unverified"}</p>
                    <p>{item.description}</p>
                    <img src={item.image.url} alt={item.image.title} />
                    <div>{documentToReactComponents(item.body.json)}</div>
                    <span><p><img style={{ width: "30px", height: "30px" }} src={item.author.authorImage.url} alt={item.author.authorName} /> {item.author.authorName}</p></span>
                    <br />
                    <p>{formatDate(item.date)}</p>
                    <div>Company list :
                        {
                            item.companyCollection.items.map((item) => <Link href={`/company/${item.sys.id}`} key={item.companyName}>
                                {item.companyName}
                            </Link>)
                        }
                    </div>
                    <hr />
                </div>
            )
            }
        </div >
    )
}

export default BlogList
