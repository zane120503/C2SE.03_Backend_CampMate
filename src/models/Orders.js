const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shipping_address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    payment_method: {
        type: String,
        enum: ['cash_on_delivery', 'credit_card'],
        required: true
    },
    card_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
    },
    subtotal: {
        type: Number,
        required: true
    },
    shipping_fee: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    delivery_status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
