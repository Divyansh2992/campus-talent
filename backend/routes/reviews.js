const express = require('express');
const router = express.Router();
const { postReview, getListingReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, postReview);
router.get('/listing/:id', getListingReviews);

module.exports = router;
