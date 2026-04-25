import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import deviceRoutes from "./device.routes.js";
import areaRoutes from "./area.routes.js";
import eventRoutes from "./event.routes.js";
import actualityRoutes from "./actuality.routes.js";
import searchRoutes from "./search.routes.js";


const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/devices", deviceRoutes);

router.use("/areas", areaRoutes);

router.use("/events", eventRoutes);

router.use("/actualities", actualityRoutes);

router.use("/search", searchRoutes);

export default router;
