import { useEffect, useRef } from 'react';
import { haversineDistance } from '../utils/geoUtils';
import useNavigationStore from '../stores/navigationStore';
import useRouteStore from '../stores/routeStore';
import useUiStore from '../stores/uiStore';
import axiosInstance from '../services/api/axiosInstance';
import { APP_MODES } from '../constants/appConstants';

const useJourneyTracker = () => {
  const appMode = useUiStore((s) => s.appMode);
  const activeJourneyId = useNavigationStore((s) => s.activeJourneyId);
  const userPosition = useNavigationStore((s) => s.userPosition);
  
  const setDeviationAlert = useNavigationStore((s) => s.setDeviationAlert);
  const setIsDestinationReached = useNavigationStore((s) => s.setIsDestinationReached);
  const updateETA = useNavigationStore((s) => s.updateETA);

  const destination = useRouteStore((s) => s.destination);

  const lastPingRef = useRef(0);

  useEffect(() => {
    // Only track if we are actively navigating
    if (appMode !== APP_MODES.NAVIGATING || !activeJourneyId || !userPosition || !destination) {
      return;
    }

    const checkProgress = async () => {
      // 1. Calculate straight-line distance to destination
      
      let destLatLng;
      if (destination.coordinates) {
        // [lat, lng] format for destination coordinates
        destLatLng = [destination.coordinates[0], destination.coordinates[1]];
      } else if (destination.lat && destination.lng) {
        destLatLng = [destination.lat, destination.lng];
      }
      
      if (destLatLng) {
        const distanceToDest = Math.round(haversineDistance(userPosition, destLatLng));
        // Approximate time remaining at ~1.4 m/s (walking speed)
        const timeRemainingSecs = Math.round(distanceToDest / 1.4);
        
        updateETA(distanceToDest, timeRemainingSecs);

        if (distanceToDest <= 20) {
          setIsDestinationReached(true);
        } else {
          setIsDestinationReached(false);
        }
      }

      // 2. Ping backend for deviation detection (throttle to max once every 10 seconds)
      const now = Date.now();
      if (now - lastPingRef.current > 10000) {
        lastPingRef.current = now;
        try {
          const res = await axiosInstance.post('/journey/location', {
            latitude: userPosition[0],
            longitude: userPosition[1]
          });
          
          if (res.data?.data?.deviationAlert) {
            setDeviationAlert(res.data.data.deviationAlert);
          } else if (res.data?.deviationAlert) {
            setDeviationAlert(res.data.deviationAlert);
          } else {
            setDeviationAlert(null); // Clear alert if on route
          }
        } catch (err) {
          console.error("Failed to update journey location:", err);
        }
      }
    };

    checkProgress();

  }, [
    userPosition,
    appMode,
    activeJourneyId,
    destination,
    setDeviationAlert,
    setIsDestinationReached,
    updateETA
  ]);
};

export default useJourneyTracker;
