const Users = require('../models/Users');
const Campsite = require('../models/Campsite');
const transporter = require('../Config/nodemailer');
const cloudinary = require('../Config/cloudinary');

const campsiteOwnerController = {
    // Yêu cầu trở thành CampsiteOwner
    requestCampsiteOwner: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await Users.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            if (user.isCampsiteOwner) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã là CampsiteOwner'
                });
            }

            // Kiểm tra trạng thái yêu cầu trước đó
            if (user.campsiteOwnerRequest) {
                if (user.campsiteOwnerRequest.status === 'pending') {
                    return res.status(400).json({
                        success: false,
                        message: 'Bạn đã có yêu cầu đang chờ xử lý'
                    });
                }
                
                if (user.campsiteOwnerRequest.status === 'rejected') {
                    // Kiểm tra thời gian từ lần từ chối cuối
                    const lastRejectionDate = new Date(user.campsiteOwnerRequest.responseDate);
                    const now = new Date();
                    const daysSinceRejection = Math.floor((now - lastRejectionDate) / (1000 * 60 * 60 * 24));

                    if (daysSinceRejection < 7) { // Chờ 7 ngày sau khi bị từ chối
                        return res.status(400).json({
                            success: false,
                            message: `Bạn cần đợi thêm ${7 - daysSinceRejection} ngày nữa để gửi yêu cầu mới`
                        });
                    }
                }
            }

            // Cập nhật trạng thái thành pending
            user.campsiteOwnerRequest = {
                status: 'pending',
                requestDate: new Date()
            };

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Yêu cầu trở thành CampsiteOwner đã được gửi'
            });
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    },

    // Admin xem danh sách yêu cầu
    getOwnerRequests: async (req, res) => {
        try {
            const requests = await Users.find({
                'campsiteOwnerRequest.status': 'pending'
            }).select('-password');

            res.status(200).json({
                success: true,
                data: requests
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu cầu:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    },

    // Admin xử lý yêu cầu
    handleOwnerRequest: async (req, res) => {
        try {
            const { userId, action } = req.body;
            const user = await Users.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            if (user.campsiteOwnerRequest.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Yêu cầu này đã được xử lý'
                });
            }

            const emailSubject = action === 'approve' 
                ? 'Yêu cầu trở thành CampsiteOwner đã được chấp thuận'
                : 'Yêu cầu trở thành CampsiteOwner đã bị từ chối';

            // Message cố định cho từng trường hợp
            const fixedMessage = action === 'approve'
                ? 'Chúng tôi đã xem xét hồ sơ của bạn và quyết định chấp thuận yêu cầu trở thành CampsiteOwner. Bạn có thể đăng nhập và bắt đầu quản lý các khu cắm trại của mình ngay bây giờ.'
                : 'Chúng tôi đã xem xét hồ sơ của bạn và quyết định từ chối yêu cầu trở thành CampsiteOwner. Vui lòng cập nhật thông tin và gửi lại yêu cầu sau 7 ngày.';

            // Template email HTML
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #2c3e50;">CampMate</h2>
                    </div>
                    <div style="background-color: ${action === 'approve' ? '#e8f5e9' : '#ffebee'}; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: ${action === 'approve' ? '#2e7d32' : '#c62828'}; margin-top: 0;">
                            ${action === 'approve' ? 'Yêu cầu của bạn đã được chấp thuận!' : 'Yêu cầu của bạn đã bị từ chối'}
                        </h3>
                        <p style="color: #333; line-height: 1.6;">
                            Xin chào ${user.user_name},
                        </p>
                        <p style="color: #333; line-height: 1.6;">
                            ${fixedMessage}
                        </p>
                    </div>
                    ${action === 'approve' ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Đăng nhập ngay
                        </a>
                    </div>
                    ` : ''}
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            `;

            // Gửi email thông báo cho người dùng
            await transporter.sendMail({
                from: process.env.EMAIL_SENDER,
                to: user.email,
                subject: emailSubject,
                html: emailContent
            });

            // Cập nhật trạng thái yêu cầu
            user.campsiteOwnerRequest = {
                status: action === 'approve' ? 'approved' : 'rejected',
                requestDate: user.campsiteOwnerRequest.requestDate,
                responseDate: new Date(),
                responseMessage: fixedMessage
            };

            if (action === 'approve') {
                user.isCampsiteOwner = true;
            }

            await user.save();

            res.status(200).json({
                success: true,
                message: action === 'approve' 
                    ? 'Đã chấp thuận yêu cầu'
                    : 'Đã từ chối yêu cầu'
            });
        } catch (error) {
            console.error('Lỗi khi xử lý yêu cầu:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    },

    // Lấy danh sách campsite của owner
    getOwnerCampsites: async (req, res) => {
        try {
            const userId = req.user.id;
            const campsites = await Campsite.find({ owner: userId });

            res.status(200).json({
                success: true,
                data: campsites
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách campsite:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    },

    // Thêm campsite mới
    createCampsite: async (req, res) => {
        try {
            const { 
                campsiteName, 
                location, 
                latitude, 
                longitude, 
                description, 
                facilities = [],
                priceRange,
                contactInfo,
                openingHours
            } = req.body;
            
            // Validate required fields
            if (!campsiteName || !location || !latitude || !longitude || !description) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Missing required fields: campsiteName, location, latitude, longitude, description' 
                });
            }

            // Check if campsite name already exists
            const existingCampsite = await Campsite.findOne({ campsiteName });
            if (existingCampsite) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Campsite name already exists' 
                });
            }

            // Handle multiple images upload
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'At least one image is required' 
                });
            }

            // Upload all images to Cloudinary
            const imagePromises = req.files.map(file => cloudinary.uploader.upload(file.path));
            const imageResults = await Promise.all(imagePromises);

            // Prepare images array for database
            const images = imageResults.map(result => ({
                url: result.secure_url,
                public_id: result.public_id
            }));

            // Xử lý facilities: nếu là string thì parse sang array
            let facilitiesData = facilities;
            if (typeof facilitiesData === 'string') {
                try {
                    facilitiesData = JSON.parse(facilitiesData);
                } catch (e) {
                    facilitiesData = [];
                }
            }
            // Nếu là mảng lồng mảng thì lấy phần tử đầu tiên
            if (Array.isArray(facilitiesData) && facilitiesData.length === 1 && Array.isArray(facilitiesData[0])) {
                facilitiesData = facilitiesData[0];
            }

            const campsite = new Campsite({
                campsiteName,
                location,
                latitude: Number(latitude),
                longitude: Number(longitude),
                description,
                facilities: facilitiesData,
                images,
                priceRange: priceRange ? {
                    min: Number(priceRange.min),
                    max: Number(priceRange.max)
                } : undefined,
                contactInfo: contactInfo ? {
                    phone: contactInfo.phone,
                    email: contactInfo.email,
                    website: contactInfo.website
                } : undefined,
                openingHours: openingHours ? {
                    open: openingHours.open,
                    close: openingHours.close
                } : undefined,
                owner: req.user.id
            });

            await campsite.save();
            res.status(201).json({ 
                success: true,
                message: 'Campsite created successfully',
                data: campsite
            });
        } catch (error) {
            console.error('Create campsite error:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Server error' 
            });
        }
    },

    // Cập nhật campsite
    updateCampsite: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                campsiteName, 
                location, 
                latitude, 
                longitude, 
                description, 
                facilities,
                priceRange,
                contactInfo,
                openingHours
            } = req.body;

            const campsite = await Campsite.findById(id);
            
            if (!campsite) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Campsite not found' 
                });
            }

            // Kiểm tra quyền sở hữu
            if (campsite.owner.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền sửa campsite này'
                });
            }

            // Check if new campsite name already exists
            if (campsiteName && campsiteName !== campsite.campsiteName) {
                const existingCampsite = await Campsite.findOne({ campsiteName });
                if (existingCampsite) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Campsite name already exists' 
                    });
                }
            }

            // Handle images update if new images are uploaded
            if (req.files && req.files.length > 0) {
                // Delete old images from Cloudinary
                const deletePromises = campsite.images.map(image => 
                    cloudinary.uploader.destroy(image.public_id)
                );
                await Promise.all(deletePromises);

                // Upload new images
                const imagePromises = req.files.map(file => 
                    cloudinary.uploader.upload(file.path)
                );
                const imageResults = await Promise.all(imagePromises);

                // Update images array
                campsite.images = imageResults.map(result => ({
                    url: result.secure_url,
                    public_id: result.public_id
                }));
            }

            // Update other fields
            if (campsiteName) campsite.campsiteName = campsiteName;
            if (location) campsite.location = location;
            if (latitude) campsite.latitude = Number(latitude);
            if (longitude) campsite.longitude = Number(longitude);
            if (description) campsite.description = description;

            // Khi cập nhật campsite
            let facilitiesUpdate = facilities;
            if (typeof facilitiesUpdate === 'string') {
                try {
                    facilitiesUpdate = JSON.parse(facilitiesUpdate);
                } catch (e) {
                    facilitiesUpdate = [];
                }
            }
            // Nếu là mảng lồng mảng thì lấy phần tử đầu tiên
            if (Array.isArray(facilitiesUpdate) && facilitiesUpdate.length === 1 && Array.isArray(facilitiesUpdate[0])) {
                facilitiesUpdate = facilitiesUpdate[0];
            }
            if (facilities) campsite.facilities = facilitiesUpdate;
            
            if (priceRange) {
                campsite.priceRange = {
                    min: Number(priceRange.min),
                    max: Number(priceRange.max)
                };
            }
            
            if (contactInfo) {
                campsite.contactInfo = {
                    phone: contactInfo.phone,
                    email: contactInfo.email,
                    website: contactInfo.website
                };
            }
            
            if (openingHours) {
                campsite.openingHours = {
                    open: openingHours.open,
                    close: openingHours.close
                };
            }

            campsite.updatedAt = Date.now();
            await campsite.save();
            
            res.json({ 
                success: true,
                message: 'Campsite updated successfully',
                data: campsite
            });
        } catch (error) {
            console.error('Update campsite error:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Server error' 
            });
        }
    },

    // Xóa campsite
    deleteCampsite: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Đang xóa campsite với ID:', id);
            console.log('User ID:', req.user.id);
            
            const campsite = await Campsite.findById(id);
            console.log('Tìm thấy campsite:', campsite ? 'Có' : 'Không');
            
            if (!campsite) {
                console.log('Không tìm thấy campsite với ID:', id);
                return res.status(404).json({ 
                    success: false,
                    message: 'Campsite not found' 
                });
            }

            // Kiểm tra quyền sở hữu
            console.log('Owner ID:', campsite.owner.toString());
            console.log('User ID:', req.user.id);
            console.log('Is Admin:', req.user.isAdmin);
            
            if (campsite.owner.toString() !== req.user.id && !req.user.isAdmin) {
                console.log('Không có quyền xóa campsite');
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa campsite này'
                });
            }

            // Delete all images from Cloudinary
            console.log('Đang xóa hình ảnh từ Cloudinary...');
            const deletePromises = campsite.images.map(image => 
                cloudinary.uploader.destroy(image.public_id)
            );
            await Promise.all(deletePromises);
            console.log('Đã xóa hình ảnh thành công');

            // Delete campsite from database
            console.log('Đang xóa campsite từ database...');
            await Campsite.findByIdAndDelete(id);
            console.log('Đã xóa campsite thành công');
            
            res.json({ 
                success: true,
                message: 'Campsite deleted successfully' 
            });
        } catch (error) {
            console.error('Delete campsite error:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Server error' 
            });
        }
    },

    // Thay đổi trạng thái campsite
    toggleCampsiteStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const campsite = await Campsite.findById(id);
            
            if (!campsite) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Campsite not found' 
                });
            }

            // Kiểm tra quyền sở hữu
            if (campsite.owner.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền thay đổi trạng thái campsite này'
                });
            }

            campsite.isActive = !campsite.isActive;
            campsite.updatedAt = Date.now();
            await campsite.save();

            res.json({ 
                success: true,
                message: `Campsite ${campsite.isActive ? 'activated' : 'deactivated'} successfully`,
                data: {
                    isActive: campsite.isActive
                }
            });
        } catch (error) {
            console.error('Toggle campsite status error:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Server error' 
            });
        }
    }
};

module.exports = campsiteOwnerController; 