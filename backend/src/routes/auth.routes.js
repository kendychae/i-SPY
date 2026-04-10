const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Rate limiters — OWASP: protect auth endpoints from brute-force (Issue #59)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

/**
 * Validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('phoneNumber')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('userType')
    .isIn(['citizen', 'officer'])
    .withMessage('User type must be citizen or officer'),
  body('idDocumentUrl')
    .trim()
    .notEmpty()
    .withMessage('ID document upload is required'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const verifyUserValidation = [
  body('decision')
    .isIn(['approved', 'rejected'])
    .withMessage('Decision must be approved or rejected'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const idStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/ids');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `id_${timestamp}_${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const idUpload = multer({
  storage: idStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * Routes
 */

// POST /api/v1/auth/register
router.post('/register', authLimiter, registerValidation, validate, authController.register);

// POST /api/v1/auth/upload-id
router.post('/upload-id', (req, res, next) => {
  idUpload.single('idDocument')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB. Please compress your image and try again.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ID document image is required',
      });
    }
    return res.status(201).json({
      success: true,
      message: 'ID document uploaded successfully',
      data: {
        idDocumentUrl: `/uploads/ids/${req.file.filename}`,
      },
    });
  });
});

// POST /api/v1/auth/login
router.post('/login', authLimiter, loginValidation, validate, authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', refreshValidation, validate, authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

// PATCH /api/v1/auth/profile
router.patch('/profile', authenticate, authController.updateProfile);

// DELETE /api/v1/auth/account
router.delete('/account', authenticate, authController.deleteAccount);

// POST /api/v1/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

// GET /api/v1/auth/pending-verifications
router.get('/pending-verifications', authenticate, authorize('admin'), authController.getPendingVerifications);

// PATCH /api/v1/auth/verify-user/:id
router.patch('/verify-user/:id', authenticate, authorize('admin'), verifyUserValidation, validate, authController.verifyUser);

module.exports = router;
