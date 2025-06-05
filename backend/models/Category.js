// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    
  },
  emoji: {
    type: String,
   
  },
  slug: {
    type: String,
    
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from CategoryName before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('CategoryName')) {
    this.slug = this.CategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Update slug when CategoryName is modified
categorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.CategoryName) {
    update.slug = update.CategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
