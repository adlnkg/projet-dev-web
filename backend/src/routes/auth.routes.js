import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = new express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
