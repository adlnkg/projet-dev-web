import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getActualityCreateForm, getActuality, postActuality, createActuality } from "../controllers/actuality.controller.js";
import { searchActualities } from "../controllers/search.controller.js";
import { validateAndNormalizeActualitySearch } from "../middlewares/search.middleware.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("actualities"),
	createActuality,
);

router.get("/create-form", authMiddleware, authorizeMiddleware("ADMIN"), getActualityCreateForm);

router.post(
	"/:id/deletion-request",
	authMiddleware,
	authorizeMiddleware("SUPER_USER"),
	requestDeletionForEntity("ACTUALITY", "Actualite"),
);

router.get("/search", validateAndNormalizeActualitySearch, searchActualities);

router.get("/:id", getActuality);
router.post("/:id", authMiddleware, postActuality);

export default router;
