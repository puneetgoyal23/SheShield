import { startJourney, updateLocation, completeJourney, getJourneyHistory } from "../services/journeyService.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleStartJourney = async (req, res, next) => {
  try {
    const { origin, destination, selectedRoute } = req.body;
    const io = req.app.get("io");
    const journey = await startJourney(req.user._id, { origin, destination, selectedRoute }, io);
    return successResponse(res, "Journey started successfully.", { journey }, 201);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const io = req.app.get("io");
    const result = await updateLocation(req.user._id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }, io);

    return successResponse(res, "Location updated successfully.", result, 200);
  } catch (error) {
    next(error);
  }
};

export const handleEndJourney = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const journey = await completeJourney(req.user._id, io);
    return successResponse(res, "Journey completed successfully.", { journey }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleGetJourneyHistory = async (req, res, next) => {
  try {
    const history = await getJourneyHistory(req.user._id);
    return successResponse(res, "Journey history retrieved successfully.", { history }, 200);
  } catch (error) {
    next(error);
  }
};
