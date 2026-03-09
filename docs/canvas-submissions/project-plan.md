# iSPY Project Plan

**CSE 499 - Week 2 Activity Submission**

---

## Project Information

**Project Name:** iSPY - Neighborhood Watch Mobile Application

**Team Members:**

- Kendahl Cha Bingham (Project Lead)
- Samuel Iyen Evbosaru (Backend Developer)
- Brenden Taylor Lyon (Frontend Developer)

**Repository:** https://github.com/kendychae/i-SPY

**Project Board:** https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning

**Date:** March 9, 2026

---

## 1. Executive Summary

iSPY is a mobile application designed to empower communities by providing a secure, efficient platform for reporting and tracking illegal activities. The application bridges the communication gap between residents and local law enforcement, improving public safety through real-time incident reporting, multimedia evidence submission, and transparent status tracking.

---

## 2. Problem Statement

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

## 3. Solution Overview

iSPY addresses these challenges through a comprehensive mobile-first platform that provides:

### For Citizens

- **Quick Report Submission:** Submit detailed incident reports in under 2 minutes
- **Multimedia Support:** Attach photos and videos as evidence
- **Location Tagging:** Automatic GPS-based location capture
- **Status Tracking:** Real-time updates on report status
- **Push Notifications:** Receive alerts about nearby incidents
- **Anonymous Reporting Option:** Report sensitively without revealing identity (future feature)

### For Law Enforcement

- **Centralized Dashboard:** View and manage all reports in one place
- **Priority Queuing:** Automatically prioritize reports based on severity
- **Evidence Access:** Direct access to photos, videos, and location data
- **Response Tools:** Update report status and communicate with citizens
- **Analytics:** Identify crime patterns and hotspots
- **Resource Allocation:** Better distribute personnel based on incident data

---

## 4. Project Goals and Objectives

### Primary Goals

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

### Success Metrics

- **User Adoption:** 500+ registered users within 6 months of launch
- **Report Volume:** 100+ incident reports per month
- **Response Time:** Average law enforcement response time reduced by 30%
- **User Satisfaction:** 4+ star average rating on app stores
- **Report Completion:** 80%+ of reports reach resolution status

---

## 5. Features and Requirements

### Phase 1: Core Features (MVP - Semester 1)

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

### Phase 2: Enhanced Features (Semester 2)

#### 5.6 Interactive Map

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

### Phase 3: Advanced Features (Future)

- Anonymous reporting
- Integration with CAD (Computer-Aided Dispatch) systems
- Live chat with dispatch
- Public safety alerts broadcast
- Rewards program for community engagement

---

## 6. Technology Stack

### Frontend - Mobile Application

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

## 7. Project Architecture

### System Architecture

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

## 8. Development Methodology

### Agile Scrum Approach

We will follow Agile Scrum methodology with the following structure:

#### Sprint Structure

- **Sprint Duration:** 2 weeks
- **Total Sprints:** 12 (for semester project)
- **Sprint Planning:** Beginning of each sprint
- **Daily Standups:** 3x per week (Mon, Wed, Fri)
- **Sprint Review:** End of each sprint
- **Sprint Retrospective:** End of each sprint

#### Roles

- **Product Owner:** Kendahl Cha Bingham
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

## 9. Project Timeline

### Semester 1 (Weeks 1-16)

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

## 10. Risk Management

### Identified Risks

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

## 11. Testing Strategy

### Testing Levels

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

## 12. Success Criteria

### Project Completion Criteria

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

## 13. Team Roles and Responsibilities

### Kendahl Cha Bingham - Project Lead & Full-Stack Developer

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

## 14. Communication Plan

### Internal Team Communication

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

## 15. Budget and Resources

### Development Resources (Free/Educational Tier)

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

## 16. Future Roadmap

### Post-Semester Plans

#### Phase 1: Production Readiness (Months 1-2)

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

## 17. Appendices

### Appendix A: User Stories

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

| Version | Date       | Author              | Changes                      |
| ------- | ---------- | ------------------- | ---------------------------- |
| 1.0     | 2026-03-09 | Kendahl Cha Bingham | Initial project plan created |

---

## Approval

This project plan has been reviewed and approved by:

**Team Members:**

- Kendahl Cha Bingham - Project Lead
- Samuel Iyen Evbosaru - Backend Developer
- Brenden Taylor Lyon - Frontend Developer

**Course Instructor:** (Pending Review)

**Date:** March 9, 2026

---

_This document is a living document and will be updated as the project progresses. All major changes will be tracked in the Document History section._
