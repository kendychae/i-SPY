const db = require('../config/database');

/**
 * Create a new incident report
 * POST /api/v1/reports
 */
const createReport = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const {
      title,
      description,
      incident_type,
      latitude,
      longitude,
      address,
      incident_date,
      priority = 'medium',
      client_id
    } = req.body;

    const userId = req.user.userId;

    // Validate required fields
    const errors = [];

    if (!title || title.trim().length < 3 || title.trim().length > 255) {
      errors.push({
        field: 'title',
        message: 'Title must be between 3 and 255 characters'
      });
    }

    if (!description || description.trim().length < 10 || description.trim().length > 5000) {
      errors.push({
        field: 'description',
        message: 'Description must be between 10 and 5000 characters'
      });
    }

    const allowedIncidentTypes = [
      'theft',
      'vandalism',
      'assault',
      'suspicious_activity',
      'traffic_violation',
      'noise_complaint',
      'fire',
      'medical_emergency',
      'other'
    ];

    if (!incident_type || !allowedIncidentTypes.includes(incident_type)) {
      errors.push({
        field: 'incident_type',
        message: `Invalid incident type. Allowed values: ${allowedIncidentTypes.join(', ')}`
      });
    }

    if (!latitude || isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.push({
        field: 'latitude',
        message: 'Latitude must be a number between -90 and 90'
      });
    }

    if (!longitude || isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.push({
        field: 'longitude',
        message: 'Longitude must be a number between -180 and 180'
      });
    }

    if (!incident_date) {
      errors.push({
        field: 'incident_date',
        message: 'Incident date is required'
      });
    } else {
      const incidentDateTime = new Date(incident_date);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (isNaN(incidentDateTime.getTime())) {
        errors.push({
          field: 'incident_date',
          message: 'Invalid date format. Use ISO8601 format (e.g., 2026-03-20T14:30:00Z)'
        });
      } else if (incidentDateTime < sevenDaysAgo || incidentDateTime > oneDayAhead) {
        errors.push({
          field: 'incident_date',
          message: 'Incident date cannot be more than 7 days in the past or in the future'
        });
      }
    }

    const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !allowedPriorities.includes(priority)) {
      errors.push({
        field: 'priority',
        message: `Invalid priority. Allowed values: ${allowedPriorities.join(', ')}`
      });
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    // Begin transaction
    await client.query('BEGIN');

    // Insert report into database with idempotency handling
    const insertReportQuery = `
      INSERT INTO reports (
        user_id,
        title,
        description,
        incident_type,
        status,
        priority,
        latitude,
        longitude,
        address,
        incident_date,
        client_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (client_id) DO NOTHING
      RETURNING *;
    `;

    let reportResult = await client.query(insertReportQuery, [
      userId,
      title.trim(),
      description.trim(),
      incident_type,
      'submitted',
      priority,
      parseFloat(latitude),
      parseFloat(longitude),
      address || null,
      incident_date,
      client_id || null
    ]);

    let report = reportResult.rows[0];

    // If no row was inserted (conflict), fetch the existing report by client_id
    if (!report && client_id) {
      const existingReportQuery = `
        SELECT * FROM reports WHERE client_id = $1;
      `;
      const existingResult = await client.query(existingReportQuery, [client_id]);
      report = existingResult.rows[0];
    }

    // If still no report found, this shouldn't happen but handle gracefully
    if (!report) {
      await client.query('ROLLBACK');
      return res.status(500).json({
        success: false,
        error: 'Failed to create or retrieve report',
        message: 'An unexpected error occurred while processing the report.'
      });
    }

    // Handle media file uploads if present
    let mediaRecords = [];
    if (req.files && req.files.length > 0) {
      // In production, files would be uploaded to S3/Cloud Storage
      // For now, we'll store file metadata
      for (const file of req.files) {
        const insertMediaQuery = `
          INSERT INTO media (
            report_id,
            file_url,
            file_type,
            file_size
          ) VALUES ($1, $2, $3, $4)
          RETURNING *;
        `;

        // Generate file URL (would be S3 URL in production)
        const fileUrl = `/uploads/reports/${report.id}/${file.secureFilename}`;

        const mediaResult = await client.query(insertMediaQuery, [
          report.id,
          fileUrl,
          file.mimetype,
          file.size
        ]);

        mediaRecords.push(mediaResult.rows[0]);

        // TODO: Upload file to cloud storage (S3, Firebase Storage, etc.)
        // await uploadToCloudStorage(file.buffer, file.secureFilename, report.id);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        ...report,
        media: mediaRecords
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating report:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while creating the report'
    });
  } finally {
    client.release();
  }
};

/**
 * Get list of reports with filtering and pagination
 * GET /api/v1/reports
 */
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      incident_type,
      priority,
      start_date,
      end_date,
      latitude,
      longitude,
      radius,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions = [];
    const queryParams = [];
    let paramCount = 0;

    // Filter by status (comma-separated)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      paramCount++;
      conditions.push(`status = ANY($${paramCount}::text[])`);
      queryParams.push(statuses);
    }

    // Filter by incident_type (comma-separated)
    if (incident_type) {
      const types = incident_type.split(',').map(t => t.trim());
      paramCount++;
      conditions.push(`incident_type = ANY($${paramCount}::text[])`);
      queryParams.push(types);
    }

    // Filter by priority (comma-separated)
    if (priority) {
      const priorities = priority.split(',').map(p => p.trim());
      paramCount++;
      conditions.push(`priority = ANY($${paramCount}::text[])`);
      queryParams.push(priorities);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      conditions.push(`created_at >= $${paramCount}`);
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      conditions.push(`created_at <= $${paramCount}`);
      queryParams.push(end_date);
    }

    // Geographic filtering (radius search)
    let distanceSelect = '';
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusMeters = parseInt(radius);

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusMeters)) {
        // Calculate distance using Haversine formula
        distanceSelect = `, 
          (6371000 * acos(
            cos(radians($${paramCount + 1})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians($${paramCount + 2})) + 
            sin(radians($${paramCount + 1})) * 
            sin(radians(latitude))
          )) AS distance_meters`;
        
        paramCount += 2;
        queryParams.push(lat, lng);

        paramCount++;
        conditions.push(`
          (6371000 * acos(
            cos(radians($${paramCount - 2})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians($${paramCount - 1})) + 
            sin(radians($${paramCount - 2})) * 
            sin(radians(latitude))
          )) <= $${paramCount}
        `);
        queryParams.push(radiusMeters);
      }
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Validate sort field
    const allowedSortFields = ['created_at', 'incident_date', 'priority', 'status'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Count total matching reports
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reports
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get reports with media count
    const reportsQuery = `
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM media WHERE report_id = r.id) as media_count
        ${distanceSelect}
      FROM reports r
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limitNum, offset);

    const reportsResult = await db.query(reportsQuery, queryParams);

    return res.status(200).json({
      success: true,
      data: reportsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total_items: totalItems,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while fetching reports'
    });
  }
};

/**
 * Get a single report by ID
 * GET /api/v1/reports/:id
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid report ID format'
      });
    }

    // Get report details
    const reportQuery = `
      SELECT * FROM reports
      WHERE id = $1
    `;

    const reportResult = await db.query(reportQuery, [id]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Report not found'
      });
    }

    const report = reportResult.rows[0];

    // Get associated media
    const mediaQuery = `
      SELECT * FROM media
      WHERE report_id = $1
      ORDER BY uploaded_at ASC
    `;

    const mediaResult = await db.query(mediaQuery, [id]);

    // Get report updates
    const updatesQuery = `
      SELECT 
        ru.*,
        u.first_name,
        u.last_name
      FROM report_updates ru
      JOIN users u ON ru.user_id = u.id
      WHERE ru.report_id = $1 AND ru.is_internal = false
      ORDER BY ru.created_at DESC
    `;

    const updatesResult = await db.query(updatesQuery, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...report,
        media: mediaResult.rows,
        updates: updatesResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching report:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the report'
    });
  }
};

/**
 * Update a report
 * PATCH /api/v1/reports/:id
 */
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    const userId = req.user.userId;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid report ID format'
      });
    }

    // Check if report exists and user has permission
    const checkQuery = `
      SELECT * FROM reports
      WHERE id = $1
    `;

    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Report not found'
      });
    }

    const report = checkResult.rows[0];

    // Check if user owns the report or is admin
    if (report.user_id !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to update this report'
      });
    }

    // Build update query
    const updates = [];
    const queryParams = [];
    let paramCount = 0;

    if (title && title.trim()) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      queryParams.push(title.trim());
    }

    if (description && description.trim()) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      queryParams.push(description.trim());
    }

    if (priority) {
      const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: `Invalid priority. Allowed values: ${allowedPriorities.join(', ')}`
        });
      }
      paramCount++;
      updates.push(`priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'No valid fields to update'
      });
    }

    paramCount++;
    queryParams.push(id);

    const updateQuery = `
      UPDATE reports
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updateResult = await db.query(updateQuery, queryParams);

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating report:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the report'
    });
  }
};

/**
 * Delete a report (soft delete)
 * DELETE /api/v1/reports/:id
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid report ID format'
      });
    }

    // Check if report exists and user has permission
    const checkQuery = `
      SELECT * FROM reports
      WHERE id = $1
    `;

    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Report not found'
      });
    }

    const report = checkResult.rows[0];

    // Check if user owns the report or is admin
    if (report.user_id !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to delete this report'
      });
    }

    // Soft delete by updating status
    const deleteQuery = `
      UPDATE reports
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(deleteQuery, [id]);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while deleting the report'
    });
  }
};

/**
 * Allowed status transitions (state machine)
 * Issue #53 - W5: Report Status Tracking
 */
const STATUS_TRANSITIONS = {
  submitted:    ['under_review', 'closed'],
  under_review: ['investigating', 'submitted', 'closed'],
  investigating:['resolved', 'under_review', 'closed'],
  resolved:     ['closed', 'submitted'],
  closed:       ['submitted'],
};

/**
 * Update report status with transition validation
 * PATCH /api/v1/reports/:id/status
 */
const updateReportStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { status: newStatus, notes } = req.body;
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const allowedStatuses = Object.keys(STATUS_TRANSITIONS);
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    await client.query('BEGIN');

    // Fetch current report
    const { rows: reportRows } = await client.query(
      'SELECT id, status, user_id FROM reports WHERE id = $1',
      [id]
    );
    if (reportRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const report = reportRows[0];
    const currentStatus = report.status;

    // Role-based permission check is handled upstream by role.middleware.js
    // (Issue #45). Remaining guard: citizens are blocked before reaching here.

    // Validate transition
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        success: false,
        message: `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed next statuses: ${allowed.join(', ')}`,
      });
    }

    // Update report status
    await client.query(
      'UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, id]
    );

    // Insert history row
    await client.query(
      `INSERT INTO report_status_history (report_id, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, currentStatus, newStatus, userId, notes || null]
    );

    await client.query('COMMIT');

    // Fire notification to report owner (async, non-blocking)
    try {
      const { notify } = require('../utils/notifications');
      const statusLabels = {
        under_review: 'Under Review',
        investigating: 'Being Investigated',
        resolved: 'Resolved',
        closed: 'Closed',
        submitted: 'Re-submitted',
      };
      if (String(report.user_id) !== String(userId)) {
        await notify(
          String(report.user_id),
          'Report Status Updated',
          `Your report status changed to: ${statusLabels[newStatus] || newStatus}`,
          'report_status_change',
          id,
          { reportId: id, newStatus }
        );
      }
    } catch (notifyErr) {
      console.error('[updateReportStatus] Notification error (non-fatal):', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Report status updated',
      data: { reportId: id, oldStatus: currentStatus, newStatus },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateReportStatus error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
};

/**
 * Get full status history for a report
 * GET /api/v1/reports/:id/status-history
 */
const getReportStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify report exists and user has access
    const { rows: reportRows } = await db.query(
      'SELECT id, user_id FROM reports WHERE id = $1',
      [id]
    );
    if (reportRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const { rows: history } = await db.query(
      `SELECT
         rsh.id,
         rsh.old_status,
         rsh.new_status,
         rsh.notes,
         rsh.changed_at,
         u.first_name,
         u.last_name,
         u.user_type
       FROM report_status_history rsh
       LEFT JOIN users u ON u.id = rsh.changed_by
       WHERE rsh.report_id = $1
       ORDER BY rsh.changed_at ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { reportId: id, history },
    });
  } catch (error) {
    console.error('getReportStatusHistory error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  getReportStatusHistory,
};
