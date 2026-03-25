const { pool } = require('../config/database');

/**
 * Media Controller
 * Handles linking uploaded media to reports
 */
exports.addMediaToReport = async (reportId, fileUrl, fileType, fileSize) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO media (report_id, file_url, file_type, file_size)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [reportId, fileUrl, fileType, fileSize]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

exports.getMediaByReport = async (reportId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM media WHERE report_id = $1`,
      [reportId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};
