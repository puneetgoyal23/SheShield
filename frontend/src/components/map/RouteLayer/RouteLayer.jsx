import React, { useEffect } from 'react';
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
        console.error('RouteLayer: Routing failed for origin/destination.', { origin, destination, error: err.message });
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

  const getRouteColor = (route, isActive) => {
    if (!isActive) return '#9e9e9e'; // Gray for inactive
    if (route.type === 'safe') return '#00e5ff'; // Vibrant Cyan
    if (route.type === 'fast') return '#ff2d95'; // Vibrant Magenta
    return '#b388ff'; // Vibrant Purple fallback
  };

  if (!routes || routes.length === 0) return null;

  // Render inactive routes first (so they are below the active one), then active route
  return (
    <>
      {routes.map((route, index) => {
        if (index === activeRouteIndex) return null; // Skip active route for now
        
        return (
          <React.Fragment key={`inactive_group_${route.id}`}>
            {/* Inactive Route Outline (Shadow) */}
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: '#000000',
                weight: 9,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Inactive Route Inner */}
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: getRouteColor(route, false),
                weight: 5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </React.Fragment>
        );
      })}
      
      {/* Active Route */}
      {routes[activeRouteIndex] && (
        <React.Fragment key={`active_group_${routes[activeRouteIndex].id}`}>
          {/* Active Route Outline (Shadow) */}
          <Polyline
            positions={routes[activeRouteIndex].geometry}
            pathOptions={{
              color: '#000000',
              weight: 12, // Thicker outline
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              className: 'active-route-outline'
            }}
          />
          {/* Active Route Inner */}
          <Polyline
            positions={routes[activeRouteIndex].geometry}
            pathOptions={{
              color: getRouteColor(routes[activeRouteIndex], true),
              weight: 8, // Thicker 8px bright route
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
              className: 'active-route-path'
            }}
          />
        </React.Fragment>
      )}
    </>
  );
};

export default RouteLayer;
