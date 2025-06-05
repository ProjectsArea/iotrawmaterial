const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Check if the file is an image by checking its mimetype
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image file'));
    }
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('CategoryName description image icon emoji slug productCount createdAt updatedAt');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const CategoryName = req.body.CategoryName;
    const description = req.body.description;
    const icon = req.body.icon;
    const emoji = req.body.emoji;
    const image = req.file ? req.file.path : null;

    // Validate required fields
    if (!CategoryName || CategoryName.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ CategoryName: CategoryName.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      CategoryName: CategoryName.trim(),
      description: description?.trim(),
      image: image,
      icon: icon?.trim(),
      emoji: emoji?.trim()
    });

    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const CategoryName = req.body.CategoryName;
    const description = req.body.description;
    const icon = req.body.icon;
    const emoji = req.body.emoji;
    const image = req.file ? req.file.path : null;

    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (CategoryName && CategoryName !== category.CategoryName) {
      const existingCategory = await Category.findOne({ CategoryName });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updateData = {
      CategoryName,
      description,
      icon,
      emoji
    };

    if (image) {
      updateData.image = image;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product count
router.patch('/:id/product-count', async (req, res) => {
  try {
    const { increment } = req.body;
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.productCount += increment;
    await category.save();
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
