
const aws = require("aws-sdk");
require("dotenv").config();
const process = require("process");

const region = "us-east-1"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = "moon-images";

// connect to s3 with credentials
const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion : "v4"
});

async function generateUploadURL() {

    const imageName = "" + Math.ceil(Math.random() * 100000);
    const params = ({
        Bucket : bucketName,
        Key : imageName,
        Expires: 60 //url expires after 60s
    });

    const uploadURLPromise = await s3.getSignedUrlPromise ('putObject', params);
    return uploadURLPromise;
}


module.exports = {generateUploadURL};


