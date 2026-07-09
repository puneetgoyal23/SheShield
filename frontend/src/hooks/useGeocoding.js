import { useState, useEffect, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const useGeocoding = () => {
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const coreLib = useMapsLibrary('core');
  
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  
  // We need PlacesService to get lat/lng from place_id without using Geocoder API calls directly if possible,
  // but geocoder is actually simpler and often cheaper/more robust for simple place_id to lat/lng.
  
  useEffect(() => {
    if (placesLib && !autocompleteService) {
      setAutocompleteService(new placesLib.AutocompleteService());
    }
  }, [placesLib, autocompleteService]);

  useEffect(() => {
    if (geocodingLib && !geocoder) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib, geocoder]);

  const searchPlaces = useCallback(async (query, userPosition) => {
    if (!query || !query.trim() || !autocompleteService || !geocoder) return [];
    
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'in' },
      };
      
      if (userPosition && userPosition.length === 2 && coreLib) {
        request.locationBias = new coreLib.Circle({
          center: { lat: userPosition[0], lng: userPosition[1] },
          radius: 25000,
        });
      }
      
      const response = await autocompleteService.getPlacePredictions(request);
      
      if (!response || !response.predictions) return [];

      const results = await Promise.all(response.predictions.map(async (prediction) => {
        try {
          const geoRes = await geocoder.geocode({ placeId: prediction.place_id });
          if (geoRes.results && geoRes.results.length > 0) {
            const loc = geoRes.results[0].geometry.location;
            return {
              id: prediction.place_id,
              name: prediction.structured_formatting.main_text,
              subtitle: prediction.structured_formatting.secondary_text,
              lat: loc.lat(),
              lng: loc.lng(),
              type: 'place'
            };
          }
        } catch (e) {
          console.warn("Geocoding failed for place_id", prediction.place_id, e);
        }
        return null;
      }));
      
      return results.filter(Boolean);
    } catch (error) {
      console.error('Places autocomplete error:', error);
      return [];
    }
  }, [autocompleteService, geocoder, coreLib]);

  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!geocoder) {
      return {
        name: 'Current Location',
        subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng
      };
    }
    
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        
        // Find a decent short name
        let name = 'Selected Location';
        const addressComponents = result.address_components;
        if (addressComponents.length > 0) {
          const route = addressComponents.find(c => c.types.includes('route'));
          const sublocality = addressComponents.find(c => c.types.includes('sublocality'));
          const locality = addressComponents.find(c => c.types.includes('locality'));
          const poi = addressComponents.find(c => c.types.includes('point_of_interest'));
          
          if (poi) name = poi.long_name;
          else if (route) name = route.long_name;
          else if (sublocality) name = sublocality.long_name;
          else if (locality) name = locality.long_name;
          else name = addressComponents[0].long_name;
        }

        return {
          name,
          subtitle: result.formatted_address,
          lat,
          lng
        };
      }
      throw new Error("No results found");
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        name: 'Current Location',
        subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng
      };
    }
  }, [geocoder]);

  return { searchPlaces, reverseGeocode, isReady: !!(autocompleteService && geocoder) };
};
