import { MongoMemoryServer } from 'mongodb-memory-server-core';

// Extend global type for MongoDB instance
declare global {
  var __MONGOINSTANCE: MongoMemoryServer | undefined;
}

export = async function globalTeardown() {
  // Check if we have a MongoMemoryServer instance to clean up
  if (global.__MONGOINSTANCE) {
    console.log('Stopping MongoMemoryServer...');
    await global.__MONGOINSTANCE.stop();
    global.__MONGOINSTANCE = undefined;
    console.log('MongoMemoryServer stopped successfully');
  }
};
