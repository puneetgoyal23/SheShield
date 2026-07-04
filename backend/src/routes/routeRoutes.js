import express from "express";
import { handleAnalyzeRoutes } from "../controllers/routeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All route analysis calls require authentication
router.use(authMiddleware);

router.post("/analyze", handleAnalyzeRoutes);

export default router;
