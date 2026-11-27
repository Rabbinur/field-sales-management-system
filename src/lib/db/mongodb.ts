import mongoose from "mongoose";
import { env } from "@/lib/config/env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database safely with Next.js HMR caching.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5s timeout to prevent requests from hanging
      connectTimeoutMS: 10000,
    };

    cached!.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

/**
 * Disconnect from MongoDB (useful for test teardown)
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached && cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

/**
 * Check connection readyState:
 * 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
 */
export function getConnectionState(): number {
  return mongoose.connection.readyState;
}
