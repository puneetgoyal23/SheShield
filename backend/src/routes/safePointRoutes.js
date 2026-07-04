import express from "express";
import { handleGetSafePoints, handleCreateSafePoint } from "../controllers/safePointController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Require authentication for safe point operations
router.use(authMiddleware);

router.get("/", handleGetSafePoints);
router.post("/", handleCreateSafePoint);

export default router;
