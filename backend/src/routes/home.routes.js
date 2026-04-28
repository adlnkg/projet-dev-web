import express from "express";
import { getHomeFeed } from "../controllers/home.controller.js";
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();

router.get("/", optionalAuthMiddleware, getHomeFeed);

export default router;
