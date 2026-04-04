const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database migration script
 * Run with: npm run migrate
 */

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vigilux_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('Starting database migrations...');

    // Read schema file
    const fs = require('fs');
    const path = require('path');
    const readSqlFile = (filePath) => fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = readSqlFile(schemaPath);

    // Execute schema
    await client.query(schema);

    console.log('✓ Database schema created successfully');

    // Create spatial index for geospatial queries
    console.log('Creating spatial indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_location 
      ON reports (latitude, longitude);
    `);
    console.log('✓ Spatial indexes created successfully');

    // Insert default admin user (optional)
    const bcrypt = require('bcrypt');
    const defaultPassword = await bcrypt.hash('Admin@123', 12);

    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, [
      'admin@vigilux.app',
      defaultPassword,
      'System',
      'Administrator',
      'admin',
      true,
      true
    ]);

    console.log('✓ Default admin user created (admin@vigilux.app / Admin@123)');

    // Run W5 migration: report_status_history, notification_preferences, fcm_tokens
    console.log('Running W5 migrations...');
    const w5MigrationPath = path.join(__dirname, 'migrations', '002_w5_report_status_notifications.sql');
    const w5Migration = readSqlFile(w5MigrationPath);
    await client.query(w5Migration);
    console.log('✓ W5 migration completed (report_status_history, notification_preferences, fcm_tokens)');

    // Run W6 migration: provider-aware push tokens for Expo + FCM delivery
    console.log('Running W6 migrations...');
    const w6MigrationPath = path.join(__dirname, 'migrations', '003_push_token_providers.sql');
    const w6Migration = readSqlFile(w6MigrationPath);
    await client.query(w6Migration);
    console.log('✓ W6 migration completed (provider-aware push tokens)');

    // Run W7 migration: officer assignment tracking
    console.log('Running W7 migrations...');
    const w7MigrationPath = path.join(__dirname, 'migrations', '004_officer_assignment.sql');
    const w7Migration = readSqlFile(w7MigrationPath);
    await client.query(w7Migration);
    console.log('✓ W7 migration completed (officer assignment tracking)');

    // Run offline sync migration: client_id for idempotency
    console.log('Running offline sync migrations...');
    const offlineSyncMigrationPath = path.join(__dirname, 'migrations', '005_client_id.sql');
    const offlineSyncMigration = readSqlFile(offlineSyncMigrationPath);
    await client.query(offlineSyncMigration);
    console.log('✓ Offline sync migration completed (client_id for idempotency)');

    console.log('\n✅ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations();
