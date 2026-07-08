import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Shield, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import useSafetyStore from '../../../stores/safetyStore';
import useRouteStore from '../../../stores/routeStore';
import useNavigationStore from '../../../stores/navigationStore';
import useUiStore from '../../../stores/uiStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import './SafePointsLayer.css';

// SVG Icons for different safe points
const icons = {
  police: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  metro: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M9 16v-6l3 3 3-3v6"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/><path d="M16 22H8"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
};

const createCustomIcon = (type) => {
  const svgString = icons[type] || icons.default;
  return L.divIcon({
    html: `<div class="safe-point-marker marker-${type}">${svgString}</div>`,
    className: 'custom-safe-point-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Bypass Leaflet's aggressive stopPropagation by binding native DOM events directly to the button
const NativeButton = ({ onClick, children, className }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handler = (e) => {
      e.stopPropagation();
      e.preventDefault();
      onClick(e);
    };
    
    // Bind touchstart and mousedown to immediately catch the interaction before Leaflet suppresses it
    el.addEventListener('mousedown', handler);
    el.addEventListener('touchstart', handler, { passive: false });
    
    return () => {
      el.removeEventListener('mousedown', handler);
      el.removeEventListener('touchstart', handler);
    };
  }, [onClick]);
  
  return (
    <button ref={ref} className={className} type="button">
      {children}
    </button>
  );
};

const SafePointsLayer = () => {
  const map = useMap();
  const safePoints = useSafetyStore((s) => s.safePoints);
  const isSafePointsVisible = useSafetyStore((s) => s.isSafePointsVisible);
  const activeFilter = useSafetyStore((s) => s.activeFilter);

  const setDestination = useRouteStore((s) => s.setDestination);
  const setOrigin = useRouteStore((s) => s.setOrigin);
  const userPosition = useNavigationStore((s) => s.userPosition);
  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);

  const filteredPoints = useMemo(() => {
    if (!activeFilter) return safePoints;
    return safePoints.filter(p => p.type === activeFilter);
  }, [safePoints, activeFilter]);

  const handleNavigate = useCallback((point) => {
    map.closePopup();

    // 1. Verify user position exists to set origin
    if (!userPosition || userPosition.length !== 2) {
      console.error('Routing cannot start: Valid userPosition is missing from navigationStore.', userPosition);
      return;
    }

    // 2. Verify latitude and longitude are valid finite numbers
    const destLat = parseFloat(point.lat);
    const destLng = parseFloat(point.lng);

    if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) {
      console.error('Routing cannot start: Safe Point coordinates are not valid finite numbers.', point);
      return;
    }

    // Set origin to current user position
    setOrigin({
      lat: userPosition[0],
      lng: userPosition[1],
      name: 'My Location'
    });

    // 3. Normalize every Safe Point into exactly the same destination structure used by destination search
    setDestination({
      id: String(point.id),
      name: String(point.name || 'Safe Point'),
      subtitle: String(point.address || point.subtitle || 'Safe Point Location'),
      lat: destLat,
      lng: destLng,
      type: point.type || 'place'
    });

    setAppMode(APP_MODES.PLANNING);
    setBottomSheet(SHEET_STATES.HALF);
  }, [map, userPosition, setOrigin, setDestination, setAppMode, setBottomSheet]);

  // Auto-adjust map bounds when points are filtered
  useEffect(() => {
    if (isSafePointsVisible && filteredPoints.length > 0 && userPosition) {
      const bounds = L.latLngBounds([userPosition]);
      filteredPoints.forEach(p => bounds.extend([p.lat, p.lng]));
      
      // Ensure the bounds aren't a single point (if no safe points found somehow)
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true
        });
      }
    }
  }, [isSafePointsVisible, filteredPoints, userPosition, map]);

  if (!isSafePointsVisible || !filteredPoints || filteredPoints.length === 0) return null;

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={40}
      showCoverageOnHover={false}
      spiderfyOnMaxZoom={true}
    >
      {filteredPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createCustomIcon(point.type)}
          eventHandlers={{
            popupopen: (e) => {
              // Record exactly when the popup was opened natively by Leaflet
              e.popup._lastOpenTime = Date.now();
              
              // Hide bottom sheet when a Safe Point popup is active
              const currentSheetState = useUiStore.getState().bottomSheetState;
              if (currentSheetState !== SHEET_STATES.HIDDEN) {
                setBottomSheet(SHEET_STATES.HIDDEN);
              }
            },
            click: (e) => {
              const marker = e.target;
              const popup = marker.getPopup();
              if (popup && popup.isOpen()) {
                const wasJustOpened = (Date.now() - (popup._lastOpenTime || 0)) < 200;
                if (!wasJustOpened) {
                  marker.closePopup();
                }
              }
            }
          }}
        >
          <Popup 
            className="safe-point-popup"
            autoPanPadding={[50, 50]}
            closeButton={true}
          >
            <div className="safe-point-popup-content">
              <h3>{point.name}</h3>
              <div className="sp-header-row">
                <p className="sp-type">{point.type.replace('_', ' ').toUpperCase()}</p>
                {point.isOpen24h && <span className="sp-badge-24h">24/7 Open</span>}
              </div>
              <p className="sp-distance">{point.distance}m away</p>
              {point.address && <p className="sp-address">{point.address}</p>}

              <NativeButton
                className="sp-navigate-btn"
                onClick={() => handleNavigate(point)}
              >
                <Navigation size={14} />
                Start Navigation
              </NativeButton>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

export default SafePointsLayer;
