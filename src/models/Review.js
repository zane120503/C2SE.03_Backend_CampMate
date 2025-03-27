const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    images: {
        type: [String],
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
