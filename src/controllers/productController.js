const Products = require("../models/Products");
const Categories = require("../models/Category");

// Get all products 
const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Products.find().populate('categoryID', 'categoryName'); 
            res.json({ success: true, products });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

// Get all products detail by product id
    getProductDetails: async (req, res) => {
        const { id } = req.body;  //Product ID

        try {
            const product = await Products.findById(id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json({ success: true, product });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
// Get all products by category id
    getProductsByCategory: async (req, res) => {
        const { id } = req.body; // Category ID

        try {
            const products = await Products.find({ categoryID: id});
            res.json({ success: true, products });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
 // Get all category 
    getAllCategories: async (req, res) => {
        try {
            const categories = await Categories.find(); 
            res.json({ success: true, categories });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = productController;
