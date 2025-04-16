const mongoose = require('mongoose');

const reviewLocationSchema = new mongoose.Schema({
    campsite_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Ensure one review per user per campsite
reviewLocationSchema.index({ campsite_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ReviewLocation', reviewLocationSchema); 