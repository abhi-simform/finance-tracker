// FILE: api/src/__tests__/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

/** Starts an in-memory MongoDB instance and connects mongoose to it.
 * Call from `beforeAll` in every route test file. */
export async function setupTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

/** Disconnects mongoose and stops the in-memory server. Call from `afterAll`. */
export async function teardownTestDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

/** Wipes all collections between tests. Call from `afterEach`. */
export async function clearTestDb() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
