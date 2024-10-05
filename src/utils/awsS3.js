import dotenv from "dotenv";
import fs from "fs/promises"; // Use fs/promises for promise-based API
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Load environment variables from .env file
dotenv.config();

// Path to the image file
const imgPath = "./src/utils/chatterBox.png"; // Use the correct relative path

// Create S3 client with credentials
const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1', // Use environment variable for region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const main = async () => {
    try {
        const img = await fs.readFile(imgPath); // Read the file asynchronously

        const command = new PutObjectCommand({
            Bucket: "fyp2025", // Use environment variable for bucket name
            Key: "hello-s4.png",
            Body: img,
        });

        const response = await client.send(command);
        console.log("Upload Success:", response);
    } catch (err) {
        console.error("Error uploading file:", err);
    }
};

// Call the main function
main();
