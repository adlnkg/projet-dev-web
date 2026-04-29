import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getEventCreateForm, getEvent, postEvent, createEvent, registerToEvent, unregisterFromEvent, deleteEvent } from "../controllers/event.controller.js";
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";
import { searchEvents } from "../controllers/search.controller.js";
import { validateAndNormalizeEventSearch } from "../middlewares/search.middleware.js";

const router = express.Router();

router.get("/search", validateAndNormalizeEventSearch, searchEvents);

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("events"),
	createEvent,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getEventCreateForm);

router.delete(
	"/:id",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	deleteEvent,
);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER"),
	requestDeletionForEntity("EVENT", "Evenement"),
);

router.post("/:id/register", authMiddleware, registerToEvent);
router.post("/:id/unregister", authMiddleware, unregisterFromEvent);

router.get("/:id", optionalAuthMiddleware, getEvent);
router.post("/:id", authMiddleware, postEvent);

export default router;
