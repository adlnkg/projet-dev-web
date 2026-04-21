import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import searchRoutes from "./search.routes.js";


const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/", searchRoutes);

export default router;
