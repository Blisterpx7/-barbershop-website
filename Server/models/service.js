const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  duration: {
    type: Number,
    required: true,
    min: 15, // minimum 15 minutes
    max: 240 // maximum 4 hours
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['haircut', 'styling', 'coloring', 'beard-trim', 'facial', 'hair-treatment', 'package']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String
  },
  popular: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  }
}, {
  timestamps: true
});

// Virtual for discounted price
serviceSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

module.exports = mongoose.model('Service', serviceSchema); 