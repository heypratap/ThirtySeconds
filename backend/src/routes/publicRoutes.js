import express from 'express';
import { getPublicSite } from '../controllers/publicController.js';

const router = express.Router();

// Public route to view published portfolios
router.get('/:username', getPublicSite);

export default router;
