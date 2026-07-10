/**
 * UserLocationPin — Animated current-location marker for Google Maps.
 *
 * Uses AdvancedMarker with custom HTML and CSS animations.
 */
import { AdvancedMarker } from '@vis.gl/react-google-maps';

const UserLocationPin = ({ position }) => {
  if (!position) return null;

  return (
    <AdvancedMarker
      position={{ lat: position[0], lng: position[1] }}
      zIndex={500}
    >
      <div className="user-location-wrapper">
        <div className="user-location-ripple"></div>
        <div className="user-location-ripple"></div>
        <div className="user-location-dot"></div>
      </div>
    </AdvancedMarker>
  );
};

export default UserLocationPin;
