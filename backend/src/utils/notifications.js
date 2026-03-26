/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * Issue #52 - W5: Backend Notification Service with FCM + Preferences API
 *
 * Wraps firebase-admin SDK for sending push notifications.
 * Handles token lookup, FCM dispatch, and stale token cleanup.
 */
const admin = require('firebase-admin');
const db = require('../config/database');

// Initialise firebase-admin once (idempotent)
function initFirebase() {
  if (admin.apps.length > 0) return; // already initialised

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[FCM] Firebase Admin initialised from FIREBASE_SERVICE_ACCOUNT_JSON');
      return;
    } catch (e) {
      console.warn('[FCM] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    }
  }

  // Fall back to application default credentials (works on GCP / emulator)
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    console.log('[FCM] Firebase Admin initialised with application default credentials');
  } catch (e) {
    console.warn('[FCM] Firebase Admin not initialised — push notifications disabled:', e.message);
  }
}

initFirebase();

/**
 * Send a push notification to a specific user.
 * Looks up all FCM tokens for the user and sends in parallel.
 * Stale/invalid tokens are removed from the database.
 *
 * @param {string} userId  - UUID of the recipient
 * @param {string} title   - Notification title
 * @param {string} body    - Notification body
 * @param {object} data    - Optional key/value data payload
 * @returns {Promise<{sent: number, failed: number}>}
 */
async function sendToUser(userId, title, body, data = {}) {
  if (!admin.apps.length) {
    console.warn('[FCM] Skipping notification — Firebase not initialised');
    return { sent: 0, failed: 0 };
  }

  // Fetch user's FCM tokens
  const { rows: tokenRows } = await db.query(
    'SELECT id, token FROM fcm_tokens WHERE user_id = $1',
    [userId]
  );

  if (tokenRows.length === 0) return { sent: 0, failed: 0 };

  const messaging = admin.messaging();
  const staleTokenIds = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    tokenRows.map(async ({ id: tokenId, token }) => {
      const message = {
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      try {
        await messaging.send(message);
        sent++;
      } catch (err) {
        failed++;
        // Remove unregistered / invalid tokens
        if (
          err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token'
        ) {
          staleTokenIds.push(tokenId);
        } else {
          console.error('[FCM] Send error for token', tokenId, err.code);
        }
      }
    })
  );

  // Clean up stale tokens
  if (staleTokenIds.length > 0) {
    await db.query(
      'DELETE FROM fcm_tokens WHERE id = ANY($1::uuid[])',
      [staleTokenIds]
    );
    console.log(`[FCM] Removed ${staleTokenIds.length} stale token(s) for user ${userId}`);
  }

  return { sent, failed };
}

/**
 * Persist a notification record in the DB and push to device.
 *
 * @param {string} userId
 * @param {string} title
 * @param {string} body
 * @param {string} type        - e.g. 'report_status_change', 'report_assigned'
 * @param {string|null} reportId
 * @param {object} data        - extra FCM data payload
 */
async function notify(userId, title, body, type, reportId = null, data = {}) {
  // 1. Check user's notification preferences
  const { rows: prefRows } = await db.query(
    'SELECT push_enabled, status_changes FROM notification_preferences WHERE user_id = $1',
    [userId]
  );

  if (prefRows.length > 0) {
    const prefs = prefRows[0];
    if (!prefs.push_enabled) return;
    if (type === 'report_status_change' && !prefs.status_changes) return;
  }

  // 2. Store notification in DB
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type, related_report_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, title, body, type, reportId]
  );

  // 3. Send push
  return sendToUser(userId, title, body, { type, reportId: reportId || '', ...data });
}

module.exports = { sendToUser, notify };
