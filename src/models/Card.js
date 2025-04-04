const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    card_name: {
        type: String,
        required: true,
        trim: true
    },
    card_number: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{16}$/
    },
    card_exp_month: {
        type: String,
        required: true,
        match: /^(0[1-9]|1[0-2])$/
    },
    card_exp_year: {
        type: String,
        required: true,
        match: /^[0-9]{2}$/
    },
    card_cvc: {
        type: String,
        required: true,
        match: /^[0-9]{3,4}$/
    },
    is_default: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', CardSchema);
