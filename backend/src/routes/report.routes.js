const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Assume req.user.id is available from authentication middleware
    const userId = req.user ? req.user.userId : 'anonymous';
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const fileType = file.mimetype.split('/')[0]; // e.g., 'image', 'application'
    const uploadPath = path.join(
      __dirname,
      '../../uploads',
      userId,
      dateStr,
      fileType
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use original name with timestamp prefix for uniqueness
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

// Upload endpoint (authenticated)
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(201).json({
    message: 'File uploaded successfully',
    filePath: req.file.path.replace(/\\/g, '/').replace(/^.*\/uploads\//, ''),
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

// Serve files endpoint (authenticated)
router.get('/file/:userId/:date/:type/:filename', authenticate, (req, res) => {
  const { userId, date, type, filename } = req.params;
  const filePath = path.join(
    __dirname,
    '../../uploads',
    userId,
    date,
    type,
    filename
  );
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(path.resolve(filePath));
});

module.exports = router;
