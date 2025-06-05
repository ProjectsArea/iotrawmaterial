const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  imageUrls: [{
    type: String,
    required: true
  }],
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 }); // Index for category-based queries

// Middleware to update categoryName when category changes
productSchema.pre('save', async function(next) {
  if (this.isModified('category')) {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.category);
    if (category) {
      this.categoryName = category.name;
    }
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 