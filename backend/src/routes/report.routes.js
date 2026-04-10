const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { checkStatusUpdatePermission } = require('../middleware/role.middleware');
const {
  upload,
  validateFileSignatures,
  handleMulterError,
  enrichFileMetadata
} = require('../middleware/upload.middleware');
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  getReportStatusHistory,
} = require('../controllers/report.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mediaController = require('../controllers/media.controller');

// Multer storage configuration for standalone media uploads
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user ? req.user.userId : 'anonymous';
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const fileType = file.mimetype.split('/')[0];
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
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${timestamp}${ext}`);
  },
});

const mediaUpload = multer({ storage: mediaStorage });

// All CRUD routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/reports
 * @desc    Create a new incident report with optional media files
 * @access  Private (authenticated users)
 */
router.post(
  '/',
  upload.array('media', 5),
  handleMulterError,
  validateFileSignatures,
  enrichFileMetadata,
  createReport
);

/**
 * @route   GET /api/v1/reports
 * @desc    Get list of reports with filtering and pagination
 * @access  Private (authenticated users)
 */
router.get('/', getReports);

/**
 * @route   GET /api/v1/reports/:id
 * @desc    Get a single report by ID with full details
 * @access  Private (authenticated users)
 */
router.get('/:id', getReportById);

/**
 * @route   PATCH /api/v1/reports/:id
 * @desc    Update a report (only by creator or admin)
 * @access  Private (authenticated users, owner or admin)
 */
router.patch('/:id', updateReport);

/**
 * @route   DELETE /api/v1/reports/:id
 * @desc    Delete a report (soft delete by setting status to 'closed')
 * @access  Private (authenticated users, owner or admin)
 */
router.delete('/:id', deleteReport);

/**
 * @route   PATCH /api/v1/reports/:id/status
 * @desc    Update report status with state-machine validation (Issue #53)
 * @access  Private (citizens view-only; officers partial; admins full control) — Issue #45
 */
router.patch('/:id/status', checkStatusUpdatePermission, updateReportStatus);

/**
 * @route   GET /api/v1/reports/:id/status-history
 * @desc    Get full status-change timeline for a report (Issue #53)
 * @access  Private
 */
router.get('/:id/status-history', getReportStatusHistory);


router.post(
  '/upload',
  mediaUpload.single('file'),
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

// Serve a stored file (path traversal protected)
router.get('/file/:userId/:date/:type/:filename', (req, res) => {
  const { userId, date, type, filename } = req.params;
  const safeParams = [userId, date, type, filename];
  if (safeParams.some((p) => p.includes('..') || p.includes('/'))) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  const uploadsBase = path.resolve(__dirname, '../../uploads');
  const filePath = path.join(uploadsBase, userId, date, type, filename);
  if (!filePath.startsWith(uploadsBase)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

// Get all media for a report
router.get('/media/report/:reportId', async (req, res) => {
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

// Get a single media record by ID
router.get('/media/:mediaId', async (req, res) => {
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

/**
 * @route   POST /api/v1/reports/:reportId/media
 * @desc    Upload media files for an existing report
 * @access  Private (authenticated users)
 */
router.post(
  '/:reportId/media',
  upload.array('media', 5),
  handleMulterError,
  validateFileSignatures,
  enrichFileMetadata,
  async (req, res) => {
    const { reportId } = req.params;
    const db = require('../config/database');

    try {
      const reportResult = await db.query(
        'SELECT id FROM reports WHERE id = $1',
        [reportId]
      );

      if (reportResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Report not found',
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'No media files were uploaded',
        });
      }

      const files = [];
      for (const file of req.files) {
        const fileUrl = `/uploads/reports/${reportId}/${file.secureFilename || file.filename}`;
        const mediaRecord = await mediaController.addMediaToReport(
          reportId,
          fileUrl,
          file.mimetype,
          file.size
        );

        files.push({
          id: mediaRecord.id,
          url: mediaRecord.file_url,
          type: mediaRecord.file_type,
          size: mediaRecord.file_size,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: {
          uploaded: files.length,
          failed: 0,
          files,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message,
      });
    }
  }
);

module.exports = router;
