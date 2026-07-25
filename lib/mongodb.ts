import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

declare global {
  var _mongooseCache: { conn: any; promise: any } | undefined;
}

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null };
}

const cached = global._mongooseCache!;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
