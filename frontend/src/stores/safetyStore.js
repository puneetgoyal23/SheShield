/**
 * safetyStore — Heat map data, safe points, and time-of-day safety state.
 */
import { create } from 'zustand';
import { getTimeSlot } from '../utils/timeOfDay';

const useSafetyStore = create((set) => ({
  /* ── State ── */
  heatMapData:          [],    /* [lat, lng, intensity][] */
  safePoints:           [],    /* SafePoint[]             */
  activeFilter:         null,  /* SAFE_POINT_TYPES key | null */
  timeSlot:             getTimeSlot(),
  lastHeatMapUpdate:    null,
  isLoadingHeatMap:     false,
  isLoadingSafePoints:  false,
  safePointsError:      null,
  isHeatmapVisible:     true,
  isSafePointsVisible:  true,

  /* ── Heat Map ── */
  setHeatMapData: (data) =>
    set({ heatMapData: data, lastHeatMapUpdate: Date.now(), isLoadingHeatMap: false }),
  setLoadingHeatMap: (v) => set({ isLoadingHeatMap: v }),

  /* ── Safe Points ── */
  setSafePoints:       (points) => set({ safePoints: points, isLoadingSafePoints: false, safePointsError: null }),
  setLoadingSafePoints:(v)      => set({ isLoadingSafePoints: v, safePointsError: v ? null : undefined }), // Reset error on load start
  setSafePointsError:  (err)    => set({ safePointsError: err, isLoadingSafePoints: false }),

  /* ── Layer Toggles ── */
  toggleHeatmap: () => set((s) => ({ isHeatmapVisible: !s.isHeatmapVisible })),
  toggleSafePoints: () => set((s) => ({ isSafePointsVisible: !s.isSafePointsVisible })),
  setSafePointsVisible: (v) => set({ isSafePointsVisible: v }),

  /* ── Filter ── */
  setFilter: (filter) => set({ activeFilter: filter }),
  clearFilter:()      => set({ activeFilter: null }),

  /* ── Time Slot (auto-refreshes on call) ── */
  refreshTimeSlot: () => set({ timeSlot: getTimeSlot() }),
}));

export default useSafetyStore;
