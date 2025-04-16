const mongoose = require('mongoose');

const campsiteSchema = new mongoose.Schema({
    campsiteName: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageURL: {
        type: String,
        required: true
    },
    facilities: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewLocation'
    }],
    priceRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    contactInfo: {
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        website: {
            type: String,
            trim: true
        }
    },
    openingHours: {
        open: String,
        close: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campsite', campsiteSchema); 