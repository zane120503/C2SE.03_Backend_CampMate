const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    user_name: {
      type: String,
      required: true,
      unique: true,
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
      select: true // do not return password in response
    },
    first_name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50
    },
    last_name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50
    },
    phone_number: String,
    addresses: {
      type: [String],  // Array of strings
      default: []  // Default is an empty array
    },
    profileImage: {  // New field for profile image
      type: String,
      default: null // Default to null if not set
    },
    addresses: {
      type: [String],  // Array of strings
      default: []  // Default is an empty array
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Users', userSchema);