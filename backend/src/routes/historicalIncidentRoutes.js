import express from "express";
import {
  handleCreateHistoricalIncident,
  handleGetHistoricalIncidents,
  handleDeleteHistoricalIncident,
  handleBulkCreateHistoricalIncidents
} from "../controllers/historicalIncidentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All historical incident endpoints require authentication
router.use(authMiddleware);

// GET with optional proximity query params: ?latitude=&longitude=&radius=&severity=&category=
router.get("/", handleGetHistoricalIncidents);

// POST single historical incident (admin use)
router.post("/", handleCreateHistoricalIncident);

// POST bulk import array of historical incidents
router.post("/bulk", handleBulkCreateHistoricalIncidents);

// DELETE a specific record
router.delete("/:id", handleDeleteHistoricalIncident);

export default router;
