const orderService = require("../services/orderService");
const asyncHandler = require('express-async-handler');

const orderController = {
  // Tạo đơn hàng mới
  createOrder: asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { paymentMethod, selectedProducts } = req.body;
      
      // Gọi hàm tạo đơn hàng từ OrderService
      const order = await orderService.createOrder({
        userId,
        paymentMethod,
        selectedProducts
      });

      // Trả về đơn hàng đã tạo
      res.status(201).json({
        success: true,
        message: 'Đơn hàng đã được tạo thành công',
        order
      });
    } catch (error) {
      // Xử lý lỗi và gửi phản hồi
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi trong quá trình tạo đơn hàng',
      });
      console.log(error);
    }
  }),

  // Cập nhật đơn hàng
  updateOrder: async (req, res) => {
    try {
      orderService.updateOrder(req.body, (error, result) => {
        if (error) {
          res.status(500).json({ message: "Lỗi máy chủ" });
        } else {
          res.status(200).send({
            message: "Đơn hàng đã được cập nhật thành công",
            data: result,
          });
        }
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  // Lấy đơn hàng theo ID người dùng
  getOrdersByUserId: async (req, res) => {
    try {
      const userId = req.user.id; // Giả sử ID người dùng có sẵn trong req.user
      console.log("ID người dùng:", userId); // Ghi log ID người dùng để debug
      const orders = await orderService.getOrdersByUserId(userId); // Gọi hàm service

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào cho người dùng này' });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy đơn hàng thành công',
        data: orders
      });
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
  },

  // Xóa đơn hàng
  deleteOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const result = await orderService.deleteOrder(orderId);
      res.status(200).json({ success: true, message: "Đơn hàng đã được xóa thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      res.status(500).json({ message: error.message || "Lỗi máy chủ" });
    }
  },

  // Lấy đơn hàng đã giao
  getDeliveredOrders: async (req, res) => {
    try {
      const deliveredOrders = await orderService.getAllOrders({ status: 'Delivered' });
      
      if (!deliveredOrders.orders || deliveredOrders.orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng đã giao"
        });
      }
  
      res.status(200).json({
        success: true,
        count: deliveredOrders.orders.length,
        data: deliveredOrders.orders
      });
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng đã giao:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi lấy đơn hàng đã giao",
        error: error.message
      });
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);
      
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi máy chủ khi lấy thông tin đơn hàng"
      });
    }
  },

  // Lấy tất cả đơn hàng
  getAllOrders: async (req, res) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
      });
    }
  },

  // Xác nhận đơn hàng đã giao
  confirmDelivery: async (req, res) => {
    try {
      const { orderId } = req.params;
      const updatedOrder = await orderService.confirmDelivery(orderId);
      
      res.status(200).json({
        success: true,
        message: 'Xác nhận giao hàng thành công',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Lỗi khi xác nhận giao hàng:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi xác nhận giao hàng'
      });
    }
  },

  // Xử lý trả hàng/hoàn tiền
  returnOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const updatedOrder = await orderService.returnOrder(orderId);
      
      res.status(200).json({
        success: true,
        message: 'Xử lý trả hàng thành công',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Lỗi khi xử lý trả hàng:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi xử lý trả hàng'
      });
    }
  }
};

module.exports = orderController; 