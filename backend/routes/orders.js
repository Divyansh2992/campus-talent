const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getReceivedOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my', protect, getMyOrders);
router.get('/received', protect, getReceivedOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
