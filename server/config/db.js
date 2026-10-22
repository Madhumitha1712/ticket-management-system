import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[MongoDB] Disconnected from database`);
    });

    if (connUri && !connUri.includes('127.0.0.1') && !connUri.includes('localhost')) {
      // Connect to provided remote/Atlas MongoDB URI
      console.log(`[MongoDB] Connecting to remote cluster...`);
      const conn = await mongoose.connect(connUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected to remote host: ${conn.connection.host}`);
      return conn;
    }

    try {
      // Try local MongoDB server with short timeout
      const localUri = connUri || 'mongodb://127.0.0.1:27017/fsd_ticket_system';
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[MongoDB] Connected to local daemon host: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(`[MongoDB] Local MongoDB daemon unavailable. Initializing embedded high-performance Mongo server for development/testing...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Embedded MongoDB ready at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
