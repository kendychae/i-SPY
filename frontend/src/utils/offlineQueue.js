/**
 * offlineQueue.js
 * Issue #55 — W5: Offline Support — AsyncStorage Caching & Submission Queue
 *
 * Provides:
 *  - Stale-while-revalidate caching for the reports list and individual reports
 *  - An offline submission queue that survives app restarts
 *  - Network-restore processing with exponential backoff (up to 3 retries)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cache keys & TTLs ────────────────────────────────────────────────────────
const KEYS = {
  REPORTS_LIST: 'cache:reports_list',
  REPORT_ITEM: (id) => `cache:report:${id}`,
  SUBMISSION_QUEUE: 'offline:submission_queue',
};

const TTL_MS = {
  REPORTS_LIST: 5 * 60 * 1000,   // 5 minutes
  REPORT_ITEM:  10 * 60 * 1000,  // 10 minutes
};

// ─── Cache helpers ────────────────────────────────────────────────────────────

/**
 * Write data to AsyncStorage with a timestamp for TTL checking.
 */
async function cacheSet(key, data) {
  const entry = { data, cachedAt: Date.now() };
  await AsyncStorage.setItem(key, JSON.stringify(entry));
}

/**
 * Read cached data. Returns { data, stale } where stale=true means the cache
 * is expired but still usable for optimistic display.
 */
async function cacheGet(key, ttlMs) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const age = Date.now() - entry.cachedAt;
    return { data: entry.data, stale: age > ttlMs };
  } catch {
    return null;
  }
}

// ─── Reports List Cache ───────────────────────────────────────────────────────

export async function cacheReportsList(reports) {
  await cacheSet(KEYS.REPORTS_LIST, reports);
}

/**
 * @returns {{ data: any, stale: boolean } | null}
 */
export async function getCachedReportsList() {
  return cacheGet(KEYS.REPORTS_LIST, TTL_MS.REPORTS_LIST);
}

// ─── Individual Report Cache ──────────────────────────────────────────────────

export async function cacheReport(id, report) {
  await cacheSet(KEYS.REPORT_ITEM(id), report);
}

export async function getCachedReport(id) {
  return cacheGet(KEYS.REPORT_ITEM(id), TTL_MS.REPORT_ITEM);
}

// ─── Offline Submission Queue ─────────────────────────────────────────────────

/**
 * Add a failed report submission to the persistent queue.
 * @param {object} reportData  — FormData-compatible plain object payload
 */
export async function enqueueSubmission(reportData) {
  const queue = await getQueue();
  queue.push({
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reportData,
    retries: 0,
    enqueuedAt: Date.now(),
  });
  await AsyncStorage.setItem(KEYS.SUBMISSION_QUEUE, JSON.stringify(queue));
}

async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SUBMISSION_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue) {
  await AsyncStorage.setItem(KEYS.SUBMISSION_QUEUE, JSON.stringify(queue));
}

/**
 * Return the current queue length (for the "N reports pending sync" indicator).
 */
export async function getQueueLength() {
  const q = await getQueue();
  return q.length;
}

/**
 * Process the offline queue by attempting to submit each item.
 * Call this when network connectivity is restored.
 *
 * @param {function} submitFn  — async fn(reportData) that returns { success: boolean }
 * @param {function} onProgress  — optional callback({ pending, succeeded, failed })
 */
export async function processQueue(submitFn, onProgress) {
  const queue = await getQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  const MAX_RETRIES = 3;
  const remaining = [];
  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 1s, 2s, 4s
          await sleep(1000 * Math.pow(2, attempt - 1));
        }
        const result = await submitFn(item.reportData);
        success = result?.success ?? false;
      } catch {
        // Network or server error — will retry
      }
      attempt++;
    }

    if (success) {
      succeeded++;
    } else {
      failed++;
      remaining.push({ ...item, retries: item.retries + attempt });
    }

    if (onProgress) {
      onProgress({ pending: remaining.length, succeeded, failed });
    }
  }

  await saveQueue(remaining);
  return { succeeded, failed };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
