const Cart = require('../models/Carts');
const Product = require('../models/Products');
const mongoose = require('mongoose');

const cartService = {
    // Add item to cart
    addToCart: async (userId, productId, quantity) => {
        try {
            // Convert quantity to number
            quantity = parseInt(quantity);
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Invalid quantity');
            }

            // Find or create cart
            let cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                cart = new Cart({
                    user_id: userId,
                    items: [],
                    cartTotal: 0
                });
            }

            // Find product
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if product has enough stock
            if (product.stockQuantity <= 0) {
                throw new Error('Product is out of stock');
            }

            // Calculate price after discount
            const priceAfterDiscount = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;

            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Calculate new total quantity
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                
                // Check if new quantity exceeds stock
                if (newQuantity > product.stockQuantity) {
                    throw new Error(`Only ${product.stockQuantity} items available in stock`);
                }

                // Update quantity if product exists
                cart.items[existingItemIndex].quantity = newQuantity;
                cart.items[existingItemIndex].total = newQuantity * priceAfterDiscount;
            } else {
                // Check if requested quantity exceeds stock
                if (quantity > product.stockQuantity) {
                    throw new Error(`Only ${product.stockQuantity} items available in stock`);
                }

                // Add new item if product doesn't exist
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: priceAfterDiscount,
                    total: quantity * priceAfterDiscount,
                    addedAt: new Date()
                });
            }

            // Calculate cart total
            cart.cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

            // Update product stock
            product.stockQuantity -= quantity;
            await product.save();

            await cart.save();
            await cart.populate('items.product');

            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Update item quantity
    updateItemQuantity: async (userId, productId, quantity) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error('Cart not found');
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                throw new Error('Item not found in cart');
            }

            // Get current product price and discount
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            const priceAfterDiscount = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;

            const oldQuantity = cart.items[itemIndex].quantity;
            const quantityDiff = quantity - oldQuantity;

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
                // Return stock to product
                product.stockQuantity += oldQuantity;
            } else {
                // Check if new quantity exceeds stock
                if (quantityDiff > product.stockQuantity) {
                    throw new Error(`Only ${product.stockQuantity} items available in stock`);
                }

                // Update quantity
                cart.items[itemIndex].quantity = quantity;
                cart.items[itemIndex].price = priceAfterDiscount;
                cart.items[itemIndex].total = quantity * priceAfterDiscount;
                
                // Update product stock
                product.stockQuantity -= quantityDiff;
            }

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

            await product.save();
            await cart.save();
            await cart.populate('items.product');

            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (userId, productId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error('Cart not found');
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                throw new Error('Item not found in cart');
            }

            // Get the quantity to return to stock
            const quantity = cart.items[itemIndex].quantity;

            // Remove item from cart
            cart.items.splice(itemIndex, 1);

            // Return stock to product
            const product = await Product.findById(productId);
            if (product) {
                product.stockQuantity += quantity;
                await product.save();
            }

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

            await cart.save();
            await cart.populate('items.product');

            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Clear cart
    clearCart: async (userId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error('Cart not found');
            }

            // Return all items to stock
            for (const item of cart.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stockQuantity += item.quantity;
                    await product.save();
                }
            }

            cart.items = [];
            cart.cartTotal = 0;

            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Remove multiple items from cart
    removeMultipleItems: async (userId, productIds) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error('Cart not found');
            }

            // Remove items and return stock
            for (const productId of productIds) {
                const itemIndex = cart.items.findIndex(
                    item => item.product.toString() === productId
                );

                if (itemIndex !== -1) {
                    const quantity = cart.items[itemIndex].quantity;
                    cart.items.splice(itemIndex, 1);

                    // Return stock to product
                    const product = await Product.findById(productId);
                    if (product) {
                        product.stockQuantity += quantity;
                        await product.save();
                    }
                }
            }

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

            await cart.save();
            await cart.populate('items.product');

            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Get cart by user ID
    getCartByUserId: async (userId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId })
                .populate('items.product', 'productName price images stockQuantity discount');
            
            if (!cart) {
                // Nếu không tìm thấy giỏ hàng, tạo giỏ hàng mới
                const newCart = new Cart({
                    user_id: userId,
                    items: [],
                    cartTotal: 0
                });
                await newCart.save();
                return newCart;
            }

            // Tính lại tổng tiền giỏ hàng
            cart.cartTotal = cart.items.reduce((total, item) => {
                const product = item.product;
                const priceAfterDiscount = product.discount > 0 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price;
                return total + (priceAfterDiscount * item.quantity);
            }, 0);

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi lấy giỏ hàng');
        }
    }
};

module.exports = cartService;