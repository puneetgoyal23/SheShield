import SafePoint from "../models/SafePoint.js";


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

  // Google Places API is disabled due to missing billing/quota to prevent REQUEST_DENIED spam.
  // We only rely on local database safe points for now.

  return localResults;
};

export const createLocalSafePoint = async (safePointData) => {
  const newSafePoint = new SafePoint(safePointData);
  return await newSafePoint.save();
};
