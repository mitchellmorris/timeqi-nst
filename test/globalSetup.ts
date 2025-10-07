import { MongoMemoryServer } from 'mongodb-memory-server-core';
import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

// Extend global type for MongoDB instance
declare global {
  var __MONGOINSTANCE: MongoMemoryServer | undefined;
}

export = async function globalSetup() {
  // Create ConfigService instance manually
  const configService = new ConfigService();

  // Define default config with proper typing
  const config = {
    IP: configService.get<string>('MONGO_IP', 'localhost'),
    Port: configService.get<string>('MONGO_PORT', '27017'),
    Database: configService.get<string>('MONGO_DATABASE', 'test-db'),
  };

  // Config to decide if an mongodb-memory-server instance should be used
  if (configService.get<string>('MEMORY')) {
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();
    global.__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGO_URI = `mongodb://${config.IP}:${config.Port}`;
  }

  // The following is to make sure the database is clean before a test suite starts
  const conn = await mongoose.connect(
    `${process.env.MONGO_URI}/${config.Database}`,
  );

  // Safely drop database if connection exists
  if (conn.connection.db) {
    await conn.connection.db.dropDatabase();
  }

  await mongoose.disconnect();
};
