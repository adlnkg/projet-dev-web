import express from 'express';
import  {search}  from '../controllers/search.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import {validateAndNormalizeSearch} from '../middlewares/search.middleware.js';
const router = express.Router();

router.get('/search',  validateAndNormalizeSearch, search); // Apply authentication middleware to the search route
export default router;