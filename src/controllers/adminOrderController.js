const Order = require('../models/Order');

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
      .populate('user_id', 'name email')
      .populate('shipping_address')
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'name email')
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (typeof waiting_confirmation === 'boolean') {
      order.waiting_confirmation = waiting_confirmation;
      if (waiting_confirmation === true && order.delivery_status === 'Pending') {
        order.delivery_status = 'Shipping';
      }
    }
    order.updatedAt = Date.now();

    await order.save();
    
    const updatedOrder = await Order.findById(req.params.id)
      .populate('user_id', 'name email')
      .populate('shipping_address')
      .populate('products.product', 'name price image');
      
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
