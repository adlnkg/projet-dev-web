import express from "express";
import { login, register, verifyOTP } from "../controllers/auth.controller.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";

const router = new express.Router();

router.post(
  "/register",
	...createImageUploadMiddleware("users"),
  register
);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);

export default router;
