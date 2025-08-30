// cloudinary.js
const cloudinary = require('cloudinary').v2;
// Corrected import: 'multer-storage-cloudinary' is the widely used package name
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure dotenv is loaded if this file is run independently or before app.js
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'WanderlustChatApp', // Specify a folder in your Cloudinary account
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'], // Allowed formats for uploads
        // You can add more params here, e.g., transformation for images
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

module.exports = {
    cloudinary,
    storage
};
