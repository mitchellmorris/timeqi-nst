import * as mongoose from 'mongoose';

beforeAll(async () => {
  // Connect to the MongoDB instance set up by globalSetup.ts
  // This will be either MongoMemoryServer or local MongoDB based on MEMORY env var
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DATABASE || 'test-db';

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI environment variable is not set. Check your globalSetup.ts',
    );
  }

  await mongoose.connect(`${mongoUri}/${dbName}`);
  console.log(`Connected to MongoDB: ${mongoUri}/${dbName}`);
});

afterAll(async () => {
  // Disconnect from MongoDB after all tests
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
});
