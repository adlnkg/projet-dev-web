import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getEvent, postEvent } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getEvent);
router.post("/:id", authMiddleware, postEvent);

export default router;
