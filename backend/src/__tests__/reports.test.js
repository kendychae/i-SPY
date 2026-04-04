const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('Report API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testReportId;
  let searchReportId;

  // Setup: Create test user and login
  beforeAll(async () => {
    // Create test user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Test@123', 12);

    const userResult = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      ['report-test@example.com', hashedPassword, 'Report', 'Tester', 'citizen', true, true]
    );

    testUserId = userResult.rows[0].id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'report-test@example.com',
        password: 'Test@123'
      });

    authToken = loginResponse.body.data.tokens.accessToken;
  });

  // Cleanup
  afterAll(async () => {
    // Delete test data
    if (testReportId) {
      await db.query('DELETE FROM reports WHERE id = $1', [testReportId]);
    }
    if (searchReportId) {
      await db.query('DELETE FROM reports WHERE id = $1', [searchReportId]);
    }
    if (testUserId) {
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  describe('POST /api/v1/reports', () => {
    it('should create a new report successfully', async () => {
      const newReport = {
        title: 'Test Incident Report',
        description: 'This is a detailed description of a test incident for automated testing purposes.',
        incident_type: 'suspicious_activity',
        latitude: 34.0522,
        longitude: -118.2437,
        address: '123 Test Street, Los Angeles, CA 90001',
        incident_date: new Date().toISOString(),
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReport)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Report created successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newReport.title);
      expect(response.body.data.status).toBe('submitted');

      testReportId = response.body.data.id;
    });

    it('should reject report with missing required fields', async () => {
      const incompleteReport = {
        title: 'Incomplete Report'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteReport)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should reject report with invalid incident type', async () => {
      const invalidReport = {
        title: 'Test Report',
        description: 'This is a test report with an invalid incident type.',
        incident_type: 'invalid_type',
        latitude: 34.0522,
        longitude: -118.2437,
        incident_date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.details.some(d => d.field === 'incident_type')).toBe(true);
    });

    it('should reject report with invalid coordinates', async () => {
      const invalidReport = {
        title: 'Test Report',
        description: 'This is a test report with invalid coordinates.',
        incident_type: 'theft',
        latitude: 200, // Invalid latitude
        longitude: -118.2437,
        incident_date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.details.some(d => d.field === 'latitude')).toBe(true);
    });

    it('should reject report without authentication', async () => {
      const newReport = {
        title: 'Unauthorized Report',
        description: 'This report should be rejected.',
        incident_type: 'theft',
        latitude: 34.0522,
        longitude: -118.2437,
        incident_date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .send(newReport)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/reports', () => {
    it('should retrieve list of reports', async () => {
      const response = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total_items');
    });

    it('should filter reports by status', async () => {
      const response = await request(app)
        .get('/api/v1/reports?status=submitted')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      
      if (response.body.data.length > 0) {
        expect(response.body.data.every(r => r.status === 'submitted')).toBe(true);
      }
    });

    it('should filter reports by incident type', async () => {
      const response = await request(app)
        .get('/api/v1/reports?incident_type=suspicious_activity')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data.every(r => r.incident_type === 'suspicious_activity')).toBe(true);
      }
    });

    it('should filter reports by keyword search and category', async () => {
      const newReport = {
        title: 'Vandalism search test',
        description: 'Search keyword vandalism should return this report.',
        incident_type: 'vandalism',
        latitude: 34.0522,
        longitude: -118.2437,
        incident_date: new Date().toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReport)
        .expect('Content-Type', /json/)
        .expect(201);

      searchReportId = createResponse.body.data.id;

      const response = await request(app)
        .get('/api/v1/reports?q=vandalism&category=vandalism&status=submitted')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.some((r) => r.id === searchReportId)).toBe(true);

      await db.query('DELETE FROM reports WHERE id = $1', [searchReportId]);
      searchReportId = null;
    });

    it('should support date range filtering with dateFrom/dateTo', async () => {
      const now = new Date();
      const newReport = {
        title: 'Date range search test',
        description: 'This report is used to validate date range filtering.',
        incident_type: 'theft',
        latitude: 34.0522,
        longitude: -118.2437,
        incident_date: now.toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReport)
        .expect('Content-Type', /json/)
        .expect(201);

      const dateRangeId = createResponse.body.data.id;
      const dateFrom = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(`/api/v1/reports?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.some((r) => r.id === dateRangeId)).toBe(true);

      await db.query('DELETE FROM reports WHERE id = $1', [dateRangeId]);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/reports?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should support geographic filtering', async () => {
      const response = await request(app)
        .get('/api/v1/reports?latitude=34.0522&longitude=-118.2437&radius=5000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('distance_meters');
      }
    });
  });

  describe('GET /api/v1/reports/:id', () => {
    it('should retrieve a specific report by ID', async () => {
      if (!testReportId) {
        // Create a report first
        const newReport = {
          title: 'Report for GET test',
          description: 'Description for testing GET by ID endpoint.',
          incident_type: 'theft',
          latitude: 34.0522,
          longitude: -118.2437,
          incident_date: new Date().toISOString()
        };

        const createResponse = await request(app)
          .post('/api/v1/reports')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newReport);

        testReportId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testReportId);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('media');
      expect(response.body.data).toHaveProperty('updates');
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';
      
      const response = await request(app)
        .get(`/api/v1/reports/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/reports/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('PATCH /api/v1/reports/:id', () => {
    it('should update a report successfully', async () => {
      if (!testReportId) return;

      const updates = {
        title: 'Updated Report Title',
        priority: 'high'
      };

      const response = await request(app)
        .patch(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.priority).toBe(updates.priority);
    });

    it('should reject update with invalid priority', async () => {
      if (!testReportId) return;

      const updates = {
        priority: 'invalid_priority'
      };

      const response = await request(app)
        .patch(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/v1/reports/:id', () => {
    it('should delete a report successfully (soft delete)', async () => {
      if (!testReportId) return;

      const response = await request(app)
        .delete(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Report deleted successfully');

      // Verify report status changed to 'closed'
      const checkResponse = await request(app)
        .get(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.body.data.status).toBe('closed');
    });
  });
});

/**
 * Issue #45 — W5: Role-Based Permission System for Report Status Updates
 *
 * Tests every role/transition combination in the RBAC matrix:
 *   citizen  → 403 on any status change attempt
 *   officer  → 200 for allowed transitions; 403 for disallowed targets
 *   admin    → 200 for any valid state-machine transition
 */
describe('RBAC: PATCH /api/v1/reports/:id/status', () => {
  const bcrypt = require('bcrypt');

  let citizenToken, officerToken, adminToken;
  let citizenId, officerId, adminId;
  let rbacReportId;

  beforeAll(async () => {
    const hash = await bcrypt.hash('Test@123', 12);

    // citizen
    const c = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1,$2,'RBAC','Citizen','citizen',true,true)
       ON CONFLICT (email) DO UPDATE SET password_hash=$2 RETURNING id`,
      ['rbac-citizen@example.com', hash]
    );
    citizenId = c.rows[0].id;

    // officer
    const o = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1,$2,'RBAC','Officer','officer',true,true)
       ON CONFLICT (email) DO UPDATE SET password_hash=$2 RETURNING id`,
      ['rbac-officer@example.com', hash]
    );
    officerId = o.rows[0].id;

    // admin
    const a = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1,$2,'RBAC','Admin','admin',true,true)
       ON CONFLICT (email) DO UPDATE SET password_hash=$2 RETURNING id`,
      ['rbac-admin@example.com', hash]
    );
    adminId = a.rows[0].id;

    // Obtain tokens
    const login = (email) =>
      request(app).post('/api/v1/auth/login').send({ email, password: 'Test@123' });

    citizenToken = (await login('rbac-citizen@example.com')).body.data?.tokens?.accessToken;
    officerToken = (await login('rbac-officer@example.com')).body.data?.tokens?.accessToken;
    adminToken   = (await login('rbac-admin@example.com')).body.data?.tokens?.accessToken;

    // Create a test report owned by the citizen so we have something to transition
    const rr = await db.query(
      `INSERT INTO reports (user_id, title, description, incident_type, status, priority, latitude, longitude, incident_date)
       VALUES ($1,'RBAC Test Report','A report for RBAC testing purposes','theft','submitted','low',34.05,-118.24,NOW())
       RETURNING id`,
      [citizenId]
    );
    rbacReportId = rr.rows[0].id;
  });

  afterAll(async () => {
    if (rbacReportId) await db.query('DELETE FROM reports WHERE id=$1', [rbacReportId]);
    if (citizenId)   await db.query('DELETE FROM users WHERE id=$1', [citizenId]);
    if (officerId)   await db.query('DELETE FROM users WHERE id=$1', [officerId]);
    if (adminId)     await db.query('DELETE FROM users WHERE id=$1', [adminId]);
  });

  // Helper to reset report back to 'submitted' for next test
  const resetStatus = () =>
    db.query("UPDATE reports SET status='submitted' WHERE id=$1", [rbacReportId]);

  it('citizen: 403 on any status update attempt', async () => {
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ status: 'under_review' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('officer: 200 transitioning submitted → under_review', async () => {
    await resetStatus();
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ status: 'under_review' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('officer: 200 transitioning under_review → investigating', async () => {
    // Report should now be under_review from previous test
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ status: 'investigating' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('officer: 200 transitioning investigating → resolved', async () => {
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ status: 'resolved' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('officer: 403 attempting to set status to closed', async () => {
    await resetStatus();
    // Move to under_review first so the state machine would otherwise allow → closed
    await db.query("UPDATE reports SET status='under_review' WHERE id=$1", [rbacReportId]);
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ status: 'closed' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('admin: 200 setting any valid status (closed)', async () => {
    await db.query("UPDATE reports SET status='resolved' WHERE id=$1", [rbacReportId]);
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'closed' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin: 422 on invalid state-machine transition', async () => {
    // closed → investigating is not a valid state-machine transition
    const res = await request(app)
      .patch(`/api/v1/reports/${rbacReportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'investigating' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
