/**
 * mapStore — Owns the Leaflet map instance and camera state.
 *
 * Why store mapInstance in Zustand:
 * Allows any component (e.g., SOS button → "fly to safe point")
 * to trigger map movements without prop drilling.
 */
import { create } from 'zustand';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FLY_DURATION_SECONDS } from '../constants/mapConstants';

const useMapStore = create((set, get) => ({
  /* ── State ── */
  center:      DEFAULT_CENTER,
  zoom:        DEFAULT_ZOOM,
  mapInstance: null,
  isMapReady:  false,
  mapTypeId:   'roadmap',

  /* ── Actions ── */
  setCenter: (center) => set({ center }),
  setZoom:   (zoom)   => set({ zoom }),
  toggleMapType: () => set((s) => ({ mapTypeId: s.mapTypeId === 'roadmap' ? 'satellite' : 'roadmap' })),

  setMapInstance: (instance) =>
    set({ mapInstance: instance, isMapReady: !!instance }),

  /** Smooth animated pan to a latlng position */
  flyTo: (latlng, zoom) => {
    const { mapInstance } = get();
    if (!mapInstance) return;
    
    // Convert Leaflet arrays [lat, lng] to Google's {lat, lng} if necessary
    const target = Array.isArray(latlng) 
      ? { lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1]) } 
      : latlng;
      
    mapInstance.panTo(target);
    mapInstance.setZoom(zoom ?? DEFAULT_ZOOM);
  },

  /** Instant pan without zoom change */
  panTo: (latlng) => {
    const { mapInstance } = get();
    if (!mapInstance) return;
    
    const target = Array.isArray(latlng) 
      ? { lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1]) } 
      : latlng;
      
    mapInstance.panTo(target);
  },
}));

export default useMapStore;
