const express = require('express');
const router = express.Router();
const { getListings, getListingById, createListing, updateListing, deleteListing, getUserListings } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getListings);
router.get('/user/:userId', getUserListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 4), createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
