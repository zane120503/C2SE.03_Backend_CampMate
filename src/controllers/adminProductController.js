const Product = require('../models/Products');
const cloudinary = require('../Config/cloudinary');
const mongoose = require('mongoose');

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(searchQuery)
      .populate('categoryID', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(searchQuery);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryID', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productName, description, price, stockQuantity, categoryID, brand, discount } = req.body;
    
    // Kiểm tra categoryID
    if (!mongoose.Types.ObjectId.isValid(categoryID)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    const product = new Product({
      productName,
      description,
      price,
      stockQuantity,
      categoryID: new mongoose.Types.ObjectId(categoryID),
      brand,
      discount,
      images
    });

    await product.save();
    res.status(201).json({ 
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productName, description, price, stockQuantity, categoryID, brand, discount } = req.body;
    
    // Kiểm tra categoryID
    if (categoryID && !mongoose.Types.ObjectId.isValid(categoryID)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      // Upload new images
      const images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
      product.images = images;
    }

    // Update other fields
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    if (categoryID) {
      product.categoryID = new mongoose.Types.ObjectId(categoryID);
    }
    product.brand = brand || product.brand;
    product.discount = discount || product.discount;
    product.updatedAt = Date.now();

    await product.save();
    res.json({ 
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    product.updatedAt = Date.now();
    await product.save();

    res.json({ 
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: product.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
