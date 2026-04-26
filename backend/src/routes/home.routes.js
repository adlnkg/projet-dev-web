import express from "express";
import { getHomeFeed } from "../controllers/home.controller.js";

const router = express.Router();

router.get("/", getHomeFeed);

export default router;
