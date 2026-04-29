import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getAreaCreateForm, getArea, postArea, createArea } from "../controllers/area.controller.js";
import { requestDeletionForEntity } from "../controllers/deletion-request.controller.js";
import { searchAreas } from "../controllers/search.controller.js";
import { validateAndNormalizeAreaSearch } from "../middlewares/search.middleware.js";

const router = express.Router();

router.get("/search", validateAndNormalizeAreaSearch, searchAreas);


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

router.get("/:id", optionalAuthMiddleware, getArea);
router.post("/:id", authMiddleware, postArea);

export default router;
