const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const transporter = require('../Config/nodemailer');
const authController = {
  register: async (req, res) => {
    const { user_name, email, password } = req.body;

    if (!user_name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }
    try {
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new Users({
        user_name,
        email,
        password: hashedPassword,
      });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });


      try {
        console.log("Attempting to send email to:", email);
        const mailOptions = {
          from: `CampGo <${process.env.EMAIL_SENDER}>`,
          to: email,
          subject: "Welcome to CampGo App",
          text: `Hello ${user_name},\n\nThank you for registering on CampGo App!`,
        }
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return res.json({ 
          success: true, 
          message: "User registered and verification email sent",
          emailSent: true,
          token: token,
          user: {
            _id: user._id,
            user_name: user.user_name,
            email: user.email
          }
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Still return success for registration but indicate email failure
        return res.json({ 
          success: true, 
          message: "User registered but failed to send verification email",
          emailSent: false,
          emailError: emailError.message,
          token: token,
          userId: user._id
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      return res
        .status(500)
        .json({ 
          success: false, 
          message: "Internal server error", 
          error: error.message 
        });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email ||!password) {
      return res
       .status(400)
       .json({ success: false, message: "Please enter email and password" });
    }
    try{
      const user = await Users.findOne({ email });
      if (!user) {
        return res
         .status(404)
         .json({ success: false, message: "User not found" });
      }

      // Check if account is verified
      if (!user.isAccountVerified) {
        return res
         .status(403)
         .json({ 
           success: false, 
           message: "Please verify your account before logging in",
           needsVerification: true,
           userId: user._id
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
         .status(400)
         .json({ success: false, message: "Incorrect password" });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      
      // Return token in response body instead of using cookies
      return res.json({ 
        success: true, 
        message: "Login success",
        token: token,
        user: {
          _id: user._id,
          user_name: user.user_name,
          email: user.email,
          isAccountVerified: user.isAccountVerified,
          isProfileCompleted: user.isProfileCompleted
        }
      });
    }catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  logout: async (req, res) => {
    // For mobile apps, logout is typically handled client-side
    // by removing the stored token
    try {
      return res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  sendVerifyOTP: async (req, res) => {
    try {
      // Get userId from authenticated user (will be set by auth middleware)
      const userId = req.user.id;

      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if(user.isAccountVerified) {
        return res.status(400).json({ success: false, message: "User already verified" });
      }

      // Fix the string function error
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
      await user.save();

      const mailOptions = {
        from: `CampGo <${process.env.EMAIL_SENDER}>`,
        to: user.email,
        subject: "Verify your email address",
        html: `<h2>Your OTP code is ${otp}</h2>`,
      };
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("OTP sending error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  verifyEmail: async (req, res) => {
      const { otp } = req.body;
      const userId = req.user.id;

      if(!otp) {
        return res.status(400).json({ success: false, message: "Please provide OTP" });
      }
      try{
        const user = await Users.findById(userId);
        if(!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        if(user.verifyOtp !== otp || user.verifyOtp === '') {
          return res.status(400).json({ success: false, message: "Incorrect OTP" });
        }
        if(user.verifyOtpExpireAt < Date.now()) {
          return res.status(400).json({ success: false, message: "OTP expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: "Email verified successfully" });
      }catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
  },

  isAuthenticated: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.json({ success: true, user });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  sendResetOTP: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide email" });
    }
    try {
      const user = await Users.findOne({ email });

        if(!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        const mailOptions = {
          from: `CampGo <${process.env.EMAIL_SENDER}>`,
          to: user.email,
          subject: "Password Reset OTP",
          html: `<h2>Your OTP for resetting password is ${otp}</h2>`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({ 
          success: true, 
          message: "OTP sent successfully",
          email: user.email // Trả về email để sử dụng ở bước tiếp theo
        });
    } catch (error) {
      console.error("Reset OTP sending error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  verifyResetOTP: async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP" });
    }
    
    try {
      const user = await Users.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      if (user.resetOtp !== otp || user.resetOtp === '') {
        return res.status(400).json({ success: false, message: "Incorrect OTP" });
      }
      
      if (user.resetOtpExpireAt < Date.now()) {
        return res.status(400).json({ success: false, message: "OTP expired" });
      }
      
      // Tạo token tạm thời để reset mật khẩu
      const resetToken = jwt.sign(
        { id: user._id, resetPassword: true }, 
        process.env.JWT_SECRET, 
        { expiresIn: '10m' }
      );
      
      return res.json({ 
        success: true, 
        message: "OTP verified successfully", 
        resetToken
      });
      
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  resetPassword: async (req, res) => {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide new password" 
      });
    }

    try {
      const userId = req.user.id;
      const user = await Users.findById(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Mã hóa mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Cập nhật mật khẩu và xóa OTP
      user.password = hashedPassword;
      user.resetOtp = '';
      user.resetOtpExpireAt = 0;
  
      await user.save();
      
      return res.json({ success: true, message: "Password reset successfully" });
      
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};
module.exports = authController;