const Products = require("../models/Products");
const mongoose = require('mongoose');
const Category = require("../models/Category");

// Get all products with pagination and search
const productController = {
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const category = req.query.category || '';
            const sort = req.query.sort || 'createdAt';
            const order = req.query.order || 'desc';

            // Build query
            let query = {};
            
            // Add search condition if search term exists
            if (search) {
                query.$or = [
                    { productName: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            // Add category filter if category exists
            if (category) {
                query.categoryID = category;
            }

            // Calculate skip
            const skip = (page - 1) * limit;

            // Get total count for pagination
            const total = await Products.countDocuments(query);

            // Get products with pagination and sorting
            const products = await Products.find(query)
                .populate('categoryID', 'categoryName description imageURL')
                .sort({ [sort]: order === 'desc' ? -1 : 1 })
                .skip(skip)
                .limit(limit);

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
                    price: priceAfterDiscount
                };
            });

            res.json({
                success: true,
                data: {
                    products: formattedProducts,
                    pagination: {
                        total,
                        totalPages: Math.ceil(total / limit),
                        currentPage: page,
                        limit
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching products",
                error: error.message
            });
        }
    },

    // Get product details by ID
    getProductDetails: async (req, res) => {
        try {
            const { id } = req.params; // Get ID from URL params

            // Validate ID format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID format"
                });
            }

            const product = await Products.findById(id)
                .populate('categoryID', 'categoryName description imageURL');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Calculate price after discount
            const priceAfterDiscount = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;

            res.json({
                success: true,
                data: {
                    ...product.toObject(),
                    originalPrice: product.price,
                    discountedPrice: priceAfterDiscount,
                    discount: product.discount,
                    price: priceAfterDiscount
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching product details",
                error: error.message
            });
        }
    },

    // Get all categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching categories",
                error: error.message
            });
        }
    },

    // Get products by category ID
    getProductsByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || 'createdAt';
            const order = req.query.order || 'desc';

            // Validate category ID format
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID danh mục không hợp lệ"
                });
            }

            // Check if category exists
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            // Calculate skip for pagination
            const skip = (page - 1) * limit;

            // Build query
            const query = { categoryID: categoryId };

            // Get total count for pagination
            const total = await Products.countDocuments(query);

            // Get products with pagination and sorting
            const products = await Products.find(query)
                .sort({ [sort]: order === 'desc' ? -1 : 1 })
                .skip(skip)
                .limit(limit);

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
                    price: priceAfterDiscount
                };
            });

            res.json({
                success: true,
                data: {
                    category: category,
                    products: formattedProducts,
                    pagination: {
                        total,
                        totalPages: Math.ceil(total / limit),
                        currentPage: page,
                        limit
                    }
                }
            });
        } catch (error) {
            console.error('Error in getProductsByCategory:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách sản phẩm theo danh mục",
                error: error.message
            });
        }
    }
};

module.exports = productController;
