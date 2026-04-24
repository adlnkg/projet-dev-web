import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import deviceRoutes from "./device.routes.js";
import searchRoutes from "./search.routes.js";


const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/devices", deviceRoutes);

router.use("/search", searchRoutes);

export default router;
