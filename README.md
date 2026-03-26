# VIGILUX 🔍

### Neighborhood Watch Mobile Application

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-In_Development-yellow.svg)

**Empowering communities to report and track illegal activity quickly and safely.**

⚠️ **PROPRIETARY SOFTWARE** - This software is NOT open source. All rights reserved. Commercial use requires a paid license. See [LICENSE](LICENSE) for details.

[Features](#features) • [Technology Stack](#technology-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Team](#team)

</div>

---

## 📖 About The Project

VIGILUX is a comprehensive neighborhood watch mobile application designed to bridge the communication gap between community residents and local law enforcement. Our mission is to improve public safety by providing a centralized, user-friendly platform where citizens can report incidents, attach multimedia evidence, and track the status of their reports in real-time.

### Problem Statement

Many communities struggle with:

- **Delayed reporting** of illegal activities due to lack of accessible channels
- **Poor communication** between residents and law enforcement
- **No visibility** into report status after submission
- **Limited community awareness** of local safety concerns
- **Inefficient response coordination** by law enforcement agencies

VIGILUX addresses these challenges by creating a seamless, secure, and efficient reporting ecosystem that promotes community safety and engagement.

---

## ✨ Features

### Core Features

- **🔐 Secure User Authentication**
  - Email/password registration and login
  - Role-based access control (Citizen, Officer, Admin)
  - Account verification and security measures

- **📝 Incident Reporting**
  - Detailed incident descriptions
  - Photo and video attachment support
  - GPS-based location tagging
  - Categorization by incident type
  - Time and date logging

- **📊 Status Tracking**
  - Real-time report status updates
  - Submission to resolution lifecycle tracking
  - Update history and timeline view

- **🔔 Notifications & Alerts**
  - Push notifications for report updates
  - Nearby incident alerts
  - Community safety announcements
  - Customizable notification preferences

- **👮 Law Enforcement Dashboard**
  - Centralized report management portal
  - Priority-based report queuing
  - Response and investigation tools
  - Analytics and reporting features

### Optional Features (Future Releases)

- Community discussion boards
- Crime hotspot mapping
- Predictive analytics for crime patterns
- Multi-language support
- Integration with existing law enforcement systems

---

## 🛠 Technology Stack

### Frontend

- **Framework:** React Native (Expo)
- **Language:** JavaScript (ES6+)
- **Navigation:** React Navigation
- **State Management:** Context API / Redux (TBD)
- **Maps:** React Native Maps
- **Media:** Expo Camera & Image Picker

### Backend

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** JavaScript (ES6+)
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer

### Database

- **RDBMS:** PostgreSQL
- **ORM:** Native SQL queries (pg library)
- **Schema:** Relational database with normalized tables

### Infrastructure & DevOps

- **Notifications:** Firebase Cloud Messaging (FCM)
- **Geolocation:** Google Maps API / Mapbox
- **Version Control:** Git & GitHub
- **Project Management:** GitHub Projects (Agile/Scrum)
- **CI/CD:** GitHub Actions (planned)

---

## 🚀 Getting Started

### Quick Options

You have **two ways** to run VIGILUX:

#### **Option 1: Quick Demo (Fastest - Web Only)**

Test the authentication system instantly with the demo page:

1. Start backend: `cd backend && npm run dev`
2. Open `demo.html` in your browser
3. Login with: `admin@vigilux.app` / `Admin@123`

#### **Option 2: Full React Native App (Web + Mobile)**

Run the complete mobile-ready app:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npx expo start --web`
3. Open browser to `http://localhost:8081` OR scan QR code with Expo Go

---

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git**
- **Expo Go app** (optional, for mobile testing) - [iOS](https://apps.apple.com/app/apple-store/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kendychae/VIGILUX.git
   cd VIGILUX
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install

   # Copy environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Create database and run migrations
   createdb vigilux_db
   npm run migrate
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install

   # Copy environment variables
   cp .env.example .env
   # Default settings work for local development
   ```

4. **Start Development Servers**

   Backend:

   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:3000
   ```

   Frontend (React Native - Expo SDK 52):

   ```bash
   cd frontend
   npx expo start --web
   # Opens at http://localhost:8081
   # Or scan QR code with Expo Go app for mobile testing
   # Press 'w' for web, 'a' for Android, 'i' for iOS
   ```

   **Alternative - Quick Demo:**

   ```bash
   # Just open demo.html in your browser after starting backend
   open demo.html  # macOS
   start demo.html # Windows
   ```

5. **Test the App**

   Default login credentials:
   - Email: `admin@vigilux.app`
   - Password: `Admin@123`

   **Available Screens:**
   - 🔐 Login & Registration
   - 🏠 Home Dashboard
   - 🗺️ Interactive Map
   - 📝 Report Incidents
   - 👤 User Profile

### Environment Configuration

#### Backend `.env`

```env
NODE_ENV=development
PORT=3000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vigilux_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secrets (Change in production!)
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Frontend `.env`

```env
# API URL - use your computer IP for physical devices
REACT_APP_API_URL=http://localhost:3000/api/v1
# Example for physical device: http://192.168.1.100:3000/api/v1
```

**📖 See [QUICK-START.md](docs/canvas-submissions/QUICK-START.md) for detailed setup instructions.**

---

## 📁 Project Structure

```
VIGILUX/
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers (auth, reports, users)
│   │   ├── database/       # Schema and migrations
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express app entry point
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # React Native (Expo) app
│   ├── src/
│   │   ├── screens/       # App screens (Login, Home, Map, etc.)
│   │   ├── services/      # API client & auth service
│   │   ├── utils/         # Secure storage utilities
│   │   └── App.js         # Navigation & root component
│   ├── .env.example       # Environment template
│   └── package.json
│
├── docs/                  # Documentation
│   ├── AUTH-FLOW.md       # Authentication architecture
│   ├── NAVIGATION-FLOW.md # App navigation structure
│   └── canvas-submissions/
│       ├── week3-implementation-summary.md
│       └── QUICK-START.md
│
├── LICENSE
└── README.md
```

---

## 📚 Documentation

Additional documentation can be found in the `/docs` directory:

### Week 3 Submissions ✅

- [Week 3 Implementation Summary](docs/canvas-submissions/week3-implementation-summary.md)
- [Quick Start Guide](docs/canvas-submissions/QUICK-START.md)
- [Authentication Flow](docs/AUTH-FLOW.md)
- [Navigation Flow](docs/NAVIGATION-FLOW.md)

### Project Documentation

- [Project Plan](docs/canvas-submissions/project-plan.md)
- [Git Setup Guide](docs/canvas-submissions/git-setup.md)
- [Sprint Records](docs/canvas-submissions/)
- [Development Guide](docs/DEVELOPMENT.md)

### Technical Documentation

- Database Schema: `backend/src/database/schema.sql`
- API Routes: `backend/src/routes/`
- Screen Components: `frontend/src/screens/`

---

## ✅ Week 3 Accomplishments

All Week 3 tasks have been successfully completed:

### Backend

- ✅ Complete JWT authentication system with refresh tokens
- ✅ User registration and login endpoints
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Protected route middleware
- ✅ Request validation middleware
- ✅ Database migration scripts
- ✅ Environment configuration templates

### Frontend

- ✅ Secure token storage using Expo SecureStore
- ✅ Auto token refresh mechanism
- ✅ Complete navigation system (Stack + Tab navigation)
- ✅ Protected route guards
- ✅ Navigation animations and transitions
- ✅ Professional UI for all screens:
  - Login Screen
  - Register Screen
  - Forgot Password Screen
  - Home Screen
  - Map Screen with location
  - Report Screen with form
  - Profile Screen with logout

### Security Features

- ✅ Keychain storage (iOS) / EncryptedSharedPreferences (Android)
- ✅ Automatic token rotation
- ✅ Secure password requirements
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)

**Default Login**: admin@vigilux.app / Admin@123

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 📈 Development Methodology

This project follows **Agile (Scrum)** methodology with:

- 2-week sprints
- Daily stand-ups
- Sprint planning and retrospectives
- Regular stakeholder feedback
- Continuous integration and delivery

Track our progress on [GitHub Projects](https://github.com/users/kendychae/projects/3/views/1?system_template=team_planning)

---

## 👥 Team

**Development Team:**

| Name                     | Role                                | GitHub                                                   |
| ------------------------ | ----------------------------------- | -------------------------------------------------------- |
| **Kendahl Chae Bingham** | Project Lead & Full-Stack Developer | [@kendychae](https://github.com/kendychae)               |
| **Samuel Iyen Evbosaru** | Backend Developer                   | [@terrywhyte001](https://github.com/terrywhyte001)       |
| **Brenden Taylor Lyon**  | Frontend Developer                  | [@richardlyonheart](https://github.com/richardlyonheart) |
| **Figuelia Ya'Sin**      | Full-Stack Developer                | [@figueliayasin](https://github.com/figueliayasin)       |

### 💭 Team Quotes

> _"The SILENCE of the good people is more DANGEROUS than the BRUTALITY of the bad people."_  
> **— Dr. Martin Luther King, Jr.** (Kendahl Chae Bingham)

> _"Technology is best when it brings people together."_  
> **— Matt Mullenweg** (Figuelia Ya'Sin)

> _"The wicked flee when no one pursueth, but the rightous are bold as a lion"_  
> **— Proverbs 28:1** (Brenden Lyon)
> _"Tomorrow is never promised. Live a life that will be remembered. Love and respect everyone, and always extend a helping hand to those in need."_  
> **— Samuel Evbosaru**

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

---

## 📄 License

**⚠️ PROPRIETARY LICENSE - All Rights Reserved**

This software is the proprietary intellectual property of the VIGILUX Development Team.

### ❌ **NOT Open Source**

This code is provided for **viewing and educational purposes only**. Any use, deployment, or commercialization requires explicit written permission and a commercial license agreement.

### 💰 **Commercial Licensing**

Interested in using VIGILUX for your:

- City or municipality?
- Police department?
- Community organization?
- Commercial deployment?

**Contact us for licensing:** [Open a GitHub Issue](https://github.com/kendychae/VIGILUX/issues) or email the project team.

### ✅ **What You CAN Do (Without Permission)**

- View the source code for educational purposes
- Study the architecture and implementation for learning
- Reference the approach in academic work (with proper citation)

### ❌ **What You CANNOT Do (Without a Paid License)**

- Deploy this software for any community, city, or organization
- Use this code in any commercial product or service
- Create derivative works for commercial purposes
- Redistribute or sublicense the software
- Remove or modify copyright notices

See the full [LICENSE](LICENSE) file for complete terms and conditions.

---

## 📞 Contact & Support

**Project Repository:** [https://github.com/kendychae/VIGILUX](https://github.com/kendychae/VIGILUX)

**Project Board:** [GitHub Projects](https://github.com/users/kendychae/projects/3/views/1)

For questions, issues, or suggestions, please open an issue on GitHub or contact the project team.

---

## 🙏 Acknowledgments

- BYU-Idaho CSE 499 Course
- Local law enforcement agencies for their input and support
- Community members who provided valuable feedback

---

<div align="center">

**Made with ❤️ by the VIGILUX Team**

_Safer communities through better communication_

</div>
