import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getEvent, postEvent, createEvent } from "../controllers/event.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("events"),
	createEvent,
);

router.get("/:id", authMiddleware, getEvent);
router.post("/:id", authMiddleware, postEvent);

export default router;
