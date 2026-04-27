import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
import {
  getDeletionRequests,
  reviewDeletionRequestController,
} from "../controllers/deletion-request.controller.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeMiddleware("ADMIN"), getDeletionRequests);
router.patch("/:id", authMiddleware, authorizeMiddleware("ADMIN"), reviewDeletionRequestController);

export default router;
