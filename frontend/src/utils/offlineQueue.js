/**
 * offlineQueue.js
 * Issue #48 — Offline Sync Strategy & Conflict Resolution Design
 *
 * Implements client-side offline queue with:
 * - Idempotency via clientId UUID generation
 * - Exponential backoff retry (5s → 15s → 60s → 5m → 30m)
 * - Status tracking (pending, retrying, failed)
 * - Automatic sync on connectivity restore
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-safe UUID — uses crypto.randomUUID on web, Math.random fallback elsewhere
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

// ─── Queue storage key ────────────────────────────────────────────────────────
const QUEUE_KEY = 'vigilux:queue';

// ─── Backoff schedule (in milliseconds) ───────────────────────────────────────
const BACKOFF_SCHEDULE = [
  5 * 1000,      // 5 seconds
  15 * 1000,     // 15 seconds
  60 * 1000,     // 1 minute
  5 * 60 * 1000, // 5 minutes
  30 * 60 * 1000 // 30 minutes
];

// ─── Queue schema ────────────────────────────────────────────────────────────
/*
{
  id: "<uuid-v4>",           // Unique queue entry identifier
  clientId: "<uuid-v4>",     // Idempotency key sent to server
  operation: "CREATE_REPORT", // Currently only CREATE_REPORT supported
  payload: {},               // Full request body to replay
  createdAt: "<ISO8601>",    // When enqueued
  retryCount: 0,             // Number of attempts so far
  maxRetries: 5,             // Maximum attempts before marking failed
  status: "pending"          // pending | retrying | failed
}
*/

// ─── Queue operations ────────────────────────────────────────────────────────

/**
 * Generate a new clientId UUID for idempotency
 */
function generateClientId() {
  return generateUUID();
}

/**
 * Load queue from AsyncStorage
 */
async function loadQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading offline queue:', error);
    return [];
  }
}

/**
 * Save queue to AsyncStorage
 */
async function saveQueue(queue) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
}

/**
 * Enqueue a report for offline submission
 * @param {object} payload - Report data (title, description, etc.)
 * @returns {string} clientId - The generated client ID
 */
export async function enqueueReport(payload) {
  const queue = await loadQueue();
  const clientId = generateClientId();

  const entry = {
    id: generateUUID(),
    clientId,
    operation: 'CREATE_REPORT',
    payload: { ...payload, client_id: clientId }, // Include client_id in payload
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 5,
    status: 'pending'
  };

  queue.push(entry);
  await saveQueue(queue);

  console.log(`[OfflineQueue] Enqueued report with clientId: ${clientId}`);
  return clientId;
}

/**
 * Get current queue length for UI badge
 */
export async function getQueueLength() {
  const queue = await loadQueue();
  return queue.length;
}

/**
 * Process the offline queue
 * @param {function} submitFn - Async function to submit report (payload) => Promise<{success, data}>
 * @returns {Promise<{succeeded: number, failed: number}>}
 */
export async function processQueue(submitFn) {
  const queue = await loadQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  // Sort by createdAt ascending (oldest first)
  queue.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const remaining = [];
  let succeeded = 0;
  let failed = 0;

  for (const entry of queue) {
    if (entry.status === 'failed') {
      remaining.push(entry); // Keep failed entries
      continue;
    }

    try {
      // Calculate backoff delay
      const delay = entry.retryCount < BACKOFF_SCHEDULE.length
        ? BACKOFF_SCHEDULE[entry.retryCount]
        : BACKOFF_SCHEDULE[BACKOFF_SCHEDULE.length - 1];

      if (entry.retryCount > 0) {
        console.log(`[OfflineQueue] Retrying ${entry.clientId} in ${delay}ms (attempt ${entry.retryCount + 1})`);
        await sleep(delay);
      }

      // Attempt submission
      const result = await submitFn(entry.payload);

      if (result.success) {
        console.log(`[OfflineQueue] Successfully synced ${entry.clientId}`);
        succeeded++;
      } else {
        throw new Error('Submission failed');
      }

    } catch (error) {
      console.error(`[OfflineQueue] Failed to sync ${entry.clientId}:`, error);

      entry.retryCount++;
      entry.status = entry.retryCount >= entry.maxRetries ? 'failed' : 'retrying';

      if (entry.status === 'failed') {
        console.log(`[OfflineQueue] Marked ${entry.clientId} as failed after ${entry.retryCount} attempts`);
        failed++;
      }

      remaining.push(entry);
    }
  }

  await saveQueue(remaining);
  return { succeeded, failed };
}

/**
 * Clear failed entries from queue (user action)
 */
export async function clearFailedEntries() {
  const queue = await loadQueue();
  const activeQueue = queue.filter(entry => entry.status !== 'failed');
  await saveQueue(activeQueue);
  return queue.length - activeQueue.length; // Return number cleared
}

/**
 * Get failed entries for UI display
 */
export async function getFailedEntries() {
  const queue = await loadQueue();
  return queue.filter(entry => entry.status === 'failed');
}

// ─── Utility functions ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
