import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Attempt DB connection
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Thirty Seconds Server running on http://localhost:${PORT}`);
  });
}

startServer();
