import express from 'express';
import {
  listSites,
  createSite,
  getSite,
  updateDraft,
  publishSite,
  unpublishSite,
  deleteSite
} from '../controllers/siteController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listSites);
router.post('/', createSite);
router.get('/:id', getSite);
router.put('/:id', updateDraft);
router.post('/:id/publish', publishSite);
router.post('/:id/unpublish', unpublishSite);
router.delete('/:id', deleteSite);

export default router;
