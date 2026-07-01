import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import useRouteStore from '../../../stores/routeStore';
import { routingApi } from '../../../services/api/routingApi';
import './RouteLayer.css';

const RouteLayer = () => {
  const map = useMap();
  const origin = useRouteStore((s) => s.origin);
  const destination = useRouteStore((s) => s.destination);
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  
  const setRoutes = useRouteStore((s) => s.setRoutes);
  const setLoading = useRouteStore((s) => s.setLoading);
  const setError = useRouteStore((s) => s.setError);

  // Fetch routes when origin and destination change
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!origin || !destination) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedRoutes = await routingApi.getSafeRoutes(origin, destination);
        setRoutes(fetchedRoutes);
      } catch (err) {
        setError(err.message || 'Failed to find route');
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, [origin, destination, setRoutes, setLoading, setError]);

  // Fit map bounds to active route
  useEffect(() => {
    if (routes.length > 0 && activeRouteIndex >= 0 && activeRouteIndex < routes.length) {
      const activeRoute = routes[activeRouteIndex];
      if (activeRoute.geometry && activeRoute.geometry.length > 0) {
        const bounds = L.latLngBounds(activeRoute.geometry);
        // Add padding to account for floating UI elements
        map.flyToBounds(bounds, {
          paddingTopLeft: [20, 100], // Space for SearchBar
          paddingBottomRight: [20, 300], // Space for BottomSheet and controls
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [routes, activeRouteIndex, map]);

  if (!routes || routes.length === 0) return null;

  // Render inactive routes first (so they are below the active one), then active route
  return (
    <>
      {routes.map((route, index) => {
        if (index === activeRouteIndex) return null; // Skip active route for now
        
        return (
          <Polyline
            key={route.id}
            positions={route.geometry}
            pathOptions={{
              color: '#808080',
              weight: 5,
              opacity: 0.6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        );
      })}
      
      {/* Active Route */}
      {routes[activeRouteIndex] && (
        <Polyline
          key={routes[activeRouteIndex].id + '_active'}
          positions={routes[activeRouteIndex].geometry}
          pathOptions={{
            color: 'var(--color-primary)', // Pink/Magenta primary
            weight: 7,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'active-route-path'
          }}
        />
      )}
    </>
  );
};

export default RouteLayer;
