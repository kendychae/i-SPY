# CSE 499 Project Submission Worksheet

---

## Overview

**Project Name:** VIGILUX — Neighborhood Watch Mobile Application

**Team Members:** Kendahl Chae Bingham, Samuel Iyen Evbosaru, Brenden Taylor Lyon, Figuelia Ya'Sin

---

## Code

**GitHub Repository URL:** https://github.com/kendychae/VIGILUX

---

## Video

**Video URL:** _(paste recording link here after filming)_

---

## Requirements

| Requirement | Core/Enhancement | Status |
|---|---|---|
| **1. User Authentication and Authorization** — Secure registration and login for citizens and law enforcement officers. JWT-based authentication, role-based access control (citizen vs. officer/admin), and secure password hashing via bcrypt. | Core | Complete |
| **2. Incident Report Submission** — Citizens submit incident reports with title, description, incident category, GPS location, and up to 5 photos. Form validation, image upload, and offline-first queuing with UUID idempotency and exponential backoff retry. | Core | Complete |
| **3. Report Status Tracking** — Citizens view all submitted reports, see full detail screens, and track status through the lifecycle: Submitted → Under Review → Investigating → Resolved → Closed. | Core | Complete |
| **4. Law Enforcement Dashboard** — Officers see all reports in a priority queue with All/Unassigned/Mine tabs. Officers can claim and unclaim reports, update status, and filter by category and status. | Core | Complete |
| **5. Push Notifications** — Firebase Cloud Messaging (FCM) integration sends push notifications to citizens when their report status changes. In-app notification center shows full notification history. | Core | Complete |
| **6. Advanced Search — Full-Text Search API** — PostgreSQL full-text search using tsvector/GIN index and plainto_tsquery with ts_rank relevance ordering. Reports endpoint supports ?q= keyword search returning results ranked by relevance. | Enhancement | Complete |
| **7. Advanced Search UI — Search Bar and Filter Chips** — Collapsible search bar on the Home screen with 300ms debounced queries. Horizontal filter chip row for incident category (9 types) and status (4 states). | Enhancement | Complete |
| **8. Offline-First Report Submission** — Reports queued in AsyncStorage when offline using react-native-uuid client IDs and ON CONFLICT DO NOTHING idempotency on the backend. Queue automatically processes on reconnect via NetInfo listener with 5-level exponential backoff. | Enhancement | Complete |
