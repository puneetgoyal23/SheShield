import Incident from "../models/Incident.js";

export const createIncidentReport = async (userId, { type, description, latitude, longitude, image, journeyId }) => {
  const newIncident = new Incident({
    type,
    description,
    latitude,
    longitude,
    image,
    journeyId,
    reporter: userId
  });
  return await newIncident.save();
};

export const getIncidentsProximity = async ({ latitude, longitude, maxDistance = 5000 }) => {
  return await Incident.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(maxDistance)
      }
    }
  }).populate("reporter", "name");
};

export const verifyIncident = async (userId, incidentId) => {
  const incident = await Incident.findById(incidentId);
  if (!incident) {
    const error = new Error("Incident not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check if user has already verified this incident
  if (incident.verifiedBy.includes(userId)) {
    const error = new Error("You have already verified this incident.");
    error.statusCode = 400;
    throw error;
  }

  incident.verifiedBy.push(userId);
  incident.verificationCount += 1;
  return await incident.save();
};
