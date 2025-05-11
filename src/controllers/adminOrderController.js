const Order = require('../models/Order');
const Users = require('../models/Users');
const transporter = require('../Config/nodemailer');

exports.getAllOrders = async (req, res) => {
  try {
    const { delivery_status, payment_status } = req.query;
    let query = {};

    // Thêm điều kiện lọc nếu có
    if (delivery_status) {
      query.delivery_status = delivery_status;
    }
    if (payment_status) {
      query.payment_status = payment_status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'user_id',
        model: 'Users',
        select: 'name email'
      })
      .populate('shipping_address')
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        model: 'Users',
        select: 'name email'
      })
      .populate('shipping_address')
      .populate('products.product', 'name price image description');
      
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { waiting_confirmation } = req.body;
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        model: 'Users',
        select: 'name email'
      });
      
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let shouldSendEmail = false;
    if (typeof waiting_confirmation === 'boolean') {
      // Kiểm tra nếu trạng thái chuyển từ false sang true (đơn hàng mới được xác nhận)
      if (waiting_confirmation === true && order.waiting_confirmation === false) {
        shouldSendEmail = true;
      }
      order.waiting_confirmation = waiting_confirmation;
      if (waiting_confirmation === true && order.delivery_status === 'Pending') {
        order.delivery_status = 'Shipping';
      }
    }
    order.updatedAt = Date.now();

    await order.save();
    
    // Gửi email thông báo nếu đơn hàng vừa được xác nhận
    if (shouldSendEmail && order.user_id && order.user_id.email) {
      // Lấy tên hiển thị ưu tiên: first_name + last_name > user_name > email
      const user = order.user_id;
      const displayName = (user.first_name && user.last_name)
        ? `${user.first_name} ${user.last_name}`
        : (user.user_name || user.email);
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: order.user_id.email,
        subject: 'Đơn hàng của bạn đã được xác nhận - CampGo',
        html: `
          <h2>Xin chào ${displayName},</h2>
          <p>Đơn hàng của bạn (Mã đơn hàng: ${order._id}) đã được xác nhận.</p>
          <p>Đơn hàng sẽ được giao trong vòng 3 ngày làm việc kể từ ngày xác nhận.</p>
          <p>Chúng tôi sẽ thông báo thêm khi đơn hàng được giao.</p>
          <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của CampGo!</p>
          <br>
          <p>Trân trọng,</p>
          <p>Đội ngũ CampGo</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Không trả về lỗi cho client nếu gửi email thất bại
      }
    }
    
    const updatedOrder = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        model: 'Users',
        select: 'name email'
      })
      .populate('shipping_address')
      .populate('products.product', 'name price image');
      
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
