const Product = require('../models/Products');
const mongoose = require('mongoose');

const productService = {
    // Get all products with pagination
    getAllProducts: async (page = 1, limit = 10) => {
        try {
            const skip = (page - 1) * limit;
            const products = await Product.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments();

            // Format products to include both original and discounted prices
            const formattedProducts = products.map(product => {
                const priceAfterDiscount = product.discount > 0
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                return {
                    ...product.toObject(),
                    originalPrice: product.price,
                    discountedPrice: priceAfterDiscount,
                    discount: product.discount,
                    price: priceAfterDiscount // Keep this for backward compatibility
                };
            });

            return {
                products: formattedProducts,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    },

    // Get product by ID
    getProductById: async (productId) => {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            const priceAfterDiscount = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;

            return {
                ...product.toObject(),
                originalPrice: product.price,
                discountedPrice: priceAfterDiscount,
                discount: product.discount,
                price: priceAfterDiscount // Keep this for backward compatibility
            };
        } catch (error) {
            throw error;
        }
    },

    // Search products
    searchProducts: async (query, page = 1, limit = 10) => {
        try {
            const skip = (page - 1) * limit;
            const products = await Product.find({
                $or: [
                    { productName: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

            const total = await Product.countDocuments({
                $or: [
                    { productName: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            });

            // Format products to include both original and discounted prices
            const formattedProducts = products.map(product => {
                const priceAfterDiscount = product.discount > 0
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                return {
                    ...product.toObject(),
                    originalPrice: product.price,
                    discountedPrice: priceAfterDiscount,
                    discount: product.discount,
                    price: priceAfterDiscount // Keep this for backward compatibility
                };
            });

            return {
                products: formattedProducts,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = productService; 