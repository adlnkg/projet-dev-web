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
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";

const router = new express.Router();

// Routes publiques (accessible sans connexion)
router.get("/", optionalAuthMiddleware, getAllUsers);
router.get("/:id", optionalAuthMiddleware, getUser);

// Routes protégées (requièrent une connexion)
router.get("/me", authMiddleware, getMe);
router.get("/me/points/history", authMiddleware, getMyPointsHistory);
router.put("/:id", authMiddleware, updateUser);
router.patch("/:id/admin", authMiddleware, authorizeMiddleware(["ADMIN"]), adminUpdateUser);

export default router;
