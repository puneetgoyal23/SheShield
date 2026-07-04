import { getLocalSafePoints, createLocalSafePoint } from "../services/safePointService.js";
import { successResponse } from "../utils/responseFormatter.js";
import SafePoint from "../models/SafePoint.js";

export const handleGetSafePoints = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, category } = req.query;

    if (!latitude || !longitude) {
      // Fallback: return recent or all local safe points
      const safePoints = await SafePoint.find().limit(100);
      return successResponse(res, "Safe points retrieved successfully.", { safePoints }, 200);
    }

    const safePoints = await getLocalSafePoints({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius ? parseInt(radius) : 5000,
      category
    });

    return successResponse(res, "Safe points retrieved successfully.", { safePoints }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleCreateSafePoint = async (req, res, next) => {
  try {
    const { name, latitude, longitude, category, openStatus, googlePlaceId } = req.body;
    
    const safePoint = await createLocalSafePoint({
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category,
      openStatus,
      googlePlaceId
    });

    return successResponse(res, "Safe point created successfully.", { safePoint }, 201);
  } catch (error) {
    next(error);
  }
};
