const jwt = require('jsonwebtoken');

const resetPasswordAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No reset token, authorization denied' });
    }
    
    // Extract token from "Bearer <token>"
    const resetToken = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    // Check if token is for password reset
    if (!decoded.resetPassword) {
      return res.status(401).json({ success: false, message: 'Invalid reset token' });
    }
    
    // Add user from payload to request object
    req.user = { id: decoded.id, resetPassword: true };
    
    next();
  } catch (error) {
    console.error('Reset token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Reset token expired' });
    }
    return res.status(401).json({ success: false, message: 'Reset token is not valid' });
  }
};

module.exports = resetPasswordAuth;