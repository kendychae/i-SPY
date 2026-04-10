require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// ── Production safety guards ──────────────────────────────────────────────────
const INSECURE_DEFAULTS = [
  'vigilux-secret-key-change-in-production',
  'vigilux-refresh-secret-change-in-production',
];
if (process.env.NODE_ENV === 'production') {
  if (
    !process.env.JWT_SECRET ||
    INSECURE_DEFAULTS.includes(process.env.JWT_SECRET)
  ) {
    console.error('FATAL: JWT_SECRET is not set or is using a default value. Set a strong secret before running in production.');
    process.exit(1);
  }
  if (
    !process.env.JWT_REFRESH_SECRET ||
    INSECURE_DEFAULTS.includes(process.env.JWT_REFRESH_SECRET)
  ) {
    console.error('FATAL: JWT_REFRESH_SECRET is not set or is using a default value. Set a strong secret before running in production.');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const officerRoutes = require('./routes/officer.routes');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'VIGILUX API Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'VIGILUX API v1.0',
    endpoints: {
      auth: '/api/v1/auth',
      reports: '/api/v1/reports',
      users: '/api/v1/users',
      notifications: '/api/v1/notifications'
    }
  });
});

// Mount route handlers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/officer', officerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (only when run directly, not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VIGILUX Backend Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
