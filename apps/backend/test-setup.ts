// Test setup - sets required environment variables for tests
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
process.env.DIRECT_URL = "postgres://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-jwt-secret-for-testing";
process.env.NODE_ENV = "test";