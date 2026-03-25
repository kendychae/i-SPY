# CSE 499 Sprint Record

**Week 4**

This record is for (Put an X on one): **_ W03 Sprint 1 | \*\*\_X_ W04 Sprint 2\*\* | \_** W05 Sprint 3 | \_\_\_ W06 Sprint 4

---

## Accountability Record

Record each team member's activity. Each team member should open the document on their own computer and type their name in the column for the activity they participated in as a signature that they affirm they completed the activity.

| Person               | Completed Planning (by Tuesday) | Attended Standup     |
| -------------------- | ------------------------------- | -------------------- |
| Kendahl Chae Bingham | Kendahl Chae Bingham            | Kendahl Chae Bingham |
| Samuel Iyen Evbosaru | Samuel Iyen Evbosaru            | Samuel Iyen Evbosaru |
| Brenden Taylor Lyon  | Brenden Taylor Lyon             | Brenden Taylor Lyon  |
| Figuelia Ya'Sin      | Figuelia Ya'Sin                 | Figuelia Ya'Sin      |

---

## Sprint Planning

No later than Tuesday each team member should record what features they will be working on for the sprint.

### Feature 1: Incident Reporting System

**Lead:** Kendahl Chae Bingham

| Person Assigned      | Task Name & Brief Description                               | Est. Hours |
| -------------------- | ----------------------------------------------------------- | ---------- |
| Kendahl Chae Bingham | Design report submission flow and API contracts             | 5          |
| Kendahl Chae Bingham | Set up testing framework (Jest) and write integration tests | 6          |
| Samuel Iyen Evbosaru | Create POST /api/reports endpoint with validation           | 7          |
| Samuel Iyen Evbosaru | Implement report listing with filtering (GET /api/reports)  | 6          |
| Brenden Taylor Lyon  | Build report submission form screen with validation         | 8          |
| Brenden Taylor Lyon  | Create report list screen with filter functionality         | 7          |
| Figuelia Ya'Sin      | Implement image picker and camera functionality             | 6          |
| Figuelia Ya'Sin      | Create image upload service with compression                | 5          |

### Feature 2: Map Integration with Location Services

**Lead:** Brenden Taylor Lyon

| Person Assigned      | Task Name & Brief Description                             | Est. Hours |
| -------------------- | --------------------------------------------------------- | ---------- |
| Brenden Taylor Lyon  | Integrate React Native Maps with location tracking        | 8          |
| Brenden Taylor Lyon  | Display user location and incident markers on map         | 6          |
| Kendahl Chae Bingham | Define map marker clustering algorithm and data structure | 4          |
| Figuelia Ya'Sin      | Implement GPS location capture for incident reports       | 5          |
| Figuelia Ya'Sin      | Add address lookup using reverse geocoding API            | 5          |
| Samuel Iyen Evbosaru | Create geospatial queries for nearby incidents            | 6          |

### Feature 3: File Upload and Storage

**Lead:** Samuel Iyen Evbosaru

| Person Assigned      | Task Name & Brief Description                                 | Est. Hours |
| -------------------- | ------------------------------------------------------------- | ---------- |
| Samuel Iyen Evbosaru | Set up Multer middleware for file uploads                     | 4          |
| Samuel Iyen Evbosaru | Implement file storage system with proper naming/organization | 5          |
| Samuel Iyen Evbosaru | Create media table and link to reports                        | 3          |
| Figuelia Ya'Sin      | Build media preview component for uploaded files              | 4          |
| Figuelia Ya'Sin      | Design and implement users table migration (W3 carryover)     | 5          |
| Kendahl Chae Bingham | Define file validation rules (size, type, security)           | 3          |

---

## Standup

Record the results of your standup meeting (Final Sprint Meeting — March 23, 2026).

| Person               | Feature/Task                       | Progress Notes                                                                               | Blockers/Help Needed |
| -------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| Kendahl Chae Bingham | Report API Design & Docs           | Completed — full OpenAPI-style docs for all CRUD endpoints in docs/API-REPORTS.md            | None                 |
| Kendahl Chae Bingham | Jest Testing Framework             | Completed — integration tests for auth and report flows, 3 bugs caught pre-production        | None                 |
| Kendahl Chae Bingham | Map Clustering Algorithm           | Completed — grid-based clustering spec documented in docs/MAP-CLUSTERING.md                  | None                 |
| Kendahl Chae Bingham | File Validation Rules              | Completed — magic-number file signature checks, MIME validation in upload.middleware         | None                 |
| Kendahl Chae Bingham | Team Coordination & Code Reviews   | Completed — reviewed & merged Lyon PR #43 and Iyen branch, resolved conflicts                | None                 |
| Samuel Iyen Evbosaru | POST /api/reports Endpoint         | Completed — full validation, image URL storage, integration tested                           | None                 |
| Samuel Iyen Evbosaru | GET /api/reports with Filtering    | Completed — category, status, pagination filters working                                     | None                 |
| Samuel Iyen Evbosaru | Multer File Upload Middleware      | Completed — POST /api/v1/reports/upload with report linking                                  | None                 |
| Samuel Iyen Evbosaru | File Storage System                | Completed — uploads/{userId}/{date}/{type}/{filename} structure implemented                  | None                 |
| Samuel Iyen Evbosaru | Media Table & Report Linking       | Completed — media controller with addMediaToReport and getMediaByReport                      | None                 |
| Samuel Iyen Evbosaru | Geospatial Queries                 | Completed — PostGIS queries for nearby incidents in utils/geospatial.js                      | None                 |
| Brenden Taylor Lyon  | React Native Maps Integration      | Completed — maps working with location tracking; Kendahl provided Google Maps API key        | None                 |
| Brenden Taylor Lyon  | Display Incident Markers on Map    | Completed — custom markers for each incident category displayed on map                       | None                 |
| Brenden Taylor Lyon  | Report Submission Form             | Completed — inline field validation, status messages, AuthContext integrated                 | None                 |
| Brenden Taylor Lyon  | Report List Screen with Filters    | Completed — filter by category/status, list rendering with pull-to-refresh                   | None                 |
| Brenden Taylor Lyon  | Auth Context & Show/Hide Password  | Completed — AuthContext exported from App.js, show/hide toggle on login & register           | None                 |
| Figuelia Ya'Sin      | Image Picker & Camera              | Completed — camera and gallery options both working with permissions                         | None                 |
| Figuelia Ya'Sin      | Image Upload Service & Compression | Completed — compression reduces upload size by ~60%; tied to report submission               | None                 |
| Figuelia Ya'Sin      | GPS Location Capture               | Completed — tested on physical device; location auto-populated on report form                | None                 |
| Figuelia Ya'Sin      | Reverse Geocoding (Address Lookup) | Completed — Google reverse geocoding converts coordinates to readable address                | None                 |
| Figuelia Ya'Sin      | Media Preview Component            | Completed — MediaPreview.js renders image/video thumbnails before submission                 | None                 |
| Figuelia Ya'Sin      | Users Table Migration (W3 #11)     | Completed — standalone 001_create_users_table.sql migration with UUID PK, 4 indexes, trigger | None                 |

---

## Sprint Goals Summary

**Sprint Duration:** Week 4 (March 17-23, 2026)  
**Sprint Lead:** Kendahl Chae Bingham

### Primary Objectives:

1. ✅ Enable users to create and submit incident reports
2. ✅ Implement photo/video attachment functionality
3. ✅ Integrate map view with location tracking
4. ✅ Build report listing and filtering system
5. ✅ Establish automated testing infrastructure

### Team Member Responsibilities:

**Kendahl Chae Bingham (Team Lead):**

- Design report submission API contracts
- Set up Jest testing framework with integration tests
- Define map marker clustering strategy
- Establish file upload security and validation rules
- Coordinate sprint activities, conduct code reviews, merge teammate branches
- Total estimated hours: 25 | **Actual hours worked: 30.5**

**Samuel Iyen Evbosaru (Backend Developer):**

- Create report submission and listing endpoints
- Implement file upload middleware with Multer
- Build geospatial queries for location-based features
- Create media storage table and relationships
- Total estimated hours: 31 | **Actual hours worked: 28**

**Brenden Taylor Lyon (Frontend Developer):**

- Integrate React Native Maps with location services
- Build report submission form with inline validation and AuthContext
- Create report listing screen with filters
- Display incident markers on interactive map
- Add show/hide password toggle and per-field validation to auth screens
- Total estimated hours: 29 | **Actual hours worked: 27**

**Figuelia Ya\'Sin (Full-Stack Developer):**

- Implement image picker and camera functionality
- Create image upload service with compression
- Add GPS location capture for reports
- Implement reverse geocoding for addresses
- Build media preview components
- Total estimated hours: 25 | **Actual hours worked: 27**

### Success Criteria:

- Users can create reports with photos from camera or gallery
- Reports are displayed on map with location markers
- Report listing shows all submissions with filter options
- File uploads are validated and stored securely
- Automated tests cover critical user flows
- All code passes review and is merged to main branch
