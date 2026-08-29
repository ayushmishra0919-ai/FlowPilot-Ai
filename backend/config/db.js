/**
 * Database Connection Manager
 * Gracefully manages MongoDB connection if available, or activates the embedded
 * zero-config JSON database adapter.
 */

const mongoose = require('mongoose');
const storeAdapter = require('../services/storeAdapter');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || process.env.NODE_ENV === 'test') {
    console.log('⚡ [Database] Running in FlowPilot Embedded Persistent Store (data/db.json).');
    return { type: 'EMBEDDED_JSON', connected: true };
  }

  try {
    // Attempt connecting to MongoDB with a short timeout to prevent blocking if Mongo is offline
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
    return { type: 'MONGODB', connected: true, host: conn.connection.host };
  } catch (error) {
    console.log(`ℹ️ [Database] Local MongoDB unavailable (${error.message}).`);
    console.log('⚡ [Database] Gracefully activated FlowPilot Embedded Persistent Store (data/db.json). Zero configuration needed.');
    return { type: 'EMBEDDED_JSON', connected: true, fallbackReason: error.message };
  }
};

const getDbStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'MONGODB' : 'EMBEDDED_JSON',
  storagePath: 'data/db.json'
});

module.exports = {
  connectDB,
  getDbStatus
};
