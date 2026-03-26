# VIGILUX Development Guide

## Quick Start for Developers

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (v14+)
- Expo CLI (`npm install -g expo-cli`)
- Git
- iOS Simulator (Mac) or Android Studio (for Android emulation)

### First Time Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/kendychae/VIGILUX.git
   cd VIGILUX
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup Database**

   ```bash
   # Create database
   createdb vigilux_db

   # Run schema
   psql -d vigilux_db -f src/database/schema.sql
   ```

4. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development**

   Terminal 1 - Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 - Frontend:

   ```bash
   cd frontend
   npm start
   ```

### Development Workflow

1. **Start your day**

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create PR on GitHub
   ```

### Useful Commands

**Backend:**

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run migrate    # Run database migrations
```

**Frontend:**

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm test           # Run tests
npm run lint       # Run linter
```

### Testing

**Run all tests:**

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

**Run specific test:**

```bash
npm test -- auth.test.js
```

### Common Issues

**Issue: Port already in use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

**Issue: Database connection error**

- Check PostgreSQL is running
- Verify .env credentials
- Ensure database exists

**Issue: Expo app not loading**

- Clear cache: `expo start -c`
- Restart app
- Check network connection

### Project Structure Reference

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers (TBD)
│   ├── database/      # Database schema and migrations
│   ├── middleware/    # Express middleware
│   ├── models/        # Data models (TBD)
│   ├── routes/        # API routes
│   ├── services/      # Business logic (TBD)
│   └── server.js      # Server entry point

frontend/
├── src/
│   ├── components/    # Reusable components (TBD)
│   ├── navigation/    # Navigation config (TBD)
│   ├── screens/       # Screen components
│   ├── services/      # API services
│   ├── utils/         # Utility functions (TBD)
│   └── App.js         # Root component
```

### API Endpoints (Current)

```
GET  /health                    # Health check
GET  /api/v1                    # API info

# To be implemented:
POST /api/v1/auth/register      # User registration
POST /api/v1/auth/login         # User login
POST /api/v1/auth/logout        # User logout
GET  /api/v1/reports            # Get reports
POST /api/v1/reports            # Create report
GET  /api/v1/reports/:id        # Get specific report
PUT  /api/v1/reports/:id        # Update report
```

### Code Style

- Use ES6+ features
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Comment complex logic
- Write tests for new features

### Getting Help

1. Check documentation in `/docs`
2. Search existing issues on GitHub
3. Ask in team Discord/Slack
4. Create new issue if needed

### Before Creating PR

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Commits follow convention
- [ ] Branch is up-to-date with develop

### Resources

- [Project Plan](docs/canvas-submissions/project-plan.md)
- [Git Setup Guide](docs/canvas-submissions/git-setup.md)
- [Contributing Guide](CONTRIBUTING.md)
- [React Native Docs](https://reactnative.dev/)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

Happy coding! 🚀
