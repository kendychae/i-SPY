const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  storeFcmToken,
  deleteFcmToken,
} = require('../controllers/user.controller');

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get authenticated user's full profile (Issue #46)
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update profile fields: name, phone, bio, profile_image_url (Issue #46)
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/v1/users/preferences
 * @desc    Get notification + privacy preferences (Issue #52)
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @route   PUT /api/v1/users/preferences
 * @desc    Upsert notification + privacy preferences (Issue #52)
 * @access  Private
 */
router.put('/preferences', updatePreferences);

/**
 * @route   POST /api/v1/users/fcm-token
 * @desc    Register/refresh device FCM token (Issue #52)
 * @access  Private
 */
router.post('/fcm-token', storeFcmToken);

/**
 * @route   DELETE /api/v1/users/fcm-token
 * @desc    Remove a device FCM token on logout (Issue #52)
 * @access  Private
 */
router.delete('/fcm-token', deleteFcmToken);

module.exports = router;
