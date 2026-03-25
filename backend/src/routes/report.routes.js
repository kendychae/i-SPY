const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mediaController = require('../controllers/media.controller');

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

// Upload endpoint (authenticated, links to report if reportId provided)
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { reportId } = req.body;
    let mediaRecord = null;
    if (reportId) {
      try {
        mediaRecord = await mediaController.addMediaToReport(
          reportId,
          req.file.path.replace(/\\/g, '/').replace(/^.*\/uploads\//, ''),
          req.file.mimetype,
          req.file.size
        );
      } catch (err) {
        return res.status(500).json({
          error: 'Failed to link media to report',
          details: err.message,
        });
      }
    }
    res.status(201).json({
      message: 'File uploaded successfully',
      filePath: req.file.path.replace(/\\/g, '/').replace(/^.*\/uploads\//, ''),
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      media: mediaRecord,
    });
  }
);

// Serve files endpoint (authenticated)
router.get('/file/:userId/:date/:type/:filename', authenticate, (req, res) => {
  const { userId, date, type, filename } = req.params;
  // Prevent path traversal attacks
  const safeParams = [userId, date, type, filename];
  if (safeParams.some((p) => p.includes('..') || p.includes('/'))) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  const uploadsBase = path.resolve(__dirname, '../../uploads');
  const filePath = path.join(uploadsBase, userId, date, type, filename);
  // Ensure resolved path is still within uploads directory
  if (!filePath.startsWith(uploadsBase)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

// Get all media for a report
router.get('/media/report/:reportId', authenticate, async (req, res) => {
  const { reportId } = req.params;
  try {
    const media = await mediaController.getMediaByReport(reportId);
    res.json({ media });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve media', details: err.message });
  }
});

// Get a single media record by mediaId
router.get('/media/:mediaId', authenticate, async (req, res) => {
  const { mediaId } = req.params;
  try {
    const { pool } = require('../config/database');
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM media WHERE id = $1', [
      mediaId,
    ]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json({ media: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve media', details: err.message });
  }
});

module.exports = router;
