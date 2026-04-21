import express from "express";
import { login, register, verifyOTP } from "../controllers/auth.controller.js";

const router = new express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);

export default router;
