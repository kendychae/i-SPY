# Week 2 Canvas Submission Summary

**VIGILUX - Neighborhood Watch Mobile Application**

---

## Student Information

**Student Name:** Kendahl Chae Bingham  
**Course:** CSE 499 - Software Engineering Capstone  
**Assignment:** Week 2 Activities - Git Setup & Project Plan  
**Date Submitted:** March 9, 2026

---

## Team Information

**Project Name:** VIGILUX - Neighborhood Watch Mobile Application

**Team Members:**

1. **Kendahl Chae Bingham** - Project Lead & Full-Stack Developer
   - GitHub: [@kendychae](https://github.com/kendychae)
   - Email: [Your Email]
2. **Samuel Iyen Evbosaru** - Backend Developer
   - GitHub: [@terrywhyte001](https://github.com/terrywhyte001)
   - Email: [His Email]
3. **Brenden Taylor Lyon** - Frontend Developer
   - GitHub: [@richardlyonheart](https://github.com/richardlyonheart)
   - Email: [His Email]

---

## Repository Information

**GitHub Repository:** https://github.com/kendychae/VIGILUX  
**Project Board:** https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning  
**Repository Status:** ✅ Active and Initialized

---

## Week 2 Activity Completion

### Activity 1: Git Setup ✅

**Reference:** https://byui-cse.github.io/cse499-ww-course/week02/activity-git-setup.html

**Completed Tasks:**

1. ✅ **Repository Created**
   - Repository Name: `VIGILUX`
   - Visibility: Public
   - Owner: kendychae
   - Initialized with README

2. ✅ **Repository Structure Established**
   - `/backend` - Node.js/Express backend
   - `/frontend` - React Native mobile app
   - `/docs` - Documentation and submissions
   - `.gitignore` configured for Node.js and React Native
   - `LICENSE` file (MIT License)

3. ✅ **Branching Strategy Defined**
   - Main branch: `main` (production-ready)
   - Development branch: `develop` (integration)
   - Feature branches: `feature/*`
   - Bugfix branches: `bugfix/*`
   - Hotfix branches: `hotfix/*`

4. ✅ **Commit Conventions Established**
   - Following Conventional Commits specification
   - Types: feat, fix, docs, style, refactor, test, chore
   - Format: `type(scope): description`

5. ✅ **Collaboration Setup**
   - Pull Request template created
   - Issue templates created (bug report, feature request)
   - Code review process documented
   - Merge strategies defined

6. ✅ **GitHub Project Board**
   - Board created using Team Planning template
   - Columns: Backlog, Ready, In Progress, In Review, Done
   - Issue labels configured
   - Workflow integration planned

7. ✅ **Documentation**
   - Comprehensive Git setup guide created
   - Common commands documented
   - Troubleshooting guide included
   - Best practices documented

**Deliverable:** [Git Setup Documentation](git-setup.md)

---

### Activity 2: Project Plan ✅

**Reference:** https://byui-cse.github.io/cse499-ww-course/week02/activity-project-plan.html

**Completed Sections:**

1. ✅ **Executive Summary**
   - Project overview and mission statement
   - Target audience and stakeholders

2. ✅ **Problem Statement**
   - Current challenges in community safety reporting
   - Communication gaps between residents and law enforcement
   - Impact on public safety

3. ✅ **Solution Overview**
   - Comprehensive mobile application
   - Features for citizens and law enforcement
   - Real-time communication and tracking

4. ✅ **Project Goals and Objectives**
   - Primary goals defined
   - Success metrics established
   - Measurable outcomes identified

5. ✅ **Features and Requirements**
   - Phase 1 (MVP): Core features detailed
   - Phase 2: Enhanced features outlined
   - Phase 3: Future roadmap planned
   - Each feature includes priority and requirements

6. ✅ **Technology Stack**
   - Frontend: React Native (Expo)
   - Backend: Node.js with Express
   - Database: PostgreSQL
   - Additional services: Firebase FCM, Google Maps
   - Development tools: Git, GitHub, Discord/Slack

7. ✅ **Project Architecture**
   - System architecture diagram
   - Data flow documentation
   - Component relationships

8. ✅ **Development Methodology**
   - Agile Scrum approach
   - 2-week sprints
   - Sprint ceremonies defined
   - Team roles assigned

9. ✅ **Project Timeline**
   - Semester 1 (16 weeks) detailed sprint plan
   - Semester 2 (16 weeks) high-level roadmap
   - Key milestones identified

10. ✅ **Risk Management**
    - Technical risks identified with mitigation strategies
    - Project management risks assessed
    - External risks considered
    - Contingency plans established

11. ✅ **Testing Strategy**
    - Unit, integration, and E2E testing planned
    - Tools identified (Jest, Supertest, Detox)
    - Coverage targets set (>70%)

12. ✅ **Success Criteria**
    - Project completion criteria defined
    - Quality standards established
    - Stretch goals identified

13. ✅ **Team Roles and Responsibilities**
    - Each member's role clearly defined
    - Primary focus areas assigned
    - Shared responsibilities outlined

14. ✅ **Communication Plan**
    - Daily communication protocol
    - Meeting schedule established
    - External communication strategy

15. ✅ **Budget and Resources**
    - Free tier services identified
    - Hardware requirements documented
    - Time investment estimated

16. ✅ **Future Roadmap**
    - Post-semester plans outlined
    - Growth strategy considered
    - Potential monetization explored

**Deliverable:** [Project Plan Documentation](project-plan.md)

---

## Additional Deliverables

### Professional Documentation

1. ✅ **README.md**
   - Comprehensive project overview
   - Professional badges and formatting
   - Installation instructions
   - Technology stack details
   - Team information
   - Contributing guidelines

2. ✅ **LICENSE**
   - MIT License with additional terms
   - Data privacy and security considerations
   - Liability disclaimer
   - Community guidelines

3. ✅ **CONTRIBUTING.md**
   - Contribution guidelines
   - Code of conduct reference
   - Style guidelines
   - Pull request process

4. ✅ **CHANGELOG.md**
   - Version tracking setup
   - Following Keep a Changelog format
   - Semantic versioning

### Project Structure

```
VIGILUX/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── database/
│   │   │   └── schema.sql
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── user.routes.js
│   │   └── server.js
│   ├── .env.example
│   ├── .eslintrc.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── ReportScreen.js
│   │   │   └── MapScreen.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   └── App.js
│   ├── .eslintrc.js
│   └── package.json
├── docs/
│   └── canvas-submissions/
│       ├── git-setup.md
│       ├── project-plan.md
│       └── week2-summary.md (this file)
├── .gitignore
├── .prettierrc
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Technical Implementation

### Backend Setup

**Framework:** Node.js with Express  
**Port:** 3000  
**Features Implemented:**

- Server initialization
- CORS and Helmet security middleware
- Health check endpoint
- API versioning (v1)
- Error handling middleware
- Database configuration
- Environment variables setup

### Frontend Setup

**Framework:** React Native with Expo  
**Features Implemented:**

- Basic app structure
- Navigation setup
- Placeholder screens (Login, Report, Map)
- API service configuration
- Authentication service scaffolding

### Database

**RDBMS:** PostgreSQL  
**Schema Includes:**

- Users table (with role-based access)
- Reports table (incident data)
- Media table (photos/videos)
- Report updates table (status tracking)
- Notifications table
- Proper indexing for performance
- Automatic timestamp updates

---

## GitHub Project Board Status

**Board URL:** https://github.com/users/kendychae/projects/3/views/1

**Current Status:**

- ✅ Board created with Team Planning template
- ✅ Columns configured (Backlog, Ready, In Progress, In Review, Done)
- ✅ Initial issues being created
- ✅ Labels configured
- ⏳ Team members to be added as collaborators

**Planned Issues (Examples):**

1. Setup backend development environment
2. Setup frontend development environment
3. Implement user registration API
4. Implement user login API
5. Create login screen UI
6. Create report submission form
7. Implement photo upload functionality
8. Setup PostgreSQL database
9. Configure Firebase Cloud Messaging
10. Write unit tests for authentication

---

## Next Steps (Week 3)

### Immediate Actions

1. **Team Collaboration**
   - Add Samuel and Brenden as collaborators
   - Share GitHub accounts
   - Schedule first team meeting
   - Setup team communication channel (Discord/Slack)

2. **Development Environment**
   - All team members clone repository
   - Install dependencies (Node.js, PostgreSQL, Expo CLI)
   - Configure environment variables
   - Test backend and frontend startup

3. **Sprint Planning**
   - Schedule Sprint 1 planning meeting
   - Create initial sprint backlog
   - Assign first tasks
   - Set sprint goal

4. **Technical Setup**
   - Setup PostgreSQL database
   - Run database migrations
   - Test API endpoints
   - Test mobile app on devices

### Week 3 Goals

- Complete development environment setup for all team members
- Conduct Sprint 1 planning
- Begin implementation of user authentication backend
- Start UI design for authentication screens
- Establish daily standup routine (Mon, Wed, Fri)

---

## Reflection

### What Went Well

1. **Planning:** Comprehensive project plan created with clear objectives
2. **Organization:** Well-structured repository with professional documentation
3. **Documentation:** Detailed guides for Git workflow and project setup
4. **Technology Selection:** Appropriate tech stack chosen for project requirements
5. **Risk Management:** Identified potential issues with mitigation strategies

### Challenges Faced

1. **Scope Management:** Had to carefully define MVP vs. future features
2. **Timeline Estimation:** Balancing ambition with realistic semester timeline
3. **Team Coordination:** Still in process of adding all team members

### Lessons Learned

1. **Early Planning:** Investing time in planning saves time later
2. **Documentation:** Clear documentation is essential for team collaboration
3. **Version Control:** Proper Git workflow prevents future conflicts
4. **Flexibility:** Need to remain adaptable as project progresses

---

## Compliance Checklist

### Week 2 Requirements

- [x] GitHub repository created and initialized
- [x] Repository includes README.md
- [x] Repository includes .gitignore
- [x] Repository includes LICENSE
- [x] Git branching strategy established
- [x] Commit conventions defined
- [x] Pull request process documented
- [x] GitHub Project Board created and configured
- [x] Project plan document completed
- [x] Problem statement articulated
- [x] Solution described
- [x] Features listed and prioritized
- [x] Technology stack identified
- [x] Development methodology chosen
- [x] Project timeline created
- [x] Team roles assigned
- [x] Risk management addressed
- [x] Documentation comprehensive and professional

### Bonus Elements

- [x] Professional README with badges
- [x] Contributing guidelines
- [x] Issue and PR templates
- [x] Code style configuration (.prettierrc, .eslintrc)
- [x] Changelog setup
- [x] Comprehensive database schema
- [x] Backend and frontend skeleton code
- [x] API scaffolding
- [x] Environment configuration examples

---

## Instructor Notes

### Key Highlights

1. **Professional Setup:** Repository is structured professionally with all necessary documentation and configuration files.

2. **Comprehensive Planning:** Project plan covers all aspects including technical architecture, risk management, timeline, and success criteria.

3. **Clear Git Workflow:** Detailed Git setup documentation with examples, troubleshooting, and best practices.

4. **Realistic Scope:** MVP features are achievable within semester while maintaining room for enhancements.

5. **Team Structure:** Roles and responsibilities clearly defined with appropriate skill distribution.

### Questions for Review

1. Is the project scope appropriate for a semester-long capstone?
2. Are there any concerns with the chosen technology stack?
3. Should any additional documentation be provided?
4. Are there specific areas the team should focus on in upcoming weeks?

---

## Contact Information

**Project Lead:** Kendahl Chae Bingham  
**Email:** [Your Email]  
**GitHub:** [@kendychae](https://github.com/kendychae)  
**Repository:** https://github.com/kendychae/VIGILUX

---

## Appendices

### Appendix A: File Inventory

All required and bonus files created for Week 2:

**Root Level:**

- README.md
- LICENSE
- CONTRIBUTING.md
- CHANGELOG.md
- .gitignore
- .prettierrc

**Backend:**

- package.json
- .env.example
- .eslintrc.js
- src/server.js
- src/config/database.js
- src/database/schema.sql
- src/routes/ (placeholder files)
- src/middleware/ (placeholder files)

**Frontend:**

- package.json
- .eslintrc.js
- src/App.js
- src/screens/ (placeholder screens)
- src/services/ (API configuration)

**GitHub Templates:**

- .github/pull_request_template.md
- .github/ISSUE_TEMPLATE/bug_report.md
- .github/ISSUE_TEMPLATE/feature_request.md

**Documentation:**

- docs/canvas-submissions/project-plan.md
- docs/canvas-submissions/git-setup.md
- docs/canvas-submissions/week2-summary.md

### Appendix B: References

1. BYU-Idaho CSE 499 Course Materials
   - https://byui-cse.github.io/cse499-ww-course/week02/activity-git-setup.html
   - https://byui-cse.github.io/cse499-ww-course/week02/activity-project-plan.html

2. Technical Documentation
   - React Native: https://reactnative.dev/
   - Node.js: https://nodejs.org/
   - Express.js: https://expressjs.com/
   - PostgreSQL: https://www.postgresql.org/

3. Best Practices
   - Conventional Commits: https://www.conventionalcommits.org/
   - Keep a Changelog: https://keepachangelog.com/
   - Semantic Versioning: https://semver.org/

---

**Submission Date:** March 9, 2026  
**Status:** ✅ Complete and Ready for Review

---

_This document summarizes all Week 2 activities and deliverables for the VIGILUX project. All referenced files are included in the repository and ready for instructor review._
