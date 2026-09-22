import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow frontend to talk to backend
app.use(cors({ origin: true, credentials: true }));

// Slow down too many login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Try again later.' }
});

// Slow down AI generation spam
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Generating too fast. Please wait a moment.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/generate', generateLimiter);

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Thirty Seconds API' });
});

// All API routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/public', publicRoutes);

// Handle errors nicely
app.use(errorHandler);

export default app;
