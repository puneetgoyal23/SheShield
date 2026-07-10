import { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import useMapStore        from '../../../stores/mapStore';
import useNavigationStore from '../../../stores/navigationStore';
import { DEFAULT_CENTER, DEFAULT_ZOOM, NAVIGATION_ZOOM } from '../../../constants/mapConstants';
import UserLocationPin from '../UserLocationPin/UserLocationPin';
import RouteLayer from '../RouteLayer/RouteLayer';
import HeatmapLayer from '../HeatmapLayer/HeatmapLayer';
import SafePointsLayer from '../SafePointsLayer/SafePointsLayer';
import CommunityIncidentsLayer from '../CommunityIncidentsLayer/CommunityIncidentsLayer';
import './MapContainer.css';

/* ── Inner: registers the map instance in Zustand ── */
const MapController = () => {
  const map            = useMap();
  const setMapInstance = useMapStore((s) => s.setMapInstance);
  const userPosition   = useNavigationStore((s) => s.userPosition);

  /* Register map instance on mount */
  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);

  const hasCentered = useRef(false);

  /* Fly to user position once on first resolve */
  useEffect(() => {
    if (userPosition && !hasCentered.current && map) {
      map.panTo({ lat: userPosition[0], lng: userPosition[1] });
      map.setZoom(NAVIGATION_ZOOM);
      hasCentered.current = true;
    }
  }, [userPosition, map]);

  return null;
};

/* ── Outer: the Google Maps shell ── */
const MapContainer = () => {
  const userPosition = useNavigationStore((s) => s.userPosition);
  const mapTypeId = useMapStore((s) => s.mapTypeId);

  return (
    <div className="she-map-container">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        disableDefaultUI={true}
        zoomControl={false}
        mapId="SHESHIELD_DARK_MAP"
        mapTypeId={mapTypeId}
        style={{ width: '100%', height: '100%' }}
        className="she-map-canvas"
        colorScheme="DARK"
      >
        <MapController />

        <HeatmapLayer />
        
        <RouteLayer />
        
        <SafePointsLayer />

        <CommunityIncidentsLayer />


        <UserLocationPin position={userPosition} />
      </Map>
    </div>
  );
};

export default MapContainer;
