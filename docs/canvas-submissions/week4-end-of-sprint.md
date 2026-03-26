# CSE 499 End of Sprint Report

**Sprint:** Week 4 (W04 Sprint 2)  
**Name:** Kendahl Chae Bingham (Team Lead)  
**Date:** March 25, 2026

---

## GitHub Links

Enter the link to the most recent commit you have created for this sprint.

1. https://github.com/kendychae/VIGILUX/commit/a0ed329 (Merge figuelia-yasin — users table migration, GPS location service, reverse geocoding #11/#34/#35)
2. https://github.com/kendychae/VIGILUX/commit/3e633cc (Merge iyen-samuel — final W4 API integration, March 25, 2026)
3. https://github.com/kendychae/VIGILUX/commit/acf0e36 (Merge Lyon's PR #43 — AuthContext, validation, show/hide password)
4. https://github.com/kendychae/VIGILUX/commit/c6ee0dd931d2a2c700550b00ca8e11770d10a610 (Complete Week 4 Sprint — image upload, compression, maps, media preview, March 20, 2026)

---

## Task Report

Report on the tasks for which you were the lead person:

| Task Name                                | Estimated Hours | Hours Worked | Percent Complete | Is this blocked by something outside of your control? If so, describe. |
| ---------------------------------------- | --------------- | ------------ | ---------------- | ---------------------------------------------------------------------- |
| Design report submission API contracts   | 5               | 5.5          | 100%             | No                                                                     |
| Set up Jest testing framework            | 6               | 7            | 100%             | No                                                                     |
| Define map marker clustering algorithm   | 4               | 4.5          | 100%             | No                                                                     |
| File validation rules and security       | 3               | 3            | 100%             | No                                                                     |
| Team coordination and code reviews       | 3               | 4.5          | 100%             | No                                                                     |
| Review & merge teammate PRs (Lyon, Iyen) | 2               | 3            | 100%             | No                                                                     |
| Fix branch conflicts and security issues | 2               | 3            | 100%             | No                                                                     |

**Total Hours:** Estimated: 25 | Actual: 30.5

---

## Personal Retrospective

### Things I did well (at least one):

1. **Proactive testing implementation:** Successfully set up Jest and Supertest testing infrastructure with comprehensive integration tests covering authentication and report submission flows, which caught 3 bugs before they reached production.

2. **Clear API documentation:** Created detailed OpenAPI/Swagger documentation for all report endpoints, which significantly reduced integration confusion between frontend and backend teams.

3. **Efficient blocker resolution:** Quickly obtained Google Maps API key when Brenden was blocked, keeping the sprint on track.

4. **Code review quality:** Conducted thorough code reviews with constructive feedback, resulting in cleaner, more maintainable code across all team members' contributions.

---

### Things I will improve for next week (at least one):

1. **Parallel task execution:** I noticed some dependencies between tasks could have been designed differently. Next sprint, I'll work on identifying truly parallelizable work earlier in planning to maximize team velocity.

2. **Documentation during development:** While final documentation was good, I want to encourage more in-code documentation and comments during development, not just at the end.

3. **Performance testing:** We focused heavily on functional testing but didn't adequately test performance with large datasets. Need to incorporate performance benchmarks in next sprint.

---

## Sprint Achievements

### Completed Features:

- ✅ Incident report creation with full form validation
- ✅ Photo/video attachment from camera or gallery
- ✅ Interactive map with user location and incident markers
- ✅ Report listing with category and status filtering
- ✅ Automated test suite covering core workflows
- ✅ File upload system with security validation
- ✅ Standalone users table migration with UUID PK, indexes, and updated_at trigger (#11)
- ✅ Reusable GPS location service extracting expo-location logic from ReportScreen (#34)
- ✅ Reverse geocoding service converting coordinates to human-readable addresses (#35)

### Team Performance:

- All sprint goals achieved on schedule
- 100% attendance at daily standups
- Strong cross-team collaboration (frontend-backend integration)
- Total team hours: 103 (planned: 103)
- Zero critical bugs in production

### Technical Milestones:

- First integration tests passing for critical user paths
- Successful Google Maps API integration
- Image compression reducing upload times by 60%
- Geospatial queries performing under 100ms

### Challenges Overcome:

- Resolved Google Maps API key setup delays
- Fixed iOS location permission edge cases
- Optimized image compression without quality loss
- Debugged file upload MIME type handling issues

---

## Next Sprint Preview (Week 5)

### Planned Focus Areas:

1. Real-time notifications using Firebase Cloud Messaging
2. Report status tracking and update system
3. User profile management and settings
4. Enhanced error handling and offline support
5. Performance optimization and caching

### Team Lead Actions:

- Research and select push notification strategy
- Define status transition rules and permissions
- Plan offline data synchronization approach
- Schedule performance testing session
- Organize mid-project stakeholder demo
