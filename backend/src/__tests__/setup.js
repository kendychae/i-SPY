/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'vigilux_test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test helpers
global.testUser = {
  email: 'test@example.com',
  password: 'Test@123',
  firstName: 'Test',
  lastName: 'User',
  userType: 'citizen'
};

// Clean up after all tests
afterAll(async () => {
  // Close database connections, etc.
  await new Promise(resolve => setTimeout(resolve, 500));
});
