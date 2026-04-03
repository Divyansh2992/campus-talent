const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc Post a review
const postReview = async (req, res) => {
  const { listingId, rating, comment, orderId } = req.body;
  const already = await Review.findOne({ reviewer: req.user._id, listing: listingId });
  if (already) return res.status(400).json({ message: 'You already reviewed this listing' });

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  const review = await Review.create({
    reviewer: req.user._id, listing: listingId,
    seller: listing.seller, order: orderId,
    rating: Number(rating), comment,
  });

  // Update listing avgRating
  const reviews = await Review.find({ listing: listingId });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  listing.avgRating = avg.toFixed(1);
  listing.totalReviews = reviews.length;
  await listing.save();

  // Update seller avgRating
  const sellerReviews = await Review.find({ seller: listing.seller });
  const sellerAvg = sellerReviews.reduce((acc, r) => acc + r.rating, 0) / sellerReviews.length;
  await User.findByIdAndUpdate(listing.seller, { avgRating: sellerAvg.toFixed(1), totalReviews: sellerReviews.length });

  await review.populate('reviewer', 'name profilePic hostel');
  res.status(201).json(review);
};

// @desc Get reviews for a listing
const getListingReviews = async (req, res) => {
  const reviews = await Review.find({ listing: req.params.id })
    .populate('reviewer', 'name profilePic hostel')
    .sort({ createdAt: -1 });
  res.json(reviews);
};

module.exports = { postReview, getListingReviews };
