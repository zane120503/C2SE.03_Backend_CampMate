const Order = require('../models/Order');
const Users = require('../models/Users');
const Product = require('../models/Products');
const Campsite = require('../models/Campsite');

const adminDashboardController = {
    // Lấy thống kê tổng quan
    getDashboardStats: async (req, res) => {
        try {
            // Tổng doanh thu từ đơn hàng hoàn thành
            const totalRevenue = await Order.aggregate([
                {
                    $match: {
                        payment_status: 'Completed',
                        delivery_status: 'Delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total_amount' }
                    }
                }
            ]);

            // Tổng số user
            const totalUsers = await Users.countDocuments();

            // Tổng số sản phẩm
            const totalProducts = await Product.countDocuments();

            // Tổng số địa điểm cắm trại
            const totalCampsites = await Campsite.countDocuments();

            // Thống kê đơn hàng theo tháng
            const monthlyOrders = await Order.aggregate([
                {
                    $match: {
                        payment_status: 'Completed',
                        delivery_status: 'Delivered'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: '$total_amount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // Thống kê đơn hàng theo trạng thái
            const orderStatusStats = await Order.aggregate([
                {
                    $group: {
                        _id: '$delivery_status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Thống kê đơn hàng theo phương thức thanh toán
            const paymentMethodStats = await Order.aggregate([
                {
                    $group: {
                        _id: '$payment_method',
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    totalUsers,
                    totalProducts,
                    totalCampsites,
                    monthlyStats: monthlyOrders.map(item => ({
                        month: `${item._id.year}-${item._id.month}`,
                        total: item.total,
                        count: item.count
                    })),
                    orderStatusStats,
                    paymentMethodStats
                }
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    },

    // Lấy thống kê chi tiết theo tháng
    getMonthlyStats: async (req, res) => {
        try {
            const { year } = req.query;
            const currentYear = year || new Date().getFullYear();

            const monthlyStats = await Order.aggregate([
                {
                    $match: {
                        payment_status: 'Completed',
                        delivery_status: 'Delivered',
                        createdAt: {
                            $gte: new Date(currentYear, 0, 1),
                            $lt: new Date(currentYear + 1, 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: '$total_amount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.month': 1 }
                }
            ]);

            res.status(200).json({
                success: true,
                data: monthlyStats.map(item => ({
                    month: `${item._id.year}-${item._id.month}`,
                    total: item.total,
                    count: item.count
                }))
            });
        } catch (error) {
            console.error('Monthly stats error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
};

module.exports = adminDashboardController;
