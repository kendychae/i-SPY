# CSE 499: Senior Project

## iSPY - Neighborhood Watch Mobile Application

**Course:** CSE 499 - Senior Project  
**Assignment:** W2-project-plan  
**Date:** March 9, 2026

**Team Members:**

- Kendahl Chae Bingham (Project Lead) - @kendychae
- Samuel Iyen Evbosaru (Backend Developer) - @terrywhyte001
- Brenden Taylor Lyon (Frontend Developer) - @richardlyonheart

**Repository:** https://github.com/kendychae/i-SPY  
**Project Board:** https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning

---

## 1. Executive Summary

iSPY is a mobile application designed to empower communities by providing a secure, efficient platform for reporting and tracking illegal activities. The application bridges the communication gap between residents and local law enforcement, improving public safety through real-time incident reporting, multimedia evidence submission, and transparent status tracking.

---

## 2. Requirements

### 2.1 Core Requirements

#### Core Requirement 1: User Authentication and Authorization

**Description:** Secure user registration and login system that supports different user roles (citizens and law enforcement officers) with appropriate access controls.

**User Stories:**

- As a **citizen**, I want to create an account using my email and password so that I can access the app securely.
- As a **citizen**, I want to login to my account so that I can submit and track my incident reports.
- As an **officer**, I want to login with my law enforcement credentials so that I can access the officer dashboard and manage citizen reports.
- As a **user**, I want to reset my password if I forget it so that I can regain access to my account.

---

#### Core Requirement 2: Incident Report Submission

**Description:** Allow citizens to submit detailed incident reports with multimedia evidence (photos), location data, and categorization.

**User Stories:**

- As a **citizen**, I want to submit an incident report with a title, description, and category so that law enforcement knows what happened.
- As a **citizen**, I want to attach up to 5 photos to my report so that I can provide visual evidence of the incident.
- As a **citizen**, I want the app to automatically capture my GPS location so that officers know exactly where the incident occurred.
- As a **citizen**, I want to manually enter an address if GPS is unavailable so that I can still specify the incident location.
- As a **citizen**, I want to preview my report before submitting so that I can verify all information is correct.

---

#### Core Requirement 3: Report Status Tracking

**Description:** Enable citizens to view all their submitted reports and track the current status of each report through its lifecycle.

**User Stories:**

- As a **citizen**, I want to see a list of all my submitted reports so that I can track their progress.
- As a **citizen**, I want to view detailed information about each report including status, submission date, and any updates so that I know how my report is being handled.
- As a **citizen**, I want to see status indicators (Submitted, Under Review, Investigating, Resolved, Closed) so that I understand where my report is in the process.
- As a **citizen**, I want to receive notifications when my report status changes so that I stay informed without constantly checking the app.

---

#### Core Requirement 4: Law Enforcement Dashboard

**Description:** Provide law enforcement officers with a dashboard to view, manage, and update citizen-submitted incident reports.

**User Stories:**

- As an **officer**, I want to see all submitted reports in a queue so that I can manage incoming incidents efficiently.
- As an **officer**, I want to view full report details including photos, location, and citizen contact information so that I have all the information needed to respond.
- As an **officer**, I want to update the status of reports so that citizens are informed of progress.
- As an **officer**, I want to add comments to reports so that I can document actions taken and communicate with citizens.
- As an **officer**, I want to filter and search reports by date, category, and status so that I can quickly find specific incidents.

---

#### Core Requirement 5: Push Notifications

**Description:** Real-time notification system to alert citizens when their report status changes and keep them engaged with the investigation process.

**User Stories:**

- As a **citizen**, I want to receive push notifications when my report status changes so that I'm immediately informed of updates.
- As a **citizen**, I want to control my notification preferences so that I can choose what types of alerts I receive.
- As a **citizen**, I want to view a notification history in the app so that I can review past alerts even if I dismissed them.

---

### 2.2 Enhancement Requirements

#### Enhancement 1: Interactive Map View

**Description:** Visual map interface displaying all reported incidents with filtering capabilities and location-based insights.

**User Stories:**

- As a **citizen**, I want to view incidents on an interactive map so that I can see what's happening in my neighborhood visually.
- As a **citizen**, I want to filter incidents by date range and category so that I can focus on specific types of activity.
- As an **officer**, I want to see a heatmap of crime hotspots so that I can identify areas that need increased patrol.
- As a **user**, I want to tap on map markers to see incident details so that I can learn more about specific reports.

---

#### Enhancement 2: Video Upload Support

**Description:** Extend multimedia evidence capabilities to support video uploads in addition to photos.

**User Stories:**

- As a **citizen**, I want to upload videos up to 2 minutes long so that I can provide more detailed evidence than photos alone.
- As a **citizen**, I want the app to compress videos automatically so that uploads don't take too long or use too much data.
- As an **officer**, I want to view uploaded videos directly in the report detail screen so that I can review all evidence efficiently.

---

#### Enhancement 3: Advanced Analytics Dashboard

**Description:** Data visualization and analytics tools for law enforcement to identify crime trends, patterns, and resource allocation opportunities.

**User Stories:**

- As an **officer**, I want to see graphs of incident trends over time so that I can identify if crime is increasing or decreasing.
- As an **officer**, I want to view analytics by incident category so that I know which types of crimes are most common.
- As a **senior officer**, I want to generate custom reports for specific date ranges and areas so that I can present data to stakeholders.
- As an **officer**, I want to export analytics data so that I can perform additional analysis in other tools.

---

#### Enhancement 4: Anonymous Reporting

**Description:** Allow users to submit incident reports anonymously without creating an account, lowering the barrier for sensitive reports.

**User Stories:**

- As a **concerned citizen**, I want to submit a report without creating an account so that I can report sensitive incidents while protecting my identity.
- As an **anonymous reporter**, I want to receive a unique tracking code so that I can check on my report status later without logging in.
- As an **officer**, I want to know which reports are anonymous so that I understand I cannot directly contact the reporter.

---

## 3. Project Schedule - 4 One-Week Sprints

> **Note:** This schedule represents the core development phase of the semester. Additional sprints for testing, refinement, and enhancements will follow.

### Sprint 1: Foundation and Authentication (Week 3)

**Sprint Goal:** Establish development infrastructure and implement user authentication system.

**Milestones:**

- ✅ Database schema implemented with all tables, indexes, and triggers
- ✅ Backend API server setup with authentication endpoints (register, login, password reset)
- ✅ Mobile app project initialized with navigation structure
- ✅ User registration and login screens functional
- ✅ JWT-based authentication working end-to-end
- ✅ Role-based access control implemented (citizen vs. officer roles)

**Deliverables:**

- PostgreSQL database with schema deployed
- Authentication API endpoints tested and documented
- Mobile app with working registration/login flow
- Unit tests for authentication logic

---

### Sprint 2: Incident Report Submission (Week 4)

**Sprint Goal:** Enable citizens to submit incident reports with photos and location data.

**Milestones:**

- Report submission form UI complete with all fields (title, description, category, date/time)
- Photo upload functionality working (up to 5 photos per report)
- GPS location capture and manual address entry implemented
- Backend API endpoint for creating reports functional
- Image storage solution implemented (local storage or cloud)
- Form validation for all required fields

**Deliverables:**

- Fully functional report submission screen
- Image picker and camera integration
- Location services integration
- Report creation API tested and documented
- Database storing report and media data correctly

---

### Sprint 3: Report Tracking and Status Management (Week 5)

**Sprint Goal:** Allow citizens to view their reports and officers to update report statuses.

**Milestones:**

- "My Reports" list screen showing all user's submissions
- Report detail screen displaying full information and status
- Status update capability for officers in dashboard
- Backend API for fetching user reports
- Backend API for updating report status
- Status change history/timeline visible to users

**Deliverables:**

- Report list and detail screens for citizens
- Officer dashboard with report queue
- Status update functionality working
- API endpoints for report management tested

---

### Sprint 4: Push Notifications and Dashboard Enhancements (Week 6)

**Sprint Goal:** Implement real-time notifications and enhance officer dashboard features.

**Milestones:**

- Firebase Cloud Messaging integrated with mobile app
- Push notifications sent when report status changes
- Notification preferences screen for users
- In-app notification center showing notification history
- Officer dashboard enhanced with filtering and search
- Comment system for officers to add notes to reports

**Deliverables:**

- Working push notification system
- Notification preferences functionality
- Enhanced officer dashboard with search/filter
- Comment system for internal and public notes
- All core features functional and integrated

---

## 4. Architecture

### 4.1 System Architecture

iSPY follows a **three-tier client-server architecture** with clear separation of concerns:

**Presentation Tier (Mobile Client):**

- React Native mobile application running on iOS and Android devices
- Handles user interface, input validation, and user interactions
- Communicates with backend via RESTful API over HTTPS
- Manages local state and caching with AsyncStorage
- Integrates with device capabilities (camera, GPS, push notifications)

**Application Tier (Backend API Server):**

- Node.js + Express.js REST API server
- Processes business logic, authentication, and authorization
- Handles file uploads and media processing
- Manages database queries and transactions
- Integrates with Firebase Cloud Messaging for push notifications
- Enforces security policies and data validation

**Data Tier (Database):**

- PostgreSQL relational database
- Stores user accounts, incident reports, media metadata, and audit logs
- Implements data integrity constraints and triggers
- Handles full-text search and geospatial queries
- Maintains referential integrity between related entities

### 4.2 Architectural Patterns

**RESTful API Design:**

- Stateless communication between client and server
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JWT tokens for authentication and session management
- JSON for data exchange

**Model-View-Controller (MVC) Pattern:**

- Models: Database schemas and ORM/query logic
- Views: React Native components and screens
- Controllers: Express.js route handlers and middleware

**Role-Based Access Control (RBAC):**

- Users assigned roles (citizen, officer, admin)
- Middleware enforces authorization based on roles
- Different API endpoints and UI components per role

### 4.3 Data Flow Example (Report Submission)

1. User fills out report form in mobile app
2. App validates input locally before submission
3. App captures GPS coordinates or manual address
4. User selects photos from gallery or takes new photos
5. App sends HTTPS POST request to `/api/v1/reports` with report data
6. Backend authenticates user via JWT token
7. Backend validates and sanitizes input data
8. Backend uploads images to storage and saves metadata
9. Backend inserts report record into PostgreSQL database
10. Backend returns success response with report ID
11. App displays confirmation and navigates to "My Reports" screen
12. App optionally sends push notification to nearby officers (future enhancement)

---

## 5. Technology

### 5.1 Frontend - Mobile Application

**Primary Technology:** **React Native (Expo Framework)**

**Why React Native?**

- Single codebase for both iOS and Android platforms
- JavaScript/TypeScript - consistent with backend
- Large community and extensive library ecosystem
- Hot reloading for faster development
- Expo managed workflow simplifies build and deployment

**Key Libraries:**

- **React Navigation 6.x:** Screen navigation and routing
- **Axios:** HTTP client for making API requests
- **React Native Maps:** Displaying maps and location markers
- **Expo Camera & Image Picker:** Capturing photos and selecting from gallery
- **AsyncStorage:** Local data persistence and caching
- **Firebase SDK:** Push notification client integration
- **React Hook Form:** Form state management and validation

### 5.2 Backend - API Server

**Primary Technology:** **Node.js (v18+) with Express.js Framework**

**Why Node.js + Express?**

- JavaScript across entire stack (frontend and backend)
- Non-blocking I/O ideal for handling multiple concurrent requests
- Extensive npm package ecosystem
- Lightweight and flexible Express framework
- Easy to scale horizontally

**Key Libraries:**

- **pg (node-postgres):** PostgreSQL database client
- **bcrypt:** Secure password hashing
- **jsonwebtoken:** JWT creation and verification
- **multer:** Multipart form data and file upload handling
- **helmet:** Security headers middleware
- **express-validator:** Request input validation
- **cors:** Cross-Origin Resource Sharing configuration
- **firebase-admin:** Server-side Firebase SDK for push notifications

### 5.3 Database

**Primary Technology:** **PostgreSQL (v14+)**

**Why PostgreSQL?**

- Robust, open-source relational database
- ACID compliance for data integrity
- Excellent support for complex queries and transactions
- Built-in geospatial capabilities (PostGIS extension potential)
- Strong community and extensive documentation
- Free and well-supported in cloud environments

**Schema Highlights:**

- Users table with role-based access
- Reports table with status tracking
- Media table for photos/videos with foreign key relationships
- Notifications table for push notification history
- Audit logging with updated_at triggers

### 5.4 Supporting Technologies

**Push Notifications:** **Firebase Cloud Messaging (FCM)**

- Free, reliable push notification service
- Supports both iOS and Android
- Integrates with React Native via Firebase SDK

**Version Control:** **Git + GitHub**

- Source code management
- Pull request workflow for code review
- GitHub Projects for task tracking

**Development Tools:**

- **VS Code:** Primary IDE
- **Postman:** API testing
- **pgAdmin:** Database management
- **Expo Go:** Mobile app testing on physical devices

**Code Quality:**

- **ESLint:** JavaScript linting
- **Prettier:** Code formatting
- **Jest:** Unit testing framework

---

## 6. Additional Project Details

> **Note:** This section provides supplementary information beyond the core project plan requirements. It offers deeper context for development and project management.

### 6.1 Problem Statement

### Current Challenges

Communities and law enforcement agencies face several critical challenges in maintaining public safety:

1. **Delayed Incident Reporting**
   - Citizens lack quick, accessible channels to report suspicious activities
   - Traditional methods (phone calls) can be time-consuming and intimidating
   - No 24/7 easy-to-use reporting mechanism

2. **Communication Breakdown**
   - Limited feedback loop between residents and law enforcement
   - No visibility into report status after submission
   - Residents feel disconnected from the investigation process

3. **Evidence Collection Difficulties**
   - Hard to attach photos or videos to phone reports
   - Evidence may be lost or not properly documented
   - Time delays in evidence submission

4. **Resource Inefficiency**
   - Law enforcement struggles with report prioritization
   - Difficulty identifying crime patterns and hotspots
   - Manual processing of incident reports is time-consuming

5. **Community Awareness Gap**
   - Residents unaware of nearby incidents
   - No centralized platform for community safety information
   - Isolated incidents not recognized as patterns

### Impact

These challenges result in:

- Reduced public safety
- Lower community trust in law enforcement
- Delayed emergency responses
- Missed opportunities for crime prevention
- Inefficient use of law enforcement resources

---

### 6.2 Solution Overview

iSPY addresses these challenges through a comprehensive mobile-first platform that provides:

#### For Citizens

- **Quick Report Submission:** Submit detailed incident reports in under 2 minutes
- **Multimedia Support:** Attach photos and videos as evidence
- **Location Tagging:** Automatic GPS-based location capture
- **Status Tracking:** Real-time updates on report status
- **Push Notifications:** Receive alerts about nearby incidents
- **Anonymous Reporting Option:** Report sensitively without revealing identity (future feature)

#### For Law Enforcement

- **Centralized Dashboard:** View and manage all reports in one place
- **Priority Queuing:** Automatically prioritize reports based on severity
- **Evidence Access:** Direct access to photos, videos, and location data
- **Response Tools:** Update report status and communicate with citizens
- **Analytics:** Identify crime patterns and hotspots
- **Resource Allocation:** Better distribute personnel based on incident data

---

### 6.3 Project Goals and Objectives

#### Primary Goals

1. **Improve Reporting Efficiency**
   - Reduce average report submission time to under 2 minutes
   - Enable 24/7 reporting capability
   - Support multimedia evidence submission

2. **Enhance Communication**
   - Provide real-time status updates to citizens
   - Enable two-way communication between residents and officers
   - Increase transparency in the investigation process

3. **Increase Community Safety**
   - Faster incident response times
   - Better crime pattern identification
   - Improved community awareness

4. **Optimize Law Enforcement Resources**
   - Streamline report management
   - Enable data-driven decision making
   - Reduce administrative burden

#### Success Metrics

- **User Adoption:** 500+ registered users within 6 months of launch
- **Report Volume:** 100+ incident reports per month
- **Response Time:** Average law enforcement response time reduced by 30%
- **User Satisfaction:** 4+ star average rating on app stores
- **Report Completion:** 80%+ of reports reach resolution status

---

### 6.4 Detailed Feature Breakdown

#### Phase 1: Core Features (MVP - Semester 1)

#### 5.1 User Authentication & Management

- **Priority:** High
- **Description:** Secure user registration and login system
- **Requirements:**
  - Email and password registration
  - JWT-based authentication
  - Role-based access control (Citizen, Officer, Admin)
  - Email verification
  - Password reset functionality
  - Profile management

#### 5.2 Incident Reporting

- **Priority:** High
- **Description:** Core functionality for submitting incident reports
- **Requirements:**
  - Report form with title, description, and category
  - Photo upload (up to 5 photos per report)
  - Video upload (up to 2 minutes, 50MB max)
  - GPS-based location tagging
  - Manual address entry option
  - Incident date and time selection
  - Report preview before submission

#### 5.3 Report Status Tracking

- **Priority:** High
- **Description:** Allow users to track their submitted reports
- **Requirements:**
  - Report list view (My Reports)
  - Individual report detail view
  - Status indicators (Submitted, Under Review, Investigating, Resolved, Closed)
  - Timeline of status changes
  - Report update notifications

#### 5.4 Push Notifications

- **Priority:** Medium
- **Description:** Real-time notifications for report updates
- **Requirements:**
  - Firebase Cloud Messaging integration
  - Notification for report status changes
  - Notification preferences in settings
  - In-app notification center
  - Badge counts for unread notifications

#### 5.5 Law Enforcement Dashboard

- **Priority:** High
- **Description:** Web/mobile portal for officers to manage reports
- **Requirements:**
  - Report queue with filtering and sorting
  - Report detail view with all evidence
  - Status update capability
  - Add internal and public comments
  - Priority assignment
  - Export report data

#### Phase 2: Enhanced Features (Semester 2)

##### 6.4.6 Interactive Map

- **Priority:** Medium
- **Description:** Visual map of reported incidents
- **Requirements:**
  - Map view with incident markers
  - Filter by date range and incident type
  - Cluster nearby incidents
  - Heatmap for crime hotspots
  - User location display

#### 5.7 Community Features

- **Priority:** Low
- **Description:** Foster community engagement
- **Requirements:**
  - Community discussion boards
  - Neighborhood groups
  - Safety tips and resources
  - Community safety score

#### 5.8 Advanced Analytics

- **Priority:** Medium
- **Description:** Data analysis and reporting tools
- **Requirements:**
  - Crime trend analysis
  - Pattern recognition
  - Predictive analytics
  - Custom report generation
  - Data export capabilities

#### 5.9 Multi-language Support

- **Priority:** Low
- **Description:** Support for multiple languages
- **Requirements:**
  - English, Spanish language support
  - Easy addition of new languages
  - User language selection

#### Phase 3: Advanced Features (Future)

- Anonymous reporting
- Integration with CAD (Computer-Aided Dispatch) systems
- Live chat with dispatch
- Public safety alerts broadcast
- Rewards program for community engagement

---

### 6.5 Technology Stack (Expanded)

#### Frontend - Mobile Application

**Framework:** React Native (Expo)

- **Justification:**
  - Single codebase for iOS and Android
  - Large community and ecosystem
  - Fast development and hot reloading
  - Native performance

**Key Libraries:**

- **React Navigation:** Screen navigation and routing
- **Axios:** HTTP client for API calls
- **React Native Maps:** Map and location features
- **Expo Camera/Image Picker:** Media capture
- **AsyncStorage:** Local data persistence
- **Firebase SDK:** Push notifications

### Backend - API Server

**Runtime:** Node.js (v18+)

- **Justification:**
  - JavaScript throughout the stack
  - Non-blocking I/O for handling multiple requests
  - Large package ecosystem (npm)
  - Excellent for real-time applications

**Framework:** Express.js

- **Justification:**
  - Lightweight and flexible
  - Middleware architecture
  - Strong community support
  - Easy to scale

**Key Libraries:**

- **pg:** PostgreSQL client
- **bcrypt:** Password hashing
- **jsonwebtoken:** JWT authentication
- **multer:** File upload handling
- **helmet:** Security headers
- **express-validator:** Input validation
- **cors:** Cross-origin resource sharing
- **firebase-admin:** Server-side Firebase

### Database

**RDBMS:** PostgreSQL

- **Justification:**
  - Robust and reliable
  - ACID compliance for data integrity
  - Excellent for relational data (users, reports, relationships)
  - Built-in geospatial support (PostGIS)
  - Strong security features

**Schema Design:**

- Users table (citizen and officer accounts)
- Reports table (incident reports)
- Media table (photos and videos)
- Report_updates table (status changes and comments)
- Notifications table (push notification log)

### Infrastructure & Services

**Notification Service:** Firebase Cloud Messaging

- **Justification:**
  - Free push notifications
  - Works on both iOS and Android
  - Reliable delivery
  - Easy integration

**Geolocation:** Google Maps Platform / Mapbox

- **Justification:**
  - Accurate geocoding and reverse geocoding
  - Rich mapping features
  - Good documentation

**Version Control:** Git & GitHub

- **Justification:**
  - Industry standard
  - Excellent collaboration features
  - Integrated project management

**Hosting (Future):**

- **Backend:** AWS EC2 / Heroku / DigitalOcean
- **Database:** AWS RDS PostgreSQL
- **Media Storage:** AWS S3
- **CDN:** CloudFront

---

### 6.6 Project Architecture (Expanded)

#### System Architecture

```
┌─────────────────────────────────────────────────┐
│           Mobile Application (React Native)      │
│  ┌─────────────┐  ┌──────────────┐             │
│  │   Screens   │  │  Components  │             │
│  └──────┬──────┘  └──────┬───────┘             │
│         │                │                       │
│  ┌──────▼────────────────▼───────┐             │
│  │      Services & API Layer      │             │
│  └──────┬─────────────────────────┘             │
└─────────┼─────────────────────────────────────┘
          │ HTTPS/REST API
          ▼
┌─────────────────────────────────────────────────┐
│         Backend Server (Node.js/Express)        │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Routes  │─▶│Controllers │─▶│   Models   │ │
│  └──────────┘  └────────────┘  └─────┬──────┘ │
│  ┌──────────────────────────────────┐ │        │
│  │      Middleware Layer            │ │        │
│  │  (Auth, Validation, Error)       │ │        │
│  └──────────────────────────────────┘ │        │
└─────────────────────────────────────┬───────────┘
                                      │
          ┌───────────────────────────┼──────────────┐
          ▼                           ▼              ▼
┌──────────────────┐      ┌──────────────┐  ┌──────────────┐
│   PostgreSQL     │      │   Firebase   │  │  File        │
│   Database       │      │   (FCM)      │  │  Storage     │
└──────────────────┘      └──────────────┘  └──────────────┘
```

### Data Flow

#### Report Submission Flow

1. User fills out report form in mobile app
2. User attaches photos/videos and confirms location
3. App sends POST request to `/api/v1/reports`
4. Backend validates authentication and input
5. Server stores report data in PostgreSQL
6. Server uploads media files to storage
7. Server sends notification to relevant officers via FCM
8. Server returns report ID and confirmation to user
9. User sees success message and can track report

---

### 6.7 Development Methodology

#### Agile Scrum Approach

We will follow Agile Scrum methodology with the following structure:

#### Sprint Structure

- **Sprint Duration:** 2 weeks
- **Total Sprints:** 12 (for semester project)
- **Sprint Planning:** Beginning of each sprint
- **Daily Standups:** 3x per week (Mon, Wed, Fri)
- **Sprint Review:** End of each sprint
- **Sprint Retrospective:** End of each sprint

#### Roles

- **Product Owner:** Kendahl Chae Bingham
- **Scrum Master:** Rotating among team members
- **Development Team:** All team members

#### Ceremonies

1. **Sprint Planning (2 hours)**
   - Review product backlog
   - Select sprint backlog items
   - Define sprint goal
   - Estimate story points

2. **Daily Standup (15 minutes)**
   - What did I do yesterday?
   - What will I do today?
   - Any blockers?

3. **Sprint Review (1 hour)**
   - Demo completed features
   - Gather stakeholder feedback
   - Update product backlog

4. **Sprint Retrospective (1 hour)**
   - What went well?
   - What can be improved?
   - Action items for next sprint

### Tools

- **Project Management:** GitHub Projects (Kanban board)
- **Version Control:** Git & GitHub
- **Communication:** Discord/Slack + Email
- **Documentation:** GitHub Wiki + Markdown files
- **Code Review:** GitHub Pull Requests

---

### 6.8 Extended Project Timeline

#### Semester 1 (Weeks 1-16)

#### Weeks 1-2: Project Setup & Planning

- ✅ Team formation and role assignment
- ✅ Project repository setup
- ✅ Initial project plan and documentation
- ✅ Development environment setup
- Technology stack finalization

#### Weeks 3-4: Sprint 1 - Foundation

- Database schema design and implementation
- Backend API scaffolding
- User authentication endpoints
- Mobile app project initialization
- Basic navigation structure

#### Weeks 5-6: Sprint 2 - Authentication

- Complete user registration flow
- Login/logout functionality
- JWT token management
- Email verification
- Password reset feature

#### Weeks 7-8: Sprint 3 - Core Reporting

- Report submission form (frontend)
- Report creation API endpoint
- Image upload functionality
- Location capture and tagging
- Form validation

#### Weeks 9-10: Sprint 4 - Report Management

- My Reports screen
- Report detail view
- Status tracking functionality
- Report list API endpoints
- Status update capability (officers)

#### Weeks 11-12: Sprint 5 - Notifications

- Firebase Cloud Messaging setup
- Push notification system
- Notification preferences
- In-app notification center
- Email notifications

#### Weeks 13-14: Sprint 6 - Officer Dashboard

- Officer login flow
- Report queue view
- Report detail for officers
- Status update interface
- Comment system

#### Weeks 15-16: Testing & Refinement

- Comprehensive testing (unit, integration, E2E)
- Bug fixes
- Performance optimization
- Final documentation
- Presentation preparation

### Semester 2 (Weeks 17-32) - Subject to Change

#### Weeks 17-20: Enhanced Features

- Interactive map implementation
- Video upload support
- Advanced search and filters
- Report analytics dashboard

#### Weeks 21-24: Community Features

- Discussion boards
- Neighborhood groups
- Safety tips section
- Community engagement features

#### Weeks 25-28: Advanced Features

- Anonymous reporting
- Multi-language support
- Advanced analytics
- Integration capabilities

#### Weeks 29-32: Production Preparation

- Security audit
- Performance optimization
- Production deployment
- User acceptance testing
- Final presentation and handoff

---

### 6.9 Risk Management

#### Identified Risks

#### Technical Risks

| Risk                                            | Probability | Impact | Mitigation Strategy                                                         |
| ----------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------- |
| Integration challenges with Firebase            | Medium      | High   | Early integration testing, thorough documentation review                    |
| Database performance issues with large datasets | Low         | Medium | Implement proper indexing, query optimization from the start                |
| Mobile app platform-specific bugs               | Medium      | Medium | Regular testing on both iOS and Android, use Expo for consistency           |
| API security vulnerabilities                    | Medium      | High   | Follow OWASP guidelines, regular security audits, use established libraries |
| Media file storage and handling                 | Medium      | Medium | Implement file size limits, use CDN for delivery, compression               |

#### Project Management Risks

| Risk                               | Probability | Impact | Mitigation Strategy                                         |
| ---------------------------------- | ----------- | ------ | ----------------------------------------------------------- |
| Team member availability conflicts | High        | Medium | Clear communication, flexible scheduling, task distribution |
| Scope creep                        | Medium      | High   | Strict adherence to MVP features, change request process    |
| Missed deadlines                   | Medium      | High   | Buffer time in estimates, regular progress tracking         |
| Inadequate testing time            | Medium      | High   | Test-driven development, allocate dedicated testing sprints |

#### External Risks

| Risk                                         | Probability | Impact | Mitigation Strategy                                          |
| -------------------------------------------- | ----------- | ------ | ------------------------------------------------------------ |
| Third-party service outages (Firebase, Maps) | Low         | Medium | Implement error handling, consider backup solutions          |
| Changes in platform policies (iOS/Android)   | Low         | Medium | Stay updated with platform changes, flexible architecture    |
| Stakeholder requirement changes              | Medium      | Medium | Regular stakeholder communication, change management process |

### Contingency Plans

1. **Technical Blocker:** If a team member is blocked for >24 hours, escalate to entire team for pair programming session
2. **Falling Behind Schedule:** Re-prioritize features, move non-critical items to future sprints
3. **Team Member Unavailability:** Cross-train on all major features, maintain good documentation
4. **Third-Party Service Issues:** Have backup authentication and notification strategies

---

### 6.10 Testing Strategy

#### Testing Levels

#### Unit Testing

- **Tools:** Jest
- **Coverage Target:** 70%+
- **Scope:** Individual functions and components
- **Frequency:** Continuous (with every commit)

#### Integration Testing

- **Tools:** Jest + Supertest (backend), React Native Testing Library (frontend)
- **Scope:** API endpoints, component integration
- **Frequency:** Before each sprint review

#### End-to-End Testing

- **Tools:** Detox (React Native)
- **Scope:** Complete user workflows
- **Frequency:** Weekly and before releases

#### User Acceptance Testing (UAT)

- **Participants:** Course instructors, selected community members
- **Scope:** Complete application functionality
- **Frequency:** End of semester

### Test Cases (Sample)

1. **User Registration**
   - Valid registration succeeds
   - Duplicate email rejected
   - Weak password rejected
   - Email verification sent

2. **Report Submission**
   - Report with all fields succeeds
   - Report without required fields fails
   - Photos upload successfully
   - Location captures correctly

3. **Authentication**
   - Valid login succeeds
   - Invalid credentials rejected
   - JWT token expires correctly
   - Logout clears session

---

### 6.11 Success Criteria

#### Project Completion Criteria

The project will be considered successful when:

1. **Core Features Implemented (100%)**
   - User authentication (registration, login, logout)
   - Incident reporting with photos and location
   - Report status tracking
   - Push notifications
   - Law enforcement dashboard

2. **Technical Requirements Met**
   - Backend API functional with 95%+ uptime during testing
   - Mobile app runs on iOS and Android
   - Database properly normalized and indexed
   - Security best practices implemented
   - Code coverage >70%

3. **Quality Standards Achieved**
   - All critical bugs resolved
   - Performance: App loads in <3 seconds
   - Usability: Users can submit a report in <2 minutes
   - Accessibility: Basic accessibility guidelines met

4. **Documentation Complete**
   - README with setup instructions
   - API documentation
   - User guide
   - Code comments for complex logic
   - Database schema documentation

5. **Demonstration Ready**
   - End-to-end demo of all features
   - Sample data populated
   - Presentation materials prepared

### Stretch Goals

- Anonymous reporting functionality
- Interactive crime map
- Basic analytics dashboard
- Community discussion boards
- Multi-language support (Spanish)

---

### 6.12 Team Roles and Responsibilities

#### Kendahl Chae Bingham - Project Lead & Full-Stack Developer

**Responsibilities:**

- Overall project coordination and leadership
- Product ownership and vision
- Stakeholder communication
- Full-stack development (frontend & backend)
- Code review and quality assurance
- Documentation and presentations
- Repository management

**Primary Focus Areas:**

- User authentication system
- Report management features
- Project architecture decisions

### Samuel Iyen Evbosaru - Backend Developer

**Responsibilities:**

- Backend API development
- Database design and implementation
- Server-side logic
- API documentation
- Security implementation
- Integration with third-party services (Firebase)
- Backend testing

**Primary Focus Areas:**

- RESTful API endpoints
- Database schema and queries
- Authentication and authorization
- File upload handling

### Brenden Taylor Lyon - Frontend Developer

**Responsibilities:**

- Mobile app development (React Native)
- UI/UX implementation
- Frontend state management
- API integration
- Mobile-specific features (camera, location)
- Frontend testing
- User experience optimization

**Primary Focus Areas:**

- Screen development and navigation
- Form components and validation
- Map integration
- Media capture and upload

### Shared Responsibilities

- Sprint planning and estimation
- Daily standups
- Code reviews
- Testing
- Documentation
- Bug fixes
- Sprint retrospectives

---

### 6.13 Communication Plan

#### Internal Team Communication

**Daily Communication:**

- **Platform:** Discord/Slack
- **Purpose:** Quick updates, questions, blockers
- **Response Time:** Within 4 hours during business hours

**Standup Meetings:**

- **Frequency:** 3x per week (Monday, Wednesday, Friday)
- **Duration:** 15 minutes
- **Platform:** Zoom/Teams
- **Format:** What did you do? What will you do? Any blockers?

**Sprint Meetings:**

- **Sprint Planning:** Every 2 weeks, 2 hours
- **Sprint Review:** End of sprint, 1 hour
- **Retrospective:** End of sprint, 1 hour

### External Communication

**Instructor Updates:**

- **Frequency:** Weekly
- **Method:** Email summary + Canvas updates
- **Content:** Progress report, challenges, next steps

**Documentation:**

- **Platform:** GitHub Wiki + README files
- **Updates:** Continuous
- **Responsibility:** All team members

---

### 6.14 Budget and Resources

#### Development Resources (Free/Educational Tier)

| Resource        | Cost      | Purpose                                |
| --------------- | --------- | -------------------------------------- |
| GitHub          | Free      | Version control and project management |
| Firebase        | Free tier | Push notifications                     |
| PostgreSQL      | Free      | Database (local/cloud free tier)       |
| Google Maps API | Free tier | Geolocation services                   |
| VS Code         | Free      | Development IDE                        |
| Expo            | Free tier | React Native development               |
| Discord/Slack   | Free      | Team communication                     |

**Total Estimated Cost:** $0 (using free tiers and educational resources)

### Hardware Requirements

- Personal laptops (already owned by team members)
- iOS and Android devices for testing (team members' personal devices)

### Time Investment

- **Per team member:** 15-20 hours per week
- **Total team hours:** 45-60 hours per week
- **Semester 1 total:** ~720-960 hours

---

### 6.15 Future Roadmap

#### Post-Semester Plans

##### Phase 1: Production Readiness (Months 1-2)

- Complete security audit
- Set up production infrastructure
- Conduct load testing
- Implement monitoring and logging
- Beta testing with select community

#### Phase 2: Launch (Month 3)

- Official app store releases
- Marketing and community outreach
- Partnership with local police department
- User onboarding and training

#### Phase 3: Growth (Months 4-12)

- Add requested features based on feedback
- Expand to multiple neighborhoods/cities
- Implement advanced analytics
- Consider monetization strategy (if applicable)

### Potential Monetization (If Needed)

- Freemium model for advanced features
- Partnerships with law enforcement agencies
- Grant funding for community safety initiatives
- Subscription for analytics dashboard

---

### 6.16 Appendices

#### Appendix A: User Stories

#### Citizen User Stories

1. As a citizen, I want to quickly report suspicious activity so that law enforcement can respond promptly.
2. As a citizen, I want to attach photos to my report so that I can provide visual evidence.
3. As a citizen, I want to track the status of my report so that I know it's being addressed.
4. As a citizen, I want to receive notifications about nearby incidents so that I can stay informed about my neighborhood safety.
5. As a citizen, I want my personal information to be secure so that I feel safe using the app.

#### Officer User Stories

1. As an officer, I want to see all submitted reports in one place so that I can manage them efficiently.
2. As an officer, I want to update report statuses so that citizens know the progress of their reports.
3. As an officer, I want to view attached photos and location data so that I have all the information needed to respond.
4. As an officer, I want to prioritize reports based on severity so that urgent matters are addressed first.
5. As an officer, I want to see analytics on crime patterns so that I can allocate resources effectively.

### Appendix B: Wireframes and Mockups

(To be added in future sprints)

### Appendix C: Database Schema Diagram

(See backend/src/database/schema.sql for detailed schema)

### Appendix D: API Endpoints

(To be documented as development progresses)

### Appendix E: References

- BYU-Idaho CSE 499 Course Materials
- React Native Documentation: https://reactnative.dev/
- Express.js Documentation: https://expressjs.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Firebase Documentation: https://firebase.google.com/docs

---

## Document History

| Version | Date       | Author               | Changes                      |
| ------- | ---------- | -------------------- | ---------------------------- |
| 1.0     | 2026-03-09 | Kendahl Chae Bingham | Initial project plan created |

---

## Approval

This project plan has been reviewed and approved by:

**Team Members:**

- Kendahl Chae Bingham - Project Lead
- Samuel Iyen Evbosaru - Backend Developer
- Brenden Taylor Lyon - Frontend Developer

**Course Instructor:** (Pending Review)

**Date:** March 9, 2026

---

_This document is a living document and will be updated as the project progresses. All major changes will be tracked in the Document History section._
