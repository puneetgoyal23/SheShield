import express from "express";
import { handleGetHeatmapData } from "../controllers/heatmapController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All heatmap retrievals require authentication
router.use(authMiddleware);

router.get("/", handleGetHeatmapData);

export default router;
