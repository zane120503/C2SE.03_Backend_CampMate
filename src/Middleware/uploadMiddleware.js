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

// Configure multer storage with Cloudinary for campsite images
const campsiteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Campsites',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 600, crop: "fill" }]
    }
});

// Configure multer storage with Cloudinary for category images
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'CategoryCampGo',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 400, height: 400, crop: "fill" }]
    }
});

// Configure multer storage with Cloudinary for product images
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ProductCampGo',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: "limit" }]
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
    // Kiểm tra mimetype
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png)'), false);
    }
};

const uploadProfile = multer({
    storage: profileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadCampsite = multer({
    storage: campsiteStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Giới hạn tối đa 10 ảnh
    }
});

const uploadCategory = multer({
    storage: categoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadProduct = multer({
    storage: productStorage,
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

module.exports = { uploadProfile, uploadCampsite, uploadCategory, uploadProduct, uploadReview }; 