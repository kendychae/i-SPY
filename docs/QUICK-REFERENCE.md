# VIGILUX - Quick Reference

## 🚀 Quick Setup

```bash
# Clone
git clone https://github.com/kendychae/VIGILUX.git
cd VIGILUX

# Backend
cd backend && npm install
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend && npm install

# Run Backend (Terminal 1)
cd backend && npm run dev

# Run Frontend (Terminal 2)
cd frontend && npm start
```

## 📞 Team Contacts

- **Kendahl Cha Bingham** - Project Lead - [@kendychae](https://github.com/kendychae)
- **Samuel Iyen Evbosaru** - Backend Developer
- **Brenden Taylor Lyon** - Frontend Developer

## 🔗 Important Links

- **Repository:** https://github.com/kendychae/VIGILUX
- **Project Board:** https://github.com/users/kendychae/projects/3
- **Course Materials:** https://byui-cse.github.io/cse499-ww-course/

## 📝 Common Git Commands

```bash
# Start work
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# Commit work
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature

# Update your branch
git fetch origin
git merge origin/develop
```

## 🎯 Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

## 🏗️ Project Structure

```
VIGILUX/
├── backend/          # Node.js API server
├── frontend/         # React Native app
├── docs/            # Documentation
├── README.md        # Project overview
└── LICENSE          # MIT License
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation

- [README](../README.md) - Project overview
- [Project Plan](canvas-submissions/project-plan.md) - Detailed plan
- [Git Setup](canvas-submissions/git-setup.md) - Git workflow
- [Development Guide](DEVELOPMENT.md) - Developer guide
- [Contributing](../CONTRIBUTING.md) - How to contribute

## 🐛 Troubleshooting

**Port in use:** Kill process on port 3000
**Database error:** Check PostgreSQL running and .env
**Expo not loading:** Try `expo start -c`

## 📊 Sprint Schedule

- **Duration:** 2 weeks
- **Standups:** Mon, Wed, Fri
- **Sprint Review:** End of sprint
- **Sprint Retrospective:** End of sprint

## ✅ Weekly Checklist

- [ ] Pull latest develop branch
- [ ] Update project board
- [ ] Attend standups
- [ ] Review team PRs
- [ ] Push your work
- [ ] Update documentation

## 🎨 Code Style

- Single quotes for strings
- Semicolons required
- 2 space indentation
- 80 character line length
- ESLint + Prettier configured

## 🔐 Environment Variables

```env
# Backend .env
PORT=3000
DB_HOST=localhost
DB_NAME=vigilux_db
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

## 🏷️ GitHub Labels

- `feature` - New feature
- `bug` - Bug report
- `documentation` - Docs
- `backend` - Backend work
- `frontend` - Frontend work
- `high-priority` - Urgent

## 📱 Tech Stack

**Frontend:** React Native, Expo, React Navigation  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**Notifications:** Firebase Cloud Messaging  
**Maps:** Google Maps / Mapbox

---

Last Updated: March 9, 2026
