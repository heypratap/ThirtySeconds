import express from 'express';
import { register, login, getMe, deleteAccount } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.delete('/me', requireAuth, deleteAccount);

export default router;
