/**
 * Notification Controller
 * Issue #54 — W5: Notification Listener & Notification History Screen
 *
 * Provides API endpoints for notification history and read-state management.
 */
const db = require('../config/database');

/**
 * GET /api/v1/notifications
 * Return paginated notification history for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countRows[0].total);

    const { rows: notifications } = await db.query(
      `SELECT id, title, message, type, is_read, related_report_id, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { rowCount } = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Mark ALL notifications for the user as read
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * DELETE /api/v1/notifications/:id
 * Dismiss (delete) a single notification
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { rowCount } = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
