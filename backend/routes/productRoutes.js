const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// Get all products with category information
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
router.post('/', upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, price, quantity, category, categoryName, features } = req.body;
    
    // Convert features string to array if it's a string
    const featuresArray = typeof features === 'string' ? JSON.parse(features) : features;

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      categoryName,
      features: featuresArray,
      imageUrls: req.files ? req.files.map(file => file.path) : []
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.message.includes('Please upload an image file')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update a product
router.put('/:id', upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, price, quantity, category, categoryName, features } = req.body;
    
    // Convert features string to array if it's a string
    const featuresArray = typeof features === 'string' ? JSON.parse(features) : features;

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      categoryName,
      features: featuresArray
    };

    // Only update images if new files are uploaded
    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    if (error.message.includes('Please upload an image file')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId }).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 