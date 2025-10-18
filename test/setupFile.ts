import * as mongoose from 'mongoose';

// Global utility function for generating unique emails
let emailCounter = 0;
global.generateUniqueEmail = (prefix = 'test') => {
  emailCounter++;
  return `${prefix}-${Date.now()}-${emailCounter}@example.com`;
};

// Generate a unique database name for this test run
const testDbName = `test-db-${Date.now()}-${Math.random().toString(36).substring(7)}`;

beforeAll(async () => {
  // Connect to the MongoDB instance set up by globalSetup.ts
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI environment variable is not set. Check your globalSetup.ts',
    );
  }

  // Use a unique database name for each test file
  await mongoose.connect(`${mongoUri}/${testDbName}`);
  console.log(`Connected to MongoDB: ${mongoUri}/${testDbName}`);
});

// Note: No global beforeEach/afterEach cleaning - rely on unique database per test file
// Each test file gets its own clean database, which should be sufficient for isolation

afterAll(async () => {
  // Drop the entire test database and disconnect
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    console.log(`Dropped test database: ${testDbName}`);
  }
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
});
