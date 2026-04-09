# VIGILUX — Final Presentation Video Script

**CSE 499 | Team VIGILUX**
**Target Length: ~8 minutes**
**Format: Screen-recorded Zoom call, demo via `expo start --web`**

---

## PRE-RECORDING CHECKLIST

- [ ] Backend running locally: `cd backend && npm start`
- [ ] Frontend web running: `cd frontend && npx expo start --web` → open `http://localhost:8081`
- [ ] Browser at 100% zoom, full screen
- [ ] Two browser tabs ready: one logged in as **citizen**, one logged in as **officer/admin**
- [ ] Seed data loaded (a few reports visible on Home)
- [ ] Zoom recording started
- [ ] Everyone's camera on for intro, then one person shares screen for demo

---

## PART 1 — INTRO (1 min)

_All cameras on. Kendahl leads._

**KENDAHL:**

> "Hi, we're Team VIGILUX from CSE 499. Our app is a neighborhood watch platform that lets citizens report incidents and lets law enforcement manage and respond to them in real time.
>
> Today we'll walk you through the final version of the app — built with React Native using Expo, a Node.js backend on PostgreSQL, and deployable to both iOS and Android. Let's jump in."

_[Kendahl now shares screen — browser tab with VIGILUX web app at the login screen]_

---

## PART 2 — DEMO (5 min)

_Kendahl drives the demo. The others narrate their features._

### 2a. Login (30 sec)

**KENDAHL:**

> "Here's the login screen. You can see we replaced the placeholder logo with a proper shield icon — the app is fully emoji-free and ready for App Store submission."

_[Type credentials → tap Login]_

> "We're now logged in as a citizen user."

---

### 2b. Home Screen + Search (1 min)

**KENDAHL:**

> "This is the Home screen. We implemented full-text search this sprint — powered by a PostgreSQL tsvector GIN index with ts_rank relevance ordering."

_[Tap the search icon → type a keyword like "theft"]_

> "Results update in real time with 300-millisecond debounce so we don't hammer the API on every keystroke."

**FIGUELIA (narrates, camera on):**

> "I built the filter chip row below the search bar — users can filter by incident category and status without leaving the screen."

_[Tap a category chip like "Theft" → show filtered results]_

---

### 2c. Submit a Report (1 min)

**SAMUEL (narrates):**

> "Tap the Report tab. I built the offline-first submission system — reports are queued locally with a UUID idempotency key using react-native-uuid. When connectivity returns, they automatically retry with exponential backoff, so nothing is ever lost."

_[Fill in title, pick an incident type, add a description → Submit]_

> "Even in a no-signal area, the app stores the report and syncs when you're back online."

---

### 2d. Notifications (30 sec)

**BRENDEN (narrates):**

> "The Notifications screen shows real-time updates via FCM — status changes, assignments, and nearby incidents. Notification types are displayed with clean badge labels instead of emoji."

_[Switch to Notifications tab — show the list]_

---

### 2e. Officer Dashboard (1.5 min)

**KENDAHL:**

> "Now let me switch to our officer account."

_[Switch to second browser tab — already logged in as officer/admin]_

> "Officers see a Dashboard tab. This is ticket #62 — the Officer Dashboard Screen."

_[Tap Dashboard tab]_

**FIGUELIA:**

> "The queue has three views: All reports, Unassigned, and Mine. Officers can claim and unclaim reports directly from this screen with optimistic UI updates — no spinner, instant feedback."

_[Tap "Unassigned" tab → Tap "Claim" on a report → watch it move to "Mine"]_

**KENDAHL:**

> "On the backend, #58 gave us the assign/unclaim API, and this sprint's ticket #60 added full-text search to the reports endpoint so officers can search by keyword too."

---

## PART 3 — TECH STACK (1 min)

_Return to cameras. Samuel leads._

**SAMUEL:**

> "Quick tech overview: React Native with Expo SDK 54 on the frontend, React Navigation v7 for routing. On the backend — Node.js with Express, PostgreSQL with PostGIS for geospatial queries, JWT authentication, and Expo push notifications for FCM. The offline queue uses AsyncStorage with UUID-based deduplication."

**BRENDEN:**

> "For maps, react-native-maps on mobile — the web build shows a placeholder since native maps don't run in the browser. The real map demo is on the mobile build."

---

## PART 4 — SPRINT SUMMARY (30 sec)

**KENDAHL:**

> "Over 7 sprints, the team delivered 63 GitHub tickets. This final sprint closed tickets #60, #62, and #63 — completing the search API, officer dashboard, and search UI — plus a full emoji-removal pass to make the app App Store-ready. The backend is deployed on Render and the EAS build is configured for both iOS App Store and Google Play."

---

## PART 5 — TEAM CREDITS (30 sec)

_All cameras on._

**KENDAHL:** "Team lead, architecture, officer dashboard UI, search UI."
**SAMUEL:** "Backend API, offline sync, database migrations, deployment."
**BRENDEN:** "Notifications, map screen, UI components, push notifications."
**FIGUELIA:** "Filter chips, report screen, PR contributions, accessibility."

**ALL:**

> "Thanks for watching!"

---

## BACKUP DEMO NOTES (if something breaks)

| Issue                     | Workaround                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| Backend not running       | Show the UI anyway — most read paths still function                       |
| Login fails               | Use the pre-seeded admin: `admin@vigilux.com` / `Admin123!`               |
| Web map shows placeholder | Expected — mention maps are native-only, show mobile screenshot           |
| Search returns no results | Make sure migration 006 ran: `cd backend && node src/database/migrate.js` |
| Officer tab not visible   | Verify you're logged in as officer/admin role                             |
