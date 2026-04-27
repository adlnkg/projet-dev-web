import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getDeviceCreateForm, getDevice, postDevice, createDevice } from "../controllers/device.controller.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("devices"),
	createDevice,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getDeviceCreateForm);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER", "ADMIN"),
	requestDeletionForEntity("IOT_DEVICE", "Appareil"),
);

router.get("/:id", authMiddleware, getDevice);
router.post("/:id", authMiddleware, postDevice);

export default router;
