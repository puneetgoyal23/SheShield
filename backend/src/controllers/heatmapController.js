import Incident from "../models/Incident.js";
import HistoricalIncident from "../models/HistoricalIncident.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleGetHeatmapData = async (req, res, next) => {
  try {
    // 1. Fetch both active community reports and crime history records
    const [incidents, crimes] = await Promise.all([
      Incident.find(),
      HistoricalIncident.find()
    ]);

    // 2. Determine night hour status
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 22 || currentHour < 5;

    // 3. Format incident reports
    const incidentPoints = incidents.map(report => {
      let weight = 0;
      let riskLevel = "Green";

      if (report.type === "Police Patrol") {
        weight = 1;
        riskLevel = "Green";
      } else {
        if (report.verificationCount >= 3) {
          weight = isNight ? 5 : 4;
          riskLevel = isNight ? "Red" : "Orange";
        } else if (report.verificationCount >= 1) {
          weight = isNight ? 4 : 3;
          riskLevel = isNight ? "Orange" : "Yellow";
        } else {
          weight = isNight ? 3 : 2;
          riskLevel = isNight ? "Orange" : "Yellow";
        }
      }

      return {
        id: report._id,
        latitude: report.latitude,
        longitude: report.longitude,
        weight,
        riskLevel,
        type: "Community Report",
        category: report.type,
        description: report.description
      };
    });

    // 4. Format historical crimes
    const crimePoints = crimes.map(crime => {
      let weight = 0;
      let riskLevel = "Green";

      if (crime.severity === "High") {
        weight = 5;
        riskLevel = "Red";
      } else if (crime.severity === "Medium") {
        weight = isNight ? 5 : 4;
        riskLevel = isNight ? "Red" : "Orange";
      } else {
        weight = isNight ? 3 : 2;
        riskLevel = isNight ? "Orange" : "Yellow";
      }

      return {
        id: crime._id,
        latitude: crime.latitude,
        longitude: crime.longitude,
        weight,
        riskLevel,
        type: "Historical Crime",
        category: crime.category,
        description: `${crime.category} (${crime.year})`
      };
    });

    // 5. Combine points
    const heatmapPoints = [...incidentPoints, ...crimePoints];

    return successResponse(res, "Heatmap coordinate points retrieved successfully.", {
      points: heatmapPoints,
      isNightActive: isNight
    }, 200);
  } catch (error) {
    next(error);
  }
};
