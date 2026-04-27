import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getEventCreateForm, getEvent, postEvent, createEvent } from "../controllers/event.controller.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("events"),
	createEvent,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getEventCreateForm);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER"),
	requestDeletionForEntity("EVENT", "Evenement"),
);

router.get("/:id", getEvent);
router.post("/:id", authMiddleware, postEvent);

export default router;
