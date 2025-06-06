const express = require('express');
const {adminOnly, protect} = require('../middlewares/authMiddleware');
const { getUsers, getUserById} = require('../controllers/userController');

const router = express.Router();

// USER MANAGEMENT ROUTES
router.get('/', protect, adminOnly, getUsers); // Get all users(admin only)
router.get('/:id', protect, getUserById); // Get user by ID(SPECIFIC USER)

module.exports = router;