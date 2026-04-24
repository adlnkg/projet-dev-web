import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getArea, postArea } from "../controllers/area.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getArea);
router.post("/:id", authMiddleware, postArea);

export default router;
