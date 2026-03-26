# VIGILUX Deployment Guide

This guide covers deployment options for the VIGILUX application.

## 🚀 Quick Deploy Options

### Option 1: Local Deployment (Development/Testing)

**Prerequisites:**

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

**Steps:**

1. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**

   ```bash
   # Backend .env file is already configured
   # Verify database credentials in backend/.env
   ```

3. **Set Up Database**

   ```bash
   # Ensure PostgreSQL is running
   # Create database if it doesn't exist
   npm run migrate
   ```

4. **Start Backend Server**

   ```bash
   npm run dev  # Development mode with auto-reload
   # OR
   npm start    # Production mode
   ```

5. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

6. **Start Frontend**
   ```bash
   npm start    # Starts Expo development server
   ```

---

### Option 2: Railway Deployment (Recommended for Production)

**Backend & Database Deployment:**

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Initialize Project**

   ```bash
   cd backend
   railway init
   ```

4. **Add PostgreSQL Database**

   ```bash
   railway add --plugin postgresql
   ```

5. **Set Environment Variables**

   ```bash
   railway variables set JWT_SECRET="your-secret-key-change-in-production"
   railway variables set JWT_REFRESH_SECRET="your-refresh-secret-key"
   railway variables set NODE_ENV="production"
   ```

6. **Deploy**

   ```bash
   railway up
   ```

7. **Run Database Migration**
   ```bash
   railway run npm run migrate
   ```

**Get Your Deployment URL:**

```bash
railway domain
```

---

### Option 3: Render Deployment

**Backend Deployment:**

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** vigilux-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Root Directory:** `backend`

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = your secret key
   - `JWT_REFRESH_SECRET` = your refresh secret
   - `DATABASE_URL` = (from Render PostgreSQL)

**Database Setup:**

1. Click "New +" → "PostgreSQL"
2. Name it and create
3. Copy the Internal Database URL to your web service

---

### Option 4: Heroku Deployment

**Prerequisites:**

- Heroku CLI installed
- Heroku account

**Steps:**

1. **Login to Heroku**

   ```bash
   heroku login
   ```

2. **Create Application**

   ```bash
   cd backend
   heroku create vigilux-app-backend
   ```

3. **Add PostgreSQL Add-on**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy to Heroku**

   ```bash
   git subtree push --prefix backend heroku main
   # OR if you haven't committed changes:
   git add .
   git commit -m "Prepare for deployment"
   git subtree push --prefix backend heroku main
   ```

6. **Run Database Migration**

   ```bash
   heroku run npm run migrate
   ```

7. **Open Your App**
   ```bash
   heroku open
   ```

---

### Option 5: Docker Deployment

**Prerequisites:**

- Docker installed
- Docker Compose (optional)

**Using Docker:**

1. **Build Image**

   ```bash
   cd backend
   docker build -t vigilux-backend .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e JWT_SECRET="your-secret" \
     -e JWT_REFRESH_SECRET="your-refresh-secret" \
     -e DB_HOST="your-db-host" \
     -e DB_NAME="vigilux_db" \
     -e DB_USER="postgres" \
     -e DB_PASSWORD="your-password" \
     --name vigilux-backend \
     vigilux-backend
   ```

**Using Docker Compose (Create docker-compose.yml):**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=vigilux_db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - JWT_SECRET=your-secret-key
      - JWT_REFRESH_SECRET=your-refresh-secret
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=vigilux_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```

---

## 📱 Mobile App Deployment (Frontend)

### Expo Build & Deploy

**For Development/Testing:**

```bash
cd frontend
npx expo start
```

**For Production Build:**

1. **Configure app.json**
   - Ensure all required fields are filled
   - Set version and build numbers

2. **Build for Android:**

   ```bash
   npx expo build:android
   ```

3. **Build for iOS:**

   ```bash
   npx expo build:ios
   ```

4. **Or use EAS Build (New Expo System):**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --platform android
   eas build --platform ios
   ```

---

## 🔒 Security Checklist Before Production

- [ ] Change all default secrets in .env
- [ ] Set strong JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Review security headers (helmet is already configured)
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Review and test all API endpoints

---

## 🧪 Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.com/health

# API info
curl https://your-domain.com/api/v1

# Register user (POST)
curl -X POST https://your-domain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","firstName":"Test","lastName":"User"}'

# Login (POST)
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

---

## 📊 Monitoring & Maintenance

**Recommended Tools:**

- **Logging:** Winston, Pino, or cloud provider logs
- **Monitoring:** New Relic, Datadog, or Railway metrics
- **Uptime:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry
- **Performance:** Lighthouse, Web Vitals

---

## 🆘 Troubleshooting

### Common Issues:

**"Cannot connect to database"**

- Verify DATABASE*URL or DB*\* environment variables
- Check if PostgreSQL is running
- Verify network connectivity

**"Port already in use"**

- Change PORT environment variable
- Kill existing process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)

**"Module not found"**

- Run `npm install` in the correct directory
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**"JWT token invalid"**

- Ensure JWT_SECRET matches between auth.controller and auth.middleware
- Check token expiration times

---

## 📞 Support

For deployment issues:

1. Check logs: `railway logs` or `heroku logs --tail`
2. Review [GitHub Issues](https://github.com/kendychae/VIGILUX/issues)
3. Contact the development team

---

**Deployment Status:** Ready for deployment ✅

**Last Updated:** March 14, 2026
