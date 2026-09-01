/**
 * Database Connection Manager
 * Gracefully manages MongoDB connection if available (with serverless connection caching),
 * or activates the embedded zero-config JSON database adapter.
 */

const mongoose = require('mongoose');

let isMongoConnected = false;
let cachedPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri === 'YOUR_MONGODB_URI_HERE' || process.env.NODE_ENV === 'test') {
    return { type: 'EMBEDDED_JSON', connected: true };
  }

  // If already connected in this serverless container, reuse connection
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return { type: 'MONGODB', connected: true, host: mongoose.connection.host };
  }

  // If a connection is already in progress, await the cached promise
  if (cachedPromise) {
    try {
      await cachedPromise;
      if (mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        return { type: 'MONGODB', connected: true, host: mongoose.connection.host };
      }
    } catch (e) {
      cachedPromise = null;
    }
  }

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });

    const conn = await cachedPromise;
    isMongoConnected = true;
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
    return { type: 'MONGODB', connected: true, host: conn.connection.host };
  } catch (error) {
    cachedPromise = null;
    isMongoConnected = false;
    console.warn(`ℹ️ [Database] MongoDB connection attempt failed (${error.message}).`);
    console.log('⚡ [Database] Running in FlowPilot Embedded Persistent Store (Serverless/Local fallback).');
    return { type: 'EMBEDDED_JSON', connected: true, fallbackReason: error.message };
  }
};

const getDbStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'MONGODB' : 'EMBEDDED_JSON',
  storagePath: isMongoConnected ? 'MongoDB Database' : 'data/db.json (Memory + Disk)'
});

module.exports = {
  connectDB,
  getDbStatus
};
