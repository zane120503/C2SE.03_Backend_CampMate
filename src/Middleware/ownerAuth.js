const Users = require('../models/Users');

const ownerAuth = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        if (!user.isCampsiteOwner && !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng ký làm Campsite Owner.'
            });
        }

        // Thêm thông tin user vào request để sử dụng ở các middleware tiếp theo
        req.user.isCampsiteOwner = user.isCampsiteOwner;
        req.user.isAdmin = user.isAdmin;
        
        next();
    } catch (error) {
        console.error('Lỗi xác thực owner:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server'
        });
    }
};

module.exports = ownerAuth;
