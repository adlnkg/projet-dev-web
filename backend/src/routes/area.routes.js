import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getAreaCreateForm, getArea, postArea, createArea } from "../controllers/area.controller.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("areas"),
	createArea,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getAreaCreateForm);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER"),
	requestDeletionForEntity("AREA", "Zone"),
);

router.get("/:id", authMiddleware, getArea);
router.post("/:id", authMiddleware, postArea);

export default router;
