const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc Get all listings with filters
const getListings = async (req, res) => {
  const { category, search, sort, minPrice, maxPrice } = req.query;
  let query = { isActive: true };
  if (category && category !== 'all') query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } }
  ];
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  let sortOption = { createdAt: -1 };
  if (sort === 'price-low') sortOption = { price: 1 };
  if (sort === 'price-high') sortOption = { price: -1 };
  if (sort === 'top-rated') sortOption = { avgRating: -1 };
  const listings = await Listing.find(query).sort(sortOption).populate('seller', 'name hostel profilePic avgRating');
  res.json(listings);
};

// @desc Get single listing
const getListingById = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name hostel profilePic avgRating bio skills totalSales');
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json(listing);
};

// @desc Create listing
const createListing = async (req, res) => {
  const { title, description, category, price, deliveryTime, tags } = req.body;
  const images = req.files ? req.files.map(f => f.secure_url) : [];
  const listing = await Listing.create({
    seller: req.user._id, title, description, category,
    price: Number(price), deliveryTime, images,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
  });
  res.status(201).json(listing);
};

// @desc Update listing
const updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });
  Object.assign(listing, req.body);
  const updated = await listing.save();
  res.json(updated);
};

// @desc Delete listing
const deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });
  await listing.deleteOne();
  res.json({ message: 'Listing removed' });
};

// @desc Get listings by user
const getUserListings = async (req, res) => {
  const listings = await Listing.find({ seller: req.params.userId }).sort({ createdAt: -1 });
  res.json(listings);
};

module.exports = { getListings, getListingById, createListing, updateListing, deleteListing, getUserListings };
