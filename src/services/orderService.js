const mongoose = require('mongoose');
const User = require("../models/Users");
const Card = require("../models/Card");
const Order = require("../models/Order");
const Cart = require("../models/Carts");
const Product = require("../models/Products");
const Address = require("../models/Address");
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

// Hàm tạo transaction_id
const generateTransactionId = (userId, paymentMethod) => {
  // Tạo một chuỗi ngẫu nhiên 8 ký tự
  const randomString = crypto.randomBytes(4).toString('hex');
  
  // Lấy 6 ký tự cuối của userId
  const userIdSuffix = userId.toString().slice(-6);
  
  // Lấy 2 ký tự đầu của paymentMethod
  const paymentPrefix = paymentMethod.substring(0, 2).toUpperCase();
  
  // Tạo timestamp dạng YYMMDD
  const date = new Date();
  const timestamp = date.getFullYear().toString().slice(-2) +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  
  // Kết hợp các thành phần: PAYMENT_PREFIX + TIMESTAMP + USER_ID_SUFFIX + RANDOM_STRING
  return `${paymentPrefix}${timestamp}${userIdSuffix}${randomString}`;
};

// Tạo đơn hàng mới
const createOrder = async (params) => {
  try {
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(params.userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Lấy địa chỉ mặc định của người dùng
    const defaultAddress = await Address.findOne({ 
      user_id: params.userId,
      isDefault: true
    });
    if (!defaultAddress) {
      throw new Error('Không tìm thấy địa chỉ giao hàng mặc định');
    }

    // Kiểm tra thẻ thanh toán nếu phương thức là Credit Card
    let card = null;
    if (params.paymentMethod === 'Credit Card') {
      card = await Card.findOne({ 
        user_id: params.userId,
        is_default: true
      });
      if (!card) {
        throw new Error('Không tìm thấy thẻ thanh toán mặc định');
      }
    }

    // Lấy thông tin sản phẩm từ giỏ hàng và kiểm tra tồn kho
    const cart = await Cart.findOne({ user_id: params.userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    // Nếu có selectedProducts, chỉ lấy các sản phẩm được chọn
    let cartItems = cart.items;
    if (params.selectedProducts && params.selectedProducts.length > 0) {
      cartItems = cart.items.filter(item => 
        params.selectedProducts.includes(item.product.toString())
      );
      if (cartItems.length === 0) {
        throw new Error('Không có sản phẩm nào được chọn');
      }
    }

    const productDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const productDetail = await Product.findById(cartItem.product);
        if (!productDetail || productDetail.stockQuantity < cartItem.quantity) {
          throw new Error(`Không đủ hàng cho sản phẩm ${productDetail?.productName || 'không xác định'}`);
        }
        return {
          product: productDetail,
          name: productDetail.productName,
          image: productDetail.imageURL,
          quantity: cartItem.quantity
        };
      })
    );

    // Tính tổng tiền sản phẩm
    const productsTotal = productDetails.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    // Tính tổng tiền đơn hàng (bao gồm phí vận chuyển)
    const shippingFee = 10; // Phí vận chuyển mặc định
    const totalAmount = productsTotal + shippingFee;

    console.log('Tổng tiền sản phẩm:', productsTotal);
    console.log('Phí vận chuyển:', shippingFee);
    console.log('Tổng tiền đơn hàng:', totalAmount);

    // Tạo transaction_id nếu thanh toán bằng thẻ
    const transactionId = params.paymentMethod === 'Credit Card' 
      ? generateTransactionId(params.userId, params.paymentMethod)
      : null;

    // Tạo đơn hàng mới
    const order = await Order.create({
      user_id: user._id,
      products: productDetails.map(item => ({
        product: item.product._id,
        name: item.name,
        image: item.image,
        amount: item.product.price,
        quantity: item.quantity
      })),
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      transaction_id: transactionId,
      waiting_confirmation: false,
      shipping_address: defaultAddress._id,
      payment_method: params.paymentMethod,
      payment_status: params.paymentMethod === 'Credit Card' ? 'Completed' : 'Pending',
      delivery_status: 'Pending'
    });

    // Cập nhật số lượng tồn kho
    for (const item of productDetails) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { 
          $inc: { 
            stockQuantity: -item.quantity,
            sold: item.quantity
          } 
        }
      );
    }

    // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
    if (params.selectedProducts && params.selectedProducts.length > 0) {
      await Cart.findOneAndUpdate(
        { user_id: user._id },
        { $pull: { items: { product: { $in: params.selectedProducts } } } }
      );
    } else {
      await Cart.findOneAndUpdate(
        { user_id: user._id },
        { $set: { items: [] } }
      );
    }

    // Populate thông tin địa chỉ giao hàng
    const populatedOrder = await Order.findById(order._id)
      .populate('shipping_address')
      .populate('products.product')
      .populate('user_id', 'name email');

    return populatedOrder;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi tạo đơn hàng");
  }
};

// Cập nhật đơn hàng
const updateOrder = (params, callback) => {
  const model = {
    payment_status: params.payment_status,
    transaction_id: params.transaction_id
  };

  // Cập nhật đơn hàng theo ID
  Order.findByIdAndUpdate(params.orderId, model, { new: true, useFindAndModify: false })
    .then((response) => {
      if (!response) {
        return callback('Cập nhật đơn hàng thất bại: Không tìm thấy đơn hàng');
      }
      return callback(null, response);
    })
    .catch((err) => {
      return callback(err);
    });
};

// Lấy đơn hàng theo ID người dùng
const getOrdersByUserId = async (userId) => {
  try {
    // Kiểm tra nếu userId không phải là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID người dùng không hợp lệ');
    }

    // Tìm các đơn hàng theo userId và populate để lấy thông tin chi tiết
    const orders = await Order.find({ user_id: new mongoose.Types.ObjectId(userId) })
      .populate('products.product')
      .populate('shipping_address');

    if (!orders || orders.length === 0) {
      throw new Error('Không tìm thấy đơn hàng nào cho người dùng này');
    }

    return orders;
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error.message);
    throw new Error(error.message || 'Lỗi khi lấy đơn hàng');
  }
};

// Xóa đơn hàng
const deleteOrder = async (orderId) => {
  try {
    // Tìm đơn hàng và kiểm tra trạng thái waiting_confirmation
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Chỉ cho phép xóa khi waiting_confirmation là false
    if (order.waiting_confirmation) {
      throw new Error('Không thể xóa đơn hàng đã xác nhận');
    }

    // Xóa đơn hàng
    const result = await Order.findByIdAndDelete(orderId);
    return { 
      message: 'Xóa đơn hàng thành công',
      order: result
    };
  } catch (error) {
    throw new Error(error.message || 'Lỗi khi xóa đơn hàng');
  }
};

// Lấy đơn hàng theo ID
const getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('products.product')
      .populate('shipping_address')
      .populate('user_id', 'name email');
    
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    
    return order;
  } catch (error) {
    throw new Error(error.message || 'Lỗi khi lấy thông tin đơn hàng');
  }
};

// Lấy tất cả đơn hàng (được sử dụng bởi getDeliveredOrders)
const getAllOrders = async (query = {}) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    // Xây dựng điều kiện tìm kiếm
    const filter = {};
    if (status) {
      filter.delivery_status = status;
    }
    
    // Xây dựng tùy chọn sắp xếp
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Thực hiện truy vấn với phân trang
    const orders = await Order.find(filter)
      .populate('products.product')
      .populate('shipping_address')
      .populate('user_id', 'name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Đếm tổng số đơn hàng thỏa mãn điều kiện
    const total = await Order.countDocuments(filter);
    
    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    throw new Error(error.message || 'Lỗi khi lấy danh sách đơn hàng');
  }
};

module.exports = {
  createOrder,
  updateOrder,
  getOrdersByUserId,
  deleteOrder,
  getOrderById,
  getAllOrders
};
