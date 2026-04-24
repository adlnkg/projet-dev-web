import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getDevice, postDevice } from "../controllers/device.controller.js";

const router = express.Router();

router.get("/:id", getDevice);  //TODO Apply authentication middleware to the get device route
router.post("/:id", postDevice);

export default router;
