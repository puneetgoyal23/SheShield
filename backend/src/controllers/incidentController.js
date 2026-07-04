import { createIncidentReport, getIncidentsProximity, verifyIncident } from "../services/incidentService.js";
import { successResponse } from "../utils/responseFormatter.js";
import Incident from "../models/Incident.js";

export const handleCreateIncident = async (req, res, next) => {
  try {
    const { type, description, latitude, longitude, journeyId } = req.body;
    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const incident = await createIncidentReport(req.user._id, {
      type,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      image,
      journeyId
    });

    return successResponse(res, "Incident reported successfully.", { incident }, 201);
  } catch (error) {
    next(error);
  }
};

export const handleGetIncidents = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      // Fallback: return recent incidents if no location is specified
      const incidents = await Incident.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("reporter", "name");
      return successResponse(res, "Recent incidents retrieved successfully.", { incidents }, 200);
    }

    const incidents = await getIncidentsProximity({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: radius ? parseInt(radius) : 5000
    });

    return successResponse(res, "Nearby incidents retrieved successfully.", { incidents }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleVerifyIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const incident = await verifyIncident(userId, id);
    return successResponse(res, "Incident verified successfully.", { incident }, 200);
  } catch (error) {
    next(error);
  }
};
