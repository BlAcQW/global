import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection, used for serverless-friendly persistence when a Mongo
 * connection string is provided (DB_URL / MONGODB_URI / DATABASE_URL). The
 * client is cached on globalThis so serverless invocations and dev hot-reloads
 * reuse one pool instead of reconnecting per request.
 */
const uri =
  process.env.DB_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.DATABASE_URL;

export const mongoEnabled = Boolean(uri && uri.startsWith("mongodb"));

const DB_NAME = process.env.MONGODB_DB || "globe";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = new MongoClient(uri as string, {
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }
  return globalThis.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(DB_NAME);
}
