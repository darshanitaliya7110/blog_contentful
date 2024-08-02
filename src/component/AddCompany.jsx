"use client"

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react'



const AddCompany = () => {
    const content_type_id = "company"
    const [companyName, setCompanyName] = useState('');
    const [companyDetails, setCompanyDetails] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [companyList, setCompanyList] = useState()
    const [imageFile, setImageFile] = useState(null);
    const getData = useCallback(async () => {
        const companyData = await axios.get("https://cdn.contentful.com/spaces/sag2zffdzoog/environments/master/entries?access_token=LWHqjbuG8vxkdRuuOQW-69kBB_4UTa8Ly5Q1NdjGuho&content_type=company", {
            headers: {
                Authorization: `Bearer ${process.env.SPACE_ID}`
            }
        })

        setCompanyList(companyData.data.items)
    }, [])

    useEffect(() => {
        getData()
    }, [getData])

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
    const handleImageChange = async (e) => {
        setImageFile(e.target.files[0]);
    };

    const addImage = async () => {
        try {
            // Upload the file as binary to get an upload URL
            const uploadResponse = await axios.post(
                `https://upload.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/uploads`,
                imageFile,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        'Content-Type': 'application/octet-stream',
                    },
                }
            );


            const uploadUrl = uploadResponse.data.sys.id;

            // Create the asset with the upload URL
            const assetData = {
                fields: {
                    title: {
                        "en-US": imageFile.name
                    },
                    file: {
                        "en-US": {
                            "contentType": imageFile.type,
                            "fileName": imageFile.name,
                            "uploadFrom": {
                                "sys": {
                                    "type": "Link",
                                    "linkType": "Upload",
                                    "id": uploadUrl
                                }
                            }
                        }
                    }
                }
            };

            const assetResponse = await axios.post(
                `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/assets`,
                assetData,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        'Content-Type': 'application/vnd.contentful.management.v1+json',
                    },
                }
            );

            const assetId = assetResponse.data.sys.id;

            // Process and publish the asset
            await processAndPublishAsset(assetId);

            return assetId;

        } catch (error) {
            console.error("Error uploading image to Contentful:", error);
        }
    }

    const handleRemoveDetail = (index) => {
        const newDetails = companyDetails.filter((_, i) => i !== index);
        setCompanyDetails(newDetails);
    };

    const handleSubmit = async () => {
        if (companyName.trim() === 0 || companyDetails.length === 0) {
            return
        }

        try {
            // Add review to Contentful
            let tempImageId = ""
            if (imageFile) {
                if (imageFile) {
                    tempImageId = await addImage(imageFile);
                }
            }


            const reviewData = {
                fields: {
                    companyName: { "en-US": companyName },
                    company: { "en-US": companyDetails },
                    ...(tempImageId.length > 0 && {
                        image: {
                            "en-US": {
                                sys: {
                                    type: "Link",
                                    linkType: "Asset",
                                    id: tempImageId,
                                },
                            },
                        },
                    }),
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

            getData()

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

    const processAndPublishAsset = async (assetId) => {
        try {
            // Process the asset
            await axios.put(
                `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/assets/${assetId}/files/en-US/process`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                    },
                }
            );

            // Wait for the asset to be processed
            let assetProcessed = false;
            while (!assetProcessed) {
                const asset = await axios.get(
                    `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/assets/${assetId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        },
                    }
                );

                assetProcessed = asset.data.fields.file['en-US'].url !== undefined;
            }

            // Get the latest version of the asset
            const asset = await axios.get(
                `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/assets/${assetId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                    },
                }
            );

            const assetVersion = asset.data.sys.version;

            // Publish the asset
            await axios.put(
                `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_SPACE_ID}/environments/master/assets/${assetId}/published`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MANAGMENT_ACCESS_TOKEN}`,
                        'X-Contentful-Version': assetVersion,
                    },
                }
            );

        } catch (error) {
            console.error("Error processing and publishing asset:", error);
        }
    };


    return (
        <>
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
                <div>
                    <label htmlFor="imageFile">Image</label>
                    <br />
                    <input
                        id="imageFile"
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
                <button onClick={() => handleSubmit()}>Submit</button>
                {/* <button onClick={() => addImage()}>Addimage</button> */}
            </div>
            {companyList?.length > 0 && <div>

                <ul>
                    {companyList.map((item) => <li key={item.sys.id}>{item.fields.companyName}</li>)}
                </ul>
            </div>}
        </>
    )
}

export default AddCompany
