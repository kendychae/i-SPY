const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require('../controllers/notification.controller');

router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get paginated notification history (Issue #54)
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read (Issue #54)
 * @access  Private
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark single notification read (Issue #54)
 * @access  Private
 */
router.patch('/:id/read', markNotificationRead);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification (swipe-to-dismiss)
 * @access  Private
 */
router.delete('/:id', deleteNotification);

module.exports = router;
