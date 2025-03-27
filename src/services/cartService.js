const Cart = require('../models/Carts');
const Product = require('../models/Products');
const mongoose = require('mongoose');

const cartService = {
    // Add item to cart
    addToCart: async (userId, productId, quantity) => {
        try {
            // Find or create cart for user
            let cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                cart = new Cart({
                    user_id: userId,
                    items: []
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error("Product not found");
            }

            // Calculate price after discount
            const priceAfterDiscount = product.price * (1 - (product.discount / 100));

            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex !== -1) {
                // Update quantity and total for existing item
                cart.items[existingItemIndex].quantity += quantity;
                cart.items[existingItemIndex].total = 
                    cart.items[existingItemIndex].quantity * priceAfterDiscount;
            } else {
                // Add new item to cart
                cart.items.push({
                    product: productId,
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                    total: quantity * priceAfterDiscount,
                    discount: product.discount
                });
            }

            // Calculate new cart total
            cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);

            await cart.save();
            return await Cart.findById(cart._id).populate('items.product');
        } catch (error) {
            throw error;
        }
    },

    // Get cart by user ID
    getCartByUserId: async (userId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId })
                .populate('items.product');

            if (!cart) {
                return null;
            }

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
            await cart.save();

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
                throw new Error("Cart not found");
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                throw new Error("Item not found in cart");
            }

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                // Update quantity and total
                const item = cart.items[itemIndex];
                const priceAfterDiscount = item.price * (1 - (item.discount / 100));
                item.quantity = quantity;
                item.total = quantity * priceAfterDiscount;
            }

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
            await cart.save();

            return await Cart.findById(cart._id).populate('items.product');
        } catch (error) {
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (userId, productId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error("Cart not found");
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                throw new Error("Item not found in cart");
            }

            // Remove item
            cart.items.splice(itemIndex, 1);

            // Recalculate cart total
            cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
            await cart.save();

            return await Cart.findById(cart._id).populate('items.product');
        } catch (error) {
            throw error;
        }
    },

    // Clear cart
    clearCart: async (userId) => {
        try {
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                throw new Error("Cart not found");
            }

            cart.items = [];
            cart.cartTotal = 0;
            await cart.save();

            return cart;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = cartService; 