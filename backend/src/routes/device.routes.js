import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getDevice, postDevice } from "../controllers/device.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getDevice);
router.post("/:id", authMiddleware, postDevice);

export default router;
