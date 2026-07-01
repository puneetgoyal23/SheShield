import axiosInstance from './axiosInstance';

export const geocodingApi = {
  /**
   * Geocode / autocomplete search using Nominatim.
   * @param {string} query 
   * @param {Array<number>} [userPosition] - [lat, lng]
   */
  searchPlaces: async (query, userPosition) => {
    if (!query.trim()) return [];
    
    try {
      let baseUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
      
      let results = [];
      
      // If user position is available, try a bounded search first (approx 25km radius)
      if (userPosition && userPosition.length === 2) {
        const [lat, lng] = userPosition;
        // Bounding box: left, top, right, bottom (lon1, lat1, lon2, lat2)
        const offset = 0.25; 
        const viewbox = `${lng - offset},${lat + offset},${lng + offset},${lat - offset}`;
        
        const boundedUrl = `${baseUrl}&viewbox=${viewbox}&bounded=1`;
        const boundedResponse = await fetch(boundedUrl);
        
        if (boundedResponse.ok) {
          results = await boundedResponse.json();
        }
      }
      
      // If no results from bounded search (or user position not available), perform global/soft-biased search
      if (results.length === 0) {
        // If we have user position, we can still provide viewbox for soft bias (bounded=0 is default)
        if (userPosition && userPosition.length === 2) {
          const [lat, lng] = userPosition;
          const offset = 0.25;
          const viewbox = `${lng - offset},${lat + offset},${lng + offset},${lat - offset}`;
          baseUrl = `${baseUrl}&viewbox=${viewbox}`;
        }
        
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error('Failed to fetch from Nominatim');
        results = await response.json();
      }
      
      return results.map((item) => ({
        id: item.place_id.toString(),
        name: item.name || item.display_name.split(',')[0],
        subtitle: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'place'
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  },

  /**
   * Reverse geocode a coordinate to a place name.
   */
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (!response.ok) throw new Error('Failed reverse geocoding');
      
      const data = await response.json();
      
      return {
        name: data.name || data.display_name.split(',')[0],
        subtitle: data.display_name,
        lat,
        lng
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        name: 'Current Location',
        subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng
      };
    }
  }
};
