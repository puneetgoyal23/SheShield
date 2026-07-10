import { Map, MapPin } from 'lucide-react';
import useSafetyStore from '../../../stores/safetyStore';
import useMapStore from '../../../stores/mapStore';
import useUiStore from '../../../stores/uiStore';
import './MapLayerControls.css';

const MapLayerControls = () => {
  const mapTypeId = useMapStore((s) => s.mapTypeId);
  const toggleMapType = useMapStore((s) => s.toggleMapType);
  const isSafePointsVisible = useSafetyStore((s) => s.isSafePointsVisible);
  const toggleSafePoints = useSafetyStore((s) => s.toggleSafePoints);

  const safePoints = useSafetyStore((s) => s.safePoints);
  const pushToast = useUiStore((s) => s.pushToast);

  const handleToggleMapType = (e) => {
    e.stopPropagation();
    toggleMapType();
  };

  const handleToggleSafePoints = (e) => {
    e.stopPropagation();
    toggleSafePoints();
    
    // Give visual feedback if the user turns it on but there is no data in the database
    if (!isSafePointsVisible && safePoints.length === 0) {
      pushToast({
        type: 'info',
        message: 'No safe places found nearby in the database.'
      });
    }
  };

  return (
    <div className="map-layer-controls">
      <button 
        className={`layer-control-btn ${mapTypeId === 'satellite' ? 'active' : ''}`}
        onClick={handleToggleMapType}
        aria-label={mapTypeId === 'satellite' ? "Switch to Map View" : "Switch to Satellite View"}
        title={mapTypeId === 'satellite' ? "Switch to Map View" : "Switch to Satellite View"}
      >
        <Map size={20} />
      </button>
      <div className="layer-control-divider" />
      <button 
        className={`layer-control-btn ${isSafePointsVisible ? 'active' : ''}`}
        onClick={handleToggleSafePoints}
        aria-label="Toggle Safe Places"
        title="Toggle Safe Places"
      >
        <MapPin size={20} />
      </button>
    </div>
  );
};

export default MapLayerControls;
