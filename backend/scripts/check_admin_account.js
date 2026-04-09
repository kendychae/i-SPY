require('dotenv').config();

const db = require('../src/config/database');

async function run() {
  try {
    const result = await db.query(
      `SELECT email, user_type, is_verified, verification_status, is_active
       FROM users
       WHERE lower(email) = 'admin@ipsy.app'`
    );

    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

run();
