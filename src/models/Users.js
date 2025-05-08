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
      match: [/\S+@\S+\.\S+/, 'Vui lòng nhập email hợp lệ']
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
      match: [/^[0-9]{10}$/, 'Vui lòng nhập số điện thoại 10 chữ số']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false,
      default: 'male'
    },
    profileImage: {
      url: {
        type: String,
        default: null
      },
      public_id: {
        type: String,
        default: null
      }
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
      default: '0',
    },
    isProfileCompleted: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isCampsiteOwner: {
      type: Boolean,
      default: false
    },
    campsiteOwnerRequest: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null
      },
      requestDate: {
        type: Date,
        default: null
      },
      responseDate: {
        type: Date,
        default: null
      },
      responseMessage: {
        type: String,
        default: null
      }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Thêm các phương thức và middleware cần thiết
userSchema.pre('save', function(next) {
  // Kiểm tra nếu first_name, last_name, phone_number và gender đã được điền
  if (this.first_name && this.last_name && this.phone_number && this.gender) {
    this.isProfileCompleted = true;
  }
  next();
});

module.exports = mongoose.model('Users', userSchema);