import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import searchRoutes from "./search.route.js";


const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/search", searchRoutes);

export default router;
