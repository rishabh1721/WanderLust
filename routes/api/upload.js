// routes/api/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { isLoggedIn } = require('../../middleware'); // Assuming your isLoggedIn middleware path

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'wanderlust/message_attachments', // Specific folder for message attachments
      format: file.mimetype.startsWith('image') ? 'jpeg' : undefined, // Optional: Force format for images
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mov', 'webp'], // Broaden allowed types
      resource_type: file.mimetype.startsWith('image') ? 'image' : (file.mimetype.startsWith('video') ? 'video' : 'raw'), // Differentiate image, video, raw
      public_id: `attachment-${Date.now()}-${Math.round(Math.random() * 1E9)}`, // Unique public ID
    };
  },
});

// Initialize Multer with the Cloudinary storage
const upload = multer({ storage });

// POST route for file upload
router.post('/file', isLoggedIn, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  res.status(200).json({
    success: true,
    url: req.file.path, // The secure URL from Cloudinary
    filename: req.file.originalname, // Original filename (corrected from originalName to originalname)
    fileSize: req.file.size, // Size in bytes
    resourceType: req.file.resource_type // 'image', 'video', 'raw'
  });
});

module.exports = router;
