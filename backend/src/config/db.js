import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thirty_seconds';

  try {
    mongoose.set('strictQuery', true);
    // CRITICAL: Disable command buffering so requests never hang for 10000ms if MongoDB is offline
    mongoose.set('bufferCommands', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // Fast 2s check
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully:', mongoose.connection.host);
  } catch (error) {
    isConnected = false;
    console.log('💡 Note: Local MongoDB service is currently stopped or unreachable.');
    console.log('📁 Automatically activated built-in local store (server/data/db.json).');
    console.log('✨ All user accounts, sites, and published links will persist cleanly with zero setup!');
    console.log('👉 To use real MongoDB later, start your MongoDB service or paste your MongoDB Atlas URI in server/.env.');
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
