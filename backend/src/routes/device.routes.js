import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getDeviceCreateForm, getDevice, postDevice, createDevice, deleteDevice } from "../controllers/device.controller.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";
import { searchIoTDevices } from "../controllers/search.controller.js";
import { validateAndNormalizeIoTDeviceSearch } from "../middlewares/search.middleware.js";

const router = express.Router();

router.get("/search", authMiddleware, validateAndNormalizeIoTDeviceSearch, searchIoTDevices);

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("devices"),
	createDevice,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getDeviceCreateForm);

router.delete(
	"/:id",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	deleteDevice,
);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER", "ADMIN"),
	requestDeletionForEntity("IOT_DEVICE", "Appareil"),
);

router.get("/:id", authMiddleware, getDevice);
router.post("/:id", authMiddleware, postDevice);

export default router;
