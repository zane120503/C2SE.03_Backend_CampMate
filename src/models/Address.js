const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'Users'
    },
    street: {
        type: String,
        required: true
    },
    ward: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: "Vietnam"
    },
    zipCode: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
