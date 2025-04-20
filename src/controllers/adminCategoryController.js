const Category = require('../models/Category');
const cloudinary = require('../Config/cloudinary');

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { categoryName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const categories = await Category.find(searchQuery)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Category.countDocuments(searchQuery);

    res.json({
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCategories: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Handle image upload
    if (!req.file) {
      return res.status(400).json({ message: 'Category image is required' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const category = new Category({
      categoryName,
      description,
      image: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

    await category.save();
    res.status(201).json({ 
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new category name already exists
    if (categoryName && categoryName !== category.categoryName) {
      const existingCategory = await Category.findOne({ categoryName });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(category.image.public_id);

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path);
      category.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    // Update other fields
    category.categoryName = categoryName || category.categoryName;
    category.description = description || category.description;
    category.updatedAt = Date.now();

    await category.save();
    res.json({ 
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(category.image.public_id);

    // Delete category from database
    await Category.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    category.updatedAt = Date.now();
    await category.save();

    res.json({ 
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: category.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
