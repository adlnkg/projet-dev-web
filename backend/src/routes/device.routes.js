import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getDevice, postDevice, createDevice } from "../controllers/device.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("devices"),
	createDevice,
);

router.get("/:id", authMiddleware, getDevice);
router.post("/:id", authMiddleware, postDevice);

export default router;
