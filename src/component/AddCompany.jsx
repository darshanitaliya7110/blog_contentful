"use client"

import React, { useEffect } from 'react'
import { createClient } from 'contentful';

const AddCompany = () => {
    const name = "company1"
    const data = ["a1", "a2"]

    useEffect(() => {
        const client = createClient({
            space: "sag2zffdzoog",
            accessToken: 'CFPAT-yzCDk2omcCuM77l0oSYpYHycYa4xsmAn8QCFIKhkPdA'
        })

        // Create content type
        client.getSpace('sag2zffdzoog')
            .then((space) => space.getEnvironment('master'))
            .then((environment) => environment.createContentType({
                name: 'Blog Post',
                fields: [
                    {
                        id: 'title',
                        name: 'Title',
                        required: true,
                        localized: false,
                        type: 'Text'
                    }
                ]
            }))
            .then((contentType) => console.log(contentType))
            .catch(console.error)
    }, [])

    return (
        <div>
            company
        </div>
    )
}

export default AddCompany
