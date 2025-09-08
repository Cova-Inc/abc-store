import mongoose from 'mongoose';

// Import all models to ensure they're registered with Mongoose
import '../models';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error('⚠️ Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'Cova-DB',
      })
      .then((_mongoose) => _mongoose)
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        throw error; // Propagate error
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB');
    return cached.conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}
