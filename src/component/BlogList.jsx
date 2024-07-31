"use client"

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const BlogList = ({ blogData }) => {

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);
    if (!hydrated) {
        return null;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };



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
