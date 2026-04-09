/**
 * User Controller
 * Issues #46, #52 — W5: User Profile, Notification Preferences, FCM Tokens
 */
const db = require('../config/database');

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users/profile
 * Return the authenticated user's full profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = await db.query(
      `SELECT id, email,
              first_name  AS "firstName",
              last_name   AS "lastName",
              phone_number AS "phoneNumber",
              bio,
              profile_image_url AS "profileImageUrl",
              user_type   AS "userType",
              is_verified AS "isVerified",
              created_at  AS "createdAt"
       FROM users WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: { user: rows[0] } });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PUT /api/v1/users/profile
 * Update editable profile fields: first_name, last_name, phone_number, bio, profile_image_url
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { first_name, last_name, phone_number, bio, profile_image_url } = req.body;

    const errors = [];

    if (first_name !== undefined) {
      if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
        errors.push({ field: 'first_name', message: 'First name must be at least 2 characters' });
      }
    }
    if (last_name !== undefined) {
      if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
        errors.push({ field: 'last_name', message: 'Last name must be at least 2 characters' });
      }
    }
    if (phone_number !== undefined && phone_number !== null && phone_number !== '') {
      if (!/^[\d\s\-\+\(\)]{7,20}$/.test(phone_number)) {
        errors.push({ field: 'phone_number', message: 'Invalid phone number format' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updates = [];
    const queryParams = [];
    let paramCount = 0;

    if (first_name !== undefined) {
      paramCount++;
      updates.push(`first_name = $${paramCount}`);
      queryParams.push(first_name.trim());
    }
    if (last_name !== undefined) {
      paramCount++;
      updates.push(`last_name = $${paramCount}`);
      queryParams.push(last_name.trim());
    }
    if (phone_number !== undefined) {
      paramCount++;
      updates.push(`phone_number = $${paramCount}`);
      queryParams.push(phone_number || null);
    }
    if (bio !== undefined) {
      paramCount++;
      updates.push(`bio = $${paramCount}`);
      queryParams.push(bio || null);
    }
    if (profile_image_url !== undefined) {
      paramCount++;
      updates.push(`profile_image_url = $${paramCount}`);
      queryParams.push(profile_image_url || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    paramCount++;
    queryParams.push(userId);

    const { rows } = await db.query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, phone_number, bio, profile_image_url, user_type`,
      queryParams
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: rows[0] },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ─── Notification Preferences ──────────────────────────────────────────────────

/**
 * GET /api/v1/users/preferences
 * Return notification + privacy preferences for the authenticated user
 */
const getPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      // Return sensible defaults without persisting yet
      return res.status(200).json({
        success: true,
        data: {
          preferences: {
            user_id: userId,
            push_enabled: true,
            status_changes: true,
            nearby_incidents: false,
            weekly_digest: false,
            location_sharing_public: false,
            account_visible_to_public: true,
          },
        },
      });
    }

    return res.status(200).json({ success: true, data: { preferences: rows[0] } });
  } catch (error) {
    console.error('getPreferences error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PUT /api/v1/users/preferences
 * Upsert notification + privacy preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      push_enabled,
      status_changes,
      nearby_incidents,
      weekly_digest,
      location_sharing_public,
      account_visible_to_public,
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO notification_preferences
         (user_id, push_enabled, status_changes, nearby_incidents,
          weekly_digest, location_sharing_public, account_visible_to_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         push_enabled               = COALESCE(EXCLUDED.push_enabled,               notification_preferences.push_enabled),
         status_changes             = COALESCE(EXCLUDED.status_changes,             notification_preferences.status_changes),
         nearby_incidents           = COALESCE(EXCLUDED.nearby_incidents,           notification_preferences.nearby_incidents),
         weekly_digest              = COALESCE(EXCLUDED.weekly_digest,              notification_preferences.weekly_digest),
         location_sharing_public    = COALESCE(EXCLUDED.location_sharing_public,    notification_preferences.location_sharing_public),
         account_visible_to_public  = COALESCE(EXCLUDED.account_visible_to_public,  notification_preferences.account_visible_to_public),
         updated_at                 = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        push_enabled         ?? true,
        status_changes       ?? true,
        nearby_incidents     ?? false,
        weekly_digest        ?? false,
        location_sharing_public   ?? false,
        account_visible_to_public ?? true,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: { preferences: rows[0] },
    });
  } catch (error) {
    console.error('updatePreferences error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ─── FCM Tokens ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/users/fcm-token
 * Store or refresh a device push token
 */
const storeFcmToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token, platform, provider } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    const allowedPlatforms = ['ios', 'android', 'web'];
    if (platform && !allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `platform must be one of: ${allowedPlatforms.join(', ')}`,
      });
    }

    const normalizedToken = token.trim();
    const inferredProvider = provider || (
      normalizedToken.startsWith('ExponentPushToken[') || normalizedToken.startsWith('ExpoPushToken[')
        ? 'expo'
        : 'fcm'
    );

    const allowedProviders = ['expo', 'fcm'];
    if (!allowedProviders.includes(inferredProvider)) {
      return res.status(400).json({
        success: false,
        message: `provider must be one of: ${allowedProviders.join(', ')}`,
      });
    }

    await db.query(
      `INSERT INTO fcm_tokens (user_id, token, platform, provider)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, token) DO UPDATE SET
         platform   = EXCLUDED.platform,
         provider   = EXCLUDED.provider,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, normalizedToken, platform || null, inferredProvider]
    );

    return res.status(200).json({ success: true, message: 'Push token stored' });
  } catch (error) {
    console.error('storeFcmToken error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * DELETE /api/v1/users/fcm-token
 * Remove a specific push token on logout / device change
 */
const deleteFcmToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    await db.query(
      'DELETE FROM fcm_tokens WHERE user_id = $1 AND token = $2',
      [userId, token]
    );

    return res.status(200).json({ success: true, message: 'Push token removed' });
  } catch (error) {
    console.error('deleteFcmToken error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  storeFcmToken,
  deleteFcmToken,
};
