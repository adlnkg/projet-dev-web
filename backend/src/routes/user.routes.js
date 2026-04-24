import { getMe, getUser, updateUser } from "../controllers/user.controller.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = new express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/:id", authMiddleware, getUser);
router.put("/:id", authMiddleware, updateUser);

export default router;
