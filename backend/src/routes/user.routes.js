import {
  getMe,
  getMyPointsHistory,
  getUser,
  updateUser,
  getAllUsers,
  adminUpdateUser,
} from "../controllers/user.controller.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = new express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/me/points/history", authMiddleware, getMyPointsHistory);
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUser);
router.put("/:id", authMiddleware, updateUser);
router.patch("/:id/admin", authMiddleware, adminUpdateUser);

export default router;
