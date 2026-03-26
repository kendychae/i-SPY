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
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

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
