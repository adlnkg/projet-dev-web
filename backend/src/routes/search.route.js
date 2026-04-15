import express from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { searchDevices } from '../controllers/search.controller';

const router = express.Router();

router.use('/search', authMiddleware, searchDevices);

export default router;