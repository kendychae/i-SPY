const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'vigilux-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vigilux-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token expires in 7 days

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      tokenVersion: 1,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
exports.register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, firstName, lastName, phoneNumber, userType, idDocumentUrl } = req.body;

    if (!idDocumentUrl || !String(idDocumentUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'ID document upload is required',
      });
    }

    if (!['citizen', 'officer'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose either citizen or officer account type',
      });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, id_document_url, is_verified, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, 'pending')
       RETURNING id, email, first_name, last_name, user_type, is_verified, verification_status, id_document_url, created_at`,
      [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phoneNumber,
        userType,
        idDocumentUrl,
      ]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Account created and submitted for admin verification',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          userType: newUser.user_type,
          isVerified: newUser.is_verified,
          verificationStatus: newUser.verification_status,
          idDocumentUrl: newUser.id_document_url,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
exports.login = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await client.query(
      `SELECT id, email, password_hash, first_name, last_name, user_type, is_active, is_verified, verification_status
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been disabled. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    await client.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          isVerified: user.is_verified,
          verificationStatus: user.verification_status,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRES_IN,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
exports.refresh = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Get user from database
    const result = await client.query(
      `SELECT id, email, first_name, last_name, user_type, is_active
       FROM users
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = result.rows[0];

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: JWT_EXPIRES_IN,
        },
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // or store logout events in the database
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // User is attached to req by auth middleware
    const result = await client.query(
      `SELECT id, email, first_name, last_name, phone_number, user_type, is_verified, created_at
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          userType: user.user_type,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
    });
  } finally {
    client.release();
  }
};

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
exports.updateProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (firstName && (firstName.length < 2 || firstName.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'First name must be between 2 and 100 characters',
      });
    }

    if (lastName && (lastName.length < 2 || lastName.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be between 2 and 100 characters',
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName.trim());
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName.trim());
    }

    if (phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phoneNumber.trim() || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone_number, user_type, is_verified, created_at
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          userType: user.user_type,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

/**
 * Delete user account
 * DELETE /api/v1/auth/account
 * Requires password confirmation for security
 */
exports.deleteAccount = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
    }

    // Get user and verify password
    const result = await client.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Begin transaction - delete user and all related data
    await client.query('BEGIN');

    // Delete all user's reports and related data
    await client.query('DELETE FROM media WHERE report_id IN (SELECT id FROM reports WHERE user_id = $1)', [userId]);
    await client.query('DELETE FROM report_updates WHERE report_id IN (SELECT id FROM reports WHERE user_id = $1)', [userId]);
    await client.query('DELETE FROM reports WHERE user_id = $1', [userId]);
    
    // Delete notifications
    await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    
    // Delete user account
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

/**
 * Verify email token
 * POST /api/v1/auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { token } = req.body;

    // In production, implement proper email verification with tokens
    // For now, just verify the user
    const decoded = jwt.verify(token, JWT_SECRET);

    await client.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [decoded.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  } finally {
    client.release();
  }
};

/**
 * List users pending verification
 * GET /api/v1/auth/pending-verifications
 * Admin only
 */
exports.getPendingVerifications = async (req, res) => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `SELECT
         id,
         email,
         first_name,
         last_name,
         user_type,
         phone_number,
         id_document_url,
         verification_status,
         created_at
       FROM users
       WHERE verification_status = 'pending'
         AND user_type IN ('citizen', 'officer')
       ORDER BY created_at ASC`
    );

    return res.status(200).json({
      success: true,
      data: { users: rows },
    });
  } catch (error) {
    console.error('Pending verification list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending verification users',
    });
  } finally {
    client.release();
  }
};

/**
 * Approve or reject user verification
 * PATCH /api/v1/auth/verify-user/:id
 * Admin only
 */
exports.verifyUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either approved or rejected',
      });
    }

    const isApproved = decision === 'approved';

    const { rows } = await client.query(
      `UPDATE users
       SET is_verified = $1,
           verification_status = $2,
           verification_notes = $3,
           verified_at = CURRENT_TIMESTAMP,
           verified_by = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, user_type, is_verified, verification_status, verified_at`,
      [isApproved, decision, notes || null, req.user.userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${decision} successfully`,
      data: { user: rows[0] },
    });
  } catch (error) {
    console.error('Verify user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user verification status',
    });
  } finally {
    client.release();
  }
};
