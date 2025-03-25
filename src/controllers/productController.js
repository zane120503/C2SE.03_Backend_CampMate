const Products = require("../models/Products");

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Products.find();
            res.json({ success: true, products });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductDetails: async (req, res) => {
        const { id } = req.params;
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

    getProductsByCategory: async (req, res) => {
        const { category } = req.params;
        try {
            const products = await Products.find({ categoryID: category });
            res.json({ success: true, products });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = productController;
