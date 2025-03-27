const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            quantity: { 
                type: Number, 
                min: 1, 
                default: 1 
            },
            price: { 
                type: Number, 
                min: 0 
            },
            total: { 
                type: Number, 
                min: 0 
            },
            discount: { 
                type: Number, 
                min: 0, 
                max: 100, 
                default: 0 
            },
            addedAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    cartTotal: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
