const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    user_name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    first_name: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50
    },
    last_name: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50
    },
    phone_number: {
      type: String,
      required: false,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false
    },
    profileImage: {
      type: String,
      default: null
    },
    verifyOtp: {
      type: String,
      default: ''
    },
    verifyOtpExpireAt: {
      type: Number,
      default: 0
    },
    isAccountVerified: {
      type: Boolean,
      default: false
    },
    resetOtp: {
      type: String,
      default: '',
    },
    resetOtpExpireAt: {
      type: String,
      default: 0,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Users', userSchema);