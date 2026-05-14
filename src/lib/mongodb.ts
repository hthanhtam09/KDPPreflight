import { MongoClient, type Db } from 'mongodb';

const DB_NAME = 'kdp_preflight';

declare global {
  var __kdpMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  globalThis.__kdpMongoClientPromise ??= new MongoClient(uri).connect();
  return globalThis.__kdpMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

export async function getFeedbackCollection() {
  const db = await getMongoDb();
  return db.collection('feedback');
}

export async function getFeatureFeedbackCollection() {
  const db = await getMongoDb();
  return db.collection('feature_feedback');
}
