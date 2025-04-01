const express = require('express');
const productController = require('../controllers/productController');
const productRouter = express.Router();

// Get all products with pagination, search, and filters
productRouter.get('/api/products', productController.getAllProducts);

// Get product details by ID
productRouter.get('/api/products/:id', productController.getProductDetails);

// Get all categories
productRouter.get('/api/categories', productController.getAllCategories);

// Get products by category ID
productRouter.get('/api/categories/:categoryId/products', productController.getProductsByCategory);

module.exports = productRouter;
