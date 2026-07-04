import SafePoint from "../models/SafePoint.js";
import { getNearbyPlacesFromGoogle } from "./googleMapsService.js";

const MINIMUM_LOCAL_RESULTS = 3; // If fewer than this, also fetch from Google Places

export const getLocalSafePoints = async ({ latitude, longitude, radius = 5000, category }) => {
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

  if (category) {
    query.category = category;
  }

  const localResults = await SafePoint.find(query);

  // If local DB has insufficient results, enrich with Google Places API
  if (localResults.length < MINIMUM_LOCAL_RESULTS && process.env.GOOGLE_MAPS_API_KEY) {
    const googleCategory = category || "Police Station";
    const googleResults = await getNearbyPlacesFromGoogle(latitude, longitude, googleCategory, radius);

    // Cache Google results locally to speed up future queries
    const cachePromises = googleResults.map(async (place) => {
      const exists = await SafePoint.findOne({ googlePlaceId: place.place_id });
      if (!exists && place.place_id && !place.place_id.startsWith("mock_")) {
        try {
          const sp = new SafePoint({
            name: place.name,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            category: googleCategory,
            googlePlaceId: place.place_id,
            openStatus: place.business_status === "OPERATIONAL" ? "Open" : "Unknown"
          });
          await sp.save();
        } catch (_) {
          // Ignore duplicate key errors silently
        }
      }
    });
    await Promise.allSettled(cachePromises);

    // Re-query after caching to return a unified fresh result
    return await SafePoint.find(query);
  }

  return localResults;
};

export const createLocalSafePoint = async (safePointData) => {
  const newSafePoint = new SafePoint(safePointData);
  return await newSafePoint.save();
};
