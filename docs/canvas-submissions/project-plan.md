# CSE 499: Senior Project

## VIGILUX - Neighborhood Watch Mobile Application

**Course:** CSE 499 - Senior Project  
**Assignment:** W2-project-plan  
**Date:** March 9, 2026

**Team Members:**

- Kendahl Chae Bingham (Project Lead) - @kendychae
- Samuel Iyen Evbosaru (Backend Developer) - @terrywhyte001
- Brenden Taylor Lyon (Frontend Developer) - @richardlyonheart

**Repository:** https://github.com/kendychae/VIGILUX

---

## Project Overview

VIGILUX is a mobile application that enables citizens to report and track illegal activities in their neighborhoods. The app provides secure incident reporting with photo evidence, GPS location tracking, and real-time status updates. Law enforcement officers can manage reports through a dedicated dashboard, update case statuses, and communicate with citizens, improving public safety through better community-police collaboration.

---

## 1. Requirements

### Requirement 1: User Authentication and Authorization

**Description:** Secure user registration and login system supporting different roles (citizens and law enforcement officers).

**User Stories:**

- As a **citizen**, I want to create an account using my email and password so that I can access the app securely.
- As a **citizen**, I want to login to my account so that I can submit and track my incident reports.
- As an **officer**, I want to login with my law enforcement credentials so that I can access the officer dashboard and manage citizen reports.
- As a **user**, I want to reset my password if I forget it so that I can regain access to my account.

---

### Requirement 2: Incident Report Submission

**Description:** Allow citizens to submit incident reports with photos, location data, and categorization.

**User Stories:**

- As a **citizen**, I want to submit an incident report with a title, description, and category so that law enforcement knows what happened.
- As a **citizen**, I want to attach up to 5 photos to my report so that I can provide visual evidence.
- As a **citizen**, I want the app to automatically capture my GPS location so that officers know where the incident occurred.
- As a **citizen**, I want to manually enter an address if GPS is unavailable so that I can still specify the location.
- As a **citizen**, I want to preview my report before submitting so that I can verify all information is correct.

---

### Requirement 3: Report Status Tracking

**Description:** Enable citizens to view their submitted reports and track status through the investigation lifecycle.

**User Stories:**

- As a **citizen**, I want to see a list of all my submitted reports so that I can track their progress.
- As a **citizen**, I want to view detailed information about each report including status, submission date, and updates.
- As a **citizen**, I want to see status indicators (Submitted, Under Review, Investigating, Resolved, Closed) so that I understand the investigation stage.
- As a **citizen**, I want to receive notifications when my report status changes so that I stay informed.

---

### Requirement 4: Law Enforcement Dashboard

**Description:** Provide officers with a dashboard to view, manage, and update incident reports.

**User Stories:**

- As an **officer**, I want to see all submitted reports in a queue so that I can manage incidents efficiently.
- As an **officer**, I want to view full report details including photos, location, and contact information.
- As an **officer**, I want to update the status of reports so that citizens are informed of progress.
- As an **officer**, I want to add comments to reports so that I can document actions taken.
- As an **officer**, I want to filter and search reports by date, category, and status.

---

### Requirement 5: Push Notifications

**Description:** Real-time notification system alerting citizens of report status changes.

**User Stories:**

- As a **citizen**, I want to receive push notifications when my report status changes so that I'm immediately informed.
- As a **citizen**, I want to control my notification preferences so that I can choose what alerts I receive.
- As a **citizen**, I want to view a notification history in the app so that I can review past alerts.

---

## 2. Schedule - 4 One-Week Sprints

### Sprint 1: Foundation and Authentication (Week 3 of 7)

**Sprint Goal:** Establish development infrastructure and implement user authentication.

**Milestones:**

- Database schema implemented with all required tables (users, reports, media, notifications)
- Backend API server with authentication endpoints (register, login, password reset)
- Mobile app project initialized with navigation structure
- User registration and login screens functional
- JWT-based authentication working end-to-end
- Role-based access control implemented (citizen vs. officer)

---

### Sprint 2: Incident Report Submission (Week 4 of 7)

**Sprint Goal:** Enable citizens to submit incident reports with photos and location.

**Milestones:**

- Report submission form UI complete with all fields
- Photo upload functionality working (up to 5 photos per report)
- GPS location capture and manual address entry implemented
- Backend API endpoint for creating reports functional
- Image storage solution implemented
- Form validation for all required fields

---

### Sprint 3: Report Tracking and Management (Week 5 of 7)

**Sprint Goal:** Allow citizens to track reports and officers to update statuses.

**Milestones:**

- "My Reports" list screen showing all user submissions
- Report detail screen displaying full information and status
- Status update capability for officers in dashboard
- Backend APIs for fetching and updating reports
- Status change history visible to users
- Officer dashboard with report queue

---

### Sprint 4: Push Notifications and Polish (Week 6 of 7)

**Sprint Goal:** Implement notifications and refine all features.

**Milestones:**

- Firebase Cloud Messaging integrated with mobile app
- Push notifications sent when report status changes
- Notification preferences screen for users
- In-app notification center showing history
- Officer dashboard enhanced with filtering and search
- Comment system for officers to add notes
- Bug fixes and UI polish across all screens

---

## 3. Architecture

VIGILUX follows a **three-tier client-server architecture**:

**Presentation Tier (Mobile Client):** React Native mobile application running on iOS and Android devices. Handles user interface, input validation, and user interactions. Communicates with backend via RESTful API over HTTPS and integrates with device capabilities (camera, GPS, push notifications).

**Application Tier (Backend API Server):** Node.js + Express.js REST API server that processes business logic, authentication, and authorization. Handles file uploads, database queries, and integrates with Firebase Cloud Messaging for push notifications. Enforces security policies and data validation.

**Data Tier (Database):** PostgreSQL relational database storing user accounts, incident reports, media metadata, and notifications. Implements data integrity constraints, triggers, and handles geospatial queries.

**Communication Flow:** Users interact with the React Native mobile app, which sends authenticated API requests to the Express.js backend. The backend validates requests, performs business logic, queries the PostgreSQL database, and returns JSON responses. Push notifications flow from backend through Firebase to mobile devices.

---

## 4. Technology

### Frontend - Mobile Application

**React Native (Expo Framework):** Cross-platform mobile development framework enabling a single JavaScript codebase for both iOS and Android. Expo provides managed workflow simplifying build and deployment.

**Key Libraries:** React Navigation (screen navigation), Axios (HTTP client), React Native Maps (maps/location), Expo Camera & Image Picker (photo capture), AsyncStorage (local storage), Firebase SDK (push notifications).

### Backend - API Server

**Node.js (v18+) with Express.js:** JavaScript runtime and lightweight web framework for building RESTful APIs. Non-blocking I/O ideal for handling concurrent requests.

**Key Libraries:** pg (PostgreSQL client), bcrypt (password hashing), jsonwebtoken (JWT authentication), multer (file uploads), helmet (security headers), express-validator (input validation), firebase-admin (push notifications).

### Database

**PostgreSQL (v14+):** Open-source relational database with ACID compliance, robust transaction support, and excellent geospatial capabilities. Stores users, reports, media, and notifications with referential integrity.

### Supporting Technologies

- **Firebase Cloud Messaging:** Push notification service for iOS and Android
- **Git + GitHub:** Version control and project management
- **VS Code:** Development IDE
- **Expo Go:** Mobile app testing on physical devices

---

## Course Timeline

**CSE 499 Duration:** 7 weeks total  
**Core Development:** Weeks 3-6 (4 one-week sprints)  
**Week 7:** Final testing, documentation, and project presentation

---

_Document Version: 2.0 - Concise version aligned with W02 rubric requirements_
