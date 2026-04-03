import { getMe } from "../controllers/user.controller.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = new express.Router();

router.get("/me", authMiddleware, getMe);

export default router;
