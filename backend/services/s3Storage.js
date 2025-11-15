const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Upload file to S3
 */
async function uploadToS3(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: 'application/pdf',
      ServerSideEncryption: 'AES256'
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ [S3] File uploaded: ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error('❌ [S3] Upload failed:', error);
    throw error;
  }
}

/**
 * Get signed URL for file access
 */
async function getSignedUrl(key, expiresIn = 3600) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('❌ [S3] Signed URL generation failed:', error);
    throw error;
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log(`✅ [S3] File deleted: ${key}`);
  } catch (error) {
    console.error('❌ [S3] Delete failed:', error);
    throw error;
  }
}

module.exports = {
  uploadToS3,
  getSignedUrl,
  deleteFromS3
};

