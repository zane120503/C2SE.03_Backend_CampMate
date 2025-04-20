const mongoose = require('mongoose');

const campsiteSchema = new mongoose.Schema({
    campsiteName: {
        type: String,
        required: [true, 'Campsite name is required'],
        trim: true,
        unique: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required']
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    facilities: [{
        type: String,
        trim: true
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
            required: [true, 'Minimum price is required']
        },
        max: {
            type: Number,
            required: [true, 'Maximum price is required']
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
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campsite', campsiteSchema); 