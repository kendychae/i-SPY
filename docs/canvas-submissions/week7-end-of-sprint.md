# CSE 499 End of Sprint Report

**Sprint:** Week 7 (W07 Final Sprint — App Store Submission)
**Name:** Kendahl Chae Bingham (Team Lead)
**Date:** March 21, 2026

---

## GitHub Links

Enter the link to the most recent commit you have created for this sprint.

1. https://github.com/kendychae/VIGILUX/tree/kendahlbingham

---

## Task Report

Report on the tasks for which you were the lead person:

| Task Name                                        | Estimated Hours | Hours Worked | Percent Complete | Is this blocked by something outside of your control? If so, describe.                       |
| ------------------------------------------------ | --------------- | ------------ | ---------------- | -------------------------------------------------------------------------------------------- |
| Configure EAS Build (iOS & Android)              | 6               | 7            | 90%              | Yes — Apple Developer Account provisioning profile approval is pending (external dependency) |
| App Store Connect listing creation               | 8               | 6            | 70%              | Partial — awaiting final brand asset PNGs from designer                                      |
| Google Play Console listing creation             | 8               | 7            | 80%              | Partial — app screenshots need production device test run                                    |
| Rate limiting middleware on public API endpoints | 3               | 3            | 100%             | No                                                                                           |
| Production secrets rotation (JWT, DB, keys)      | 3               | 3            | 100%             | No                                                                                           |
| Final project report and retrospective           | 5               | 5            | 100%             | No                                                                                           |

**Total Hours:** Estimated: 33 | Actual: 31

---

## Personal Retrospective

### Things I did well (at least one):

1. **Automated production fixes proactively:** Identified and resolved 8 production-blocking issues before App Store submission (hardcoded API IP, open CORS, wrong Android build type, memory leak, missing icon/splash, user ID field mismatch) — preventing potential rejection from both app stores.

2. **Environment architecture:** Refactored API URL and Google Maps keys to use EAS environment variables per build profile (development / preview / production), ensuring secrets never appear in source control and each environment points to the correct backend.

3. **Complete document recovery:** Recovered and reconstructed all missing canvas submission documents (Week 4–7) that were lost during the OneDrive to GitHub migration, ensuring academic compliance.

4. **Team coordination through final sprint:** Kept the team aligned across parallel workstreams (backend deployment, mobile build config, store listing, UI polish) with minimal blockers and 100% standup attendance.

5. **Structured audit and systematization:** Conducted a full production readiness audit of the entire codebase — frontend, backend, build config, docs — and created a prioritized fix list for the team, demonstrating strong technical ownership.

---

### Things I will improve for next week (at least one):

1. **Earlier App Store account setup:** iOS provisioning profile approval took longer than expected because we initiated it late. For future projects, Apple Developer Account setup should happen at project kickoff in Week 1.

2. **Design asset pipeline:** We didn't establish a clear handoff pipeline between Figma designs and exported Expo assets until the final sprint. A design-to-asset automation workflow (e.g., using Figma API or export scripts) should be set up in the first sprint.

3. **Secret management from day one:** Secrets (JWT keys, Maps API keys, DB passwords) were committed in plaintext for development convenience and needed late remediation. A `.env`-only + EAS secrets strategy should be enforced from the very first commit.

4. **Dedicated QA device pool:** We lacked a dedicated Android test device with Play Store access, blocking final smoke testing. A shared test device setup (or use of BrowserStack/Expo Orbit) should be arranged by Week 3.

---

## Sprint Achievements

### Completed Features and Fixes:

- ✅ Critical bug fixed: `req.user.id` → `req.user.userId` (report creation was silently failing)
- ✅ CORS restricted to configured origins (was wide open)
- ✅ Android EAS build type changed to `app-bundle` (APK rejected by Play Store)
- ✅ MapScreen location watcher memory leak resolved (cleanup on unmount)
- ✅ API URL moved from hardcoded local IP to EAS per-profile env var
- ✅ Google Maps API keys removed from `app.json` plaintext, now use EAS env vars
- ✅ App icon (1024×1024), adaptive icon, splash (1284×2778), and favicon generated
- ✅ EAS submit config populated for iOS App Store and Google Play Store
- ✅ Backend deployed to production (Render)
- ✅ Production database configured with proper credentials
- ✅ Week 7 sprint record and end-of-sprint documents created (recovered from OneDrive)

### App Status at End of Week 7:

| Area                | Status       | Notes                                               |
| ------------------- | ------------ | --------------------------------------------------- |
| Authentication      | ✅ Complete  | JWT + refresh tokens, SecureStore on device         |
| Incident Reporting  | ✅ Complete  | Full CRUD, image upload, geo-tagging                |
| Map View            | ✅ Complete  | Google Maps, live markers, location watcher fixed   |
| Push Notifications  | ✅ Complete  | FCM integration (backend sends, app receives)       |
| Officer Dashboard   | ✅ Complete  | Role-based access, report assignment/claiming       |
| Search & Filtering  | ✅ Complete  | Full-text PostgreSQL search, multi-criteria filters |
| Profile / Settings  | 🟡 Partial   | View works; Edit Profile screen is stubbed          |
| iOS App Store Build | 🟡 In Review | Provisioning profile approval pending               |
| Android Play Store  | 🟡 In Review | AAB uploaded to internal track                      |
| Final Brand Assets  | 🟡 Pending   | Placeholder PNGs in place; final design in Figma    |

### Team Performance:

- 100% standup attendance maintained through final sprint
- All critical production issues resolved before external submission
- Total team hours (Week 7): ~120 (planned: 115)
- Repository: https://github.com/kendychae/VIGILUX (branch: kendahlbingham)
