const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['art-craft', 'drawing', 'music', 'writing', 'photography', 'dance', 'coding', 'tutoring', 'design']
  },
  price: { type: Number, required: true, min: 0 },
  deliveryTime: { type: String, default: '3-5 days' },
  images: [{ type: String }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  avgRating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
