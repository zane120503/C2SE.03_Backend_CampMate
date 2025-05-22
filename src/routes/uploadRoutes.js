const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../Config/cloudinary');

// Cấu hình storage cho chat images
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage: chatImageStorage });

// API upload ảnh chat group
router.post('/upload-chat-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Trả về url ảnh
    return res.json({ success: true, url: req.file.path });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 