const crypto = require('crypto');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured in .env');
  }
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc Create Razorpay order
const createOrder = async (req, res) => {
  const { listingId, message } = req.body;
  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.seller.toString() === req.user._id.toString())
    return res.status(400).json({ message: 'You cannot order your own listing' });

  const sellerUser = await User.findById(listing.seller);
  if (!sellerUser) return res.status(404).json({ message: 'Seller not found' });
  if (!sellerUser.razorpayAccountId) {
    return res.status(400).json({ message: 'Seller has not configured Razorpay payout account' });
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: listing.price * 100,
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    notes: { sellerId: String(sellerUser._id), buyerId: String(req.user._id), listingId: String(listing._id) }
  });

  const order = await Order.create({
    buyer: req.user._id,
    seller: listing.seller,
    listing: listing._id,
    message,
    price: listing.price,
    razorpayOrderId: razorpayOrder.id,
  });

  res.status(201).json({
    order,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
    sellerRazorpayAccountId: sellerUser.razorpayAccountId
  });
};

// @desc Verify Razorpay payment
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const sign = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
  if (expectedSign !== razorpaySignature)
    return res.status(400).json({ message: 'Invalid payment signature' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'accepted';

  const seller = await User.findById(order.seller);
  if (!seller || !seller.razorpayAccountId) {
    await order.save();
    await Listing.findByIdAndUpdate(order.listing, { $inc: { totalOrders: 1 } });
    return res.status(200).json({ message: 'Payment verified, but seller payout is not configured', order });
  }

  const razorpay = getRazorpay();
  // Transfer funds to seller account. Note: this requires your Razorpay account to be configured for marketplace payouts.
  const transfer = await razorpay.transfers.create({
    account: seller.razorpayAccountId,
    amount: order.price * 100,
    currency: 'INR',
    transfer_group: `order_${order._id}`,
    notes: {
      orderId: String(order._id),
      sellerId: String(seller._id),
    }
  });

  order.razorpayTransferId = transfer.id;
  await order.save();
  await Listing.findByIdAndUpdate(order.listing, { $inc: { totalOrders: 1 } });
  res.json({ message: 'Payment verified and transferred to seller', order, transfer });
};

// @desc Get my orders (buyer)
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('listing', 'title images price category')
    .populate('seller', 'name profilePic hostel')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Get received orders (seller)
const getReceivedOrders = async (req, res) => {
  const orders = await Order.find({ seller: req.user._id })
    .populate('listing', 'title images price')
    .populate('buyer', 'name profilePic hostel')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Update order status (seller only)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });
  order.status = status;
  if (status === 'completed') {
    await User.findByIdAndUpdate(order.seller, { $inc: { totalSales: 1 } });
  }
  const updated = await order.save();
  res.json(updated);
};

module.exports = { createOrder, verifyPayment, getMyOrders, getReceivedOrders, updateOrderStatus };
