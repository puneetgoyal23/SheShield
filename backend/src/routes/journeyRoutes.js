import express from "express";
import { handleStartJourney, handleUpdateLocation, handleEndJourney, handleGetJourneyHistory } from "../controllers/journeyController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Require authorization for all journey lifecycle events
router.use(authMiddleware);

router.post("/start", handleStartJourney);
router.post("/location", handleUpdateLocation);
router.post("/end", handleEndJourney);
router.get("/history", handleGetJourneyHistory);

export default router;
