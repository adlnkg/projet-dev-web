import express from "express";
import { searchDevices } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", searchDevices);

export default router;
