"use client"

import axios from 'axios';
import React, { useState } from 'react'



const AddCompany = () => {
    const content_type_id = "company"
    const [companyName, setCompanyName] = useState('');
    const [companyDetails, setCompanyDetails] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleCompanyNameChange = (e) => {
        setCompanyName(e.target.value);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleAddDetail = (e) => {
        if (e.key === 'Enter' && inputValue) {
            setCompanyDetails([...companyDetails, inputValue]);
            setInputValue('');
        }
    };

    const handleRemoveDetail = (index) => {
        const newDetails = companyDetails.filter((_, i) => i !== index);
        setCompanyDetails(newDetails);
    };

    const handleSubmit = async () => {
        if (companyName.trim() === 0) {
            return
        }
        if (companyDetails.length === 0) {
            return
        }


        try {
            // Add review to Contentful
            const reviewData = {
                fields: {
                    companyName: { "en-US": companyName },
                    company: { "en-US": companyDetails }
                },
                content_type_id: content_type_id,
                publish: true,
            };

            const reviewResponse = await axios.post(
                `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/entries`,
                reviewData,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        "Content-Type": "application/vnd.contentful.management.v1+json",
                        "X-Contentful-Content-Type": content_type_id,
                    },
                }
            );

            if (reviewResponse.status !== 201) {
                throw new Error("Failed to add review to Contentful");
            }

            // Publish review entry
            const reviewId = reviewResponse.data.sys.id;
            await publishEntry({
                publishedurl: `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/entries/${reviewId}`,
                contentfulVersion: reviewResponse.data.sys.version,
                contentType: content_type_id,
            });


        } catch (error) {
            console.error("Error adding entry to Contentful:", error);
        }

        setCompanyName("")
        setCompanyDetails([])
    }


    async function publishEntry({ publishedurl, contentfulVersion, contentType }) {
        try {
            const publishResponse = await axios.put(
                `${publishedurl}/published`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        "Content-Type": "application/vnd.contentful.management.v1+json",
                        "X-Contentful-Version": contentfulVersion,
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



    return (
        <div className="form-container">
            <div>
                <label htmlFor="companyName">Company name </label>
                <br />
                <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={handleCompanyNameChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="companyDetails">Company </label>
                <br />
                <input
                    id="companyDetails"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleAddDetail}
                    placeholder="Type the value and hit enter"
                    required
                />
            </div>
            <div className="chip-container">
                {companyDetails.map((detail, index) => (
                    <div key={index} className="chip">
                        {detail}
                        <button onClick={() => handleRemoveDetail(index)}>x</button>
                    </div>
                ))}
            </div>
            <button onClick={() => handleSubmit()}>Submit</button>
        </div>
    )
}

export default AddCompany
