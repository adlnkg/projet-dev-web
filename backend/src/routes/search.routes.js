import express from 'express';
import  {search, getSearchFilters}  from '../controllers/search.controller.js';
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware.js";
import {validateAndNormalizeSearch} from '../middlewares/search.middleware.js';
const router = express.Router();

router.get('/info', optionalAuthMiddleware, getSearchFilters);
router.get('/', optionalAuthMiddleware, validateAndNormalizeSearch, search); 
export default router;