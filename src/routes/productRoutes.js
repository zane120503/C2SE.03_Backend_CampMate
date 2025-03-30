const express = require('express');
const productController = require('../controllers/productController');
const productRouter = express.Router();

productRouter.get('/api/products', productController.getAllProducts);
productRouter.get('/api/products/:id', productController.getProductDetails);
productRouter.get('/api/products/category/:category', productController.getProductsByCategory);
productRouter.get('/api/categories', productController.getAllCategories);

module.exports = productRouter;
