import HistoricalIncident from "../models/HistoricalIncident.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleCreateHistoricalIncident = async (req, res, next) => {
  try {
    const { latitude, longitude, category, severity, year, source } = req.body;
    const incident = new HistoricalIncident({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category,
      severity,
      year: parseInt(year),
      source
    });
    await incident.save();
    return successResponse(res, "Historical incident added successfully.", { incident }, 201);
  } catch (error) {
    next(error);
  }
};

export const handleGetHistoricalIncidents = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000, severity, category } = req.query;

    if (latitude && longitude) {
      const query = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(radius)
          }
        }
      };
      if (severity) query.severity = severity;
      if (category) query.category = category;
      const incidents = await HistoricalIncident.find(query);
      return successResponse(res, "Historical incidents retrieved.", { incidents }, 200);
    }

    // No location — return paginated list
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = {};
    if (severity) filter.severity = severity;
    if (category) filter.category = category;

    const incidents = await HistoricalIncident.find(filter)
      .sort({ year: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await HistoricalIncident.countDocuments(filter);

    return successResponse(res, "Historical incidents retrieved.", { incidents, total, page, limit }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleDeleteHistoricalIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await HistoricalIncident.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error("Historical incident not found.");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Historical incident deleted.", { incident: deleted }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleBulkCreateHistoricalIncidents = async (req, res, next) => {
  try {
    const { incidents } = req.body;
    if (!Array.isArray(incidents) || incidents.length === 0) {
      const error = new Error("incidents must be a non-empty array.");
      error.statusCode = 400;
      throw error;
    }
    const docs = incidents.map(i => ({
      latitude: parseFloat(i.latitude),
      longitude: parseFloat(i.longitude),
      category: i.category,
      severity: i.severity,
      year: parseInt(i.year),
      source: i.source || "Imported"
    }));
    const result = await HistoricalIncident.insertMany(docs, { ordered: false });
    return successResponse(res, `${result.length} historical incidents imported.`, { count: result.length }, 201);
  } catch (error) {
    next(error);
  }
};
