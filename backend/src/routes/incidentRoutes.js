import express from "express";
import { handleCreateIncident, handleGetIncidents, handleVerifyIncident } from "../controllers/incidentController.js";
import { incidentReportValidator } from "../validators/incidentValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Require authentication for all incident operations
router.use(authMiddleware);

// Note: upload.single("image") MUST come before incidentReportValidator so Multer populates req.body
router.post("/", upload.single("image"), incidentReportValidator, handleCreateIncident);
router.get("/", handleGetIncidents);
router.patch("/:id/verify", handleVerifyIncident);

export default router;
