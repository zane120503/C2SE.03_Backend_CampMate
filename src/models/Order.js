const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  total_amount: {
    type: Number,
    required: true
  },
  shipping_fee: {
    type: Number,
    default: 10
  },
  transaction_id: {
    type: String,
    default: null
  },
  waiting_confirmation: {
    type: Boolean,
    default: false
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  delivery_status: {
    type: String,
    enum: ['Pending','Shipping', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  shipping_address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  payment_method: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 