const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../Config/cloudinary');

// Configure multer storage with Cloudinary for profile images
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'UserImageProfileCampGo',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 150, height: 150, crop: "fill" }]
    }
});

// Configure multer storage with Cloudinary for review images
const reviewStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'reviewProductCampGo',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: "limit" }]
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const uploadProfile = multer({
    storage: profileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadReview = multer({
    storage: reviewStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = { uploadProfile, uploadReview }; 