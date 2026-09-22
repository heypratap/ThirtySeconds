import express from 'express';
import {
  generatePrompt,
  extractProfile,
  generateFromProfile,
  refine
} from '../controllers/generateController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkGenerationQuota } from '../middleware/quota.js';
import { uploadPdf } from '../middleware/upload.js';

const router = express.Router();

// Generate from prompt
router.post('/prompt', requireAuth, checkGenerationQuota, generatePrompt);

// Extract profile from PDF / GitHub / Pasted Text (does not consume generation quota yet)
router.post('/extract', requireAuth, uploadPdf.single('resume'), extractProfile);

// Generate from confirmed profile
router.post('/from-profile', requireAuth, checkGenerationQuota, generateFromProfile);

// Refine site block tree
router.post('/refine', requireAuth, checkGenerationQuota, refine);

export default router;
