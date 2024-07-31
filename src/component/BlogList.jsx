"use client"

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
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


    const headingList = []
    const options = {
        renderNode: {
            [BLOCKS.HEADING_2]: (node) => {

                return node.content && node.content.map((item, i) => {
                    const slugify = str => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

                    headingList.push({ title: item.value, slug: slugify(item.value) })
                    return <div key={i}>
                        <h1 id={slugify(item.value)} style={{ color: "red" }}><i><b>{item.value}</b></i></h1>
                    </div>
                })
            }
        }
    };



    return (
        <div style={{ display: "flex" }}>
            <div >
                {blogData?.map((item, i) =>
                    <div key={item._id}>
                        {item.title && <h1>{item.title}</h1>}
                        {item.verified && <p>{item.verified ? "verified" : "unverified"}</p>}
                        {item.description && <p>{item.description}</p>}
                        {item.image.url && <img src={item.image.url} alt={item.image.title} />}
                        {item.body.json && <div>{documentToReactComponents(item.body.json, options)}</div>}
                        {item.author.authorImage.url && <span><p><img style={{ width: "30px", height: "30px" }} src={item.author.authorImage.url} alt={item.author.authorName} /> {item.author.authorName}</p></span>}
                        <br />
                        {item.date && <p>{formatDate(item.date)}</p>}
                        {item.companyCollection.items && <div>Company list :
                            {
                                item.companyCollection.items.map((item) => <Link href={`/company/${item.sys.id}`} key={item.companyName}>
                                    {item.companyName}
                                </Link>)
                            }
                        </div>}
                        <hr />
                    </div>
                )
                }
            </div >
            <div>{headingList.map((item) => <h4 key={item.slug}><Link href={`#${item.slug}`}>{item.title}</Link></h4>)
            }</div>
        </div>
    )
}

export default BlogList
