import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import createImageUploadMiddleware from "../middlewares/upload.middleware.js";
import { getActuality, postActuality, createActuality } from "../controllers/actuality.controller.js";

const router = express.Router();

router.post(
	"/",
	authMiddleware,
	authorizeMiddleware("ADMIN"),
	...createImageUploadMiddleware("actualities"),
	createActuality,
);

router.get("/:id", authMiddleware, getActuality);
router.post("/:id", authMiddleware, postActuality);

export default router;
