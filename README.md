# iSPY 🔍

### Neighborhood Watch Mobile Application

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-In_Development-yellow.svg)

**Empowering communities to report and track illegal activity quickly and safely.**

[Features](#features) • [Technology Stack](#technology-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Team](#team)

</div>

---

## 📖 About The Project

iSPY is a comprehensive neighborhood watch mobile application designed to bridge the communication gap between community residents and local law enforcement. Our mission is to improve public safety by providing a centralized, user-friendly platform where citizens can report incidents, attach multimedia evidence, and track the status of their reports in real-time.

### Problem Statement

Many communities struggle with:

- **Delayed reporting** of illegal activities due to lack of accessible channels
- **Poor communication** between residents and law enforcement
- **No visibility** into report status after submission
- **Limited community awareness** of local safety concerns
- **Inefficient response coordination** by law enforcement agencies

iSPY addresses these challenges by creating a seamless, secure, and efficient reporting ecosystem that promotes community safety and engagement.

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

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Expo CLI** (`npm install -g expo-cli`)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kendychae/i-SPY.git
   cd i-SPY
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install

   # Copy environment variables
   cp .env.example .env

   # Edit .env with your configuration
   # Then create the database
   npm run migrate
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm start
   ```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ispy_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_here
FIREBASE_PROJECT_ID=your_firebase_project_id
```

---

## 📁 Project Structure

```
iSPY/
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── database/       # Database schema and migrations
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   └── server.js       # Entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # React Native mobile app
│   ├── src/
│   │   ├── screens/       # App screens/pages
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API and external services
│   │   ├── navigation/    # Navigation configuration
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Root component
│   └── package.json
│
├── docs/                   # Documentation and Canvas submissions
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📚 Documentation

Additional documentation can be found in the `/docs` directory:

- [Project Plan](docs/canvas-submissions/project-plan.md)
- [Git Setup Guide](docs/canvas-submissions/git-setup.md)
- [API Documentation](docs/api-documentation.md) (Coming Soon)
- [Database Schema](docs/database-schema.md) (Coming Soon)
- [User Guide](docs/user-guide.md) (Coming Soon)

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

**Project Repository:** [https://github.com/kendychae/i-SPY](https://github.com/kendychae/i-SPY)

**Project Board:** [GitHub Projects](https://github.com/users/kendychae/projects/3/views/1)

For questions, issues, or suggestions, please open an issue on GitHub or contact the project team.

---

## 🙏 Acknowledgments

- BYU-Idaho CSE 499 Course
- Local law enforcement agencies for their input and support
- Community members who provided valuable feedback

---

<div align="center">

**Made with ❤️ by the iSPY Team**

_Safer communities through better communication_

</div>
