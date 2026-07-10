/**
 * routeStore — Owns the route planning state.
 * Origin, destination, fetched routes, and active selection.
 */
import { create } from 'zustand';

const useRouteStore = create((set) => ({
  /* ── State ── */
  origin:           null,   /* { name, lat, lng } */
  destination:      null,   /* { name, lat, lng } */
  routes:           [],     /* RouteOption[]       */
  activeRouteIndex: 0,
  activeRoute:      null,   /* Persistent source of truth for navigation */
  isLoading:        false,
  error:            null,

  /* ── Actions ── */
  setOrigin:      (origin)      => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setRoutes:      (routes)      => set({ routes, activeRouteIndex: 0, isLoading: false, error: null }),
  setActiveRouteIndex: (index)  => set({ activeRouteIndex: index }),
  setActiveRoute: (route)       => set({ activeRoute: route }),
  setLoading:     (isLoading)   => set({ isLoading }),
  setError:       (error)       => set({ error, isLoading: false }),

  clearRoute: () =>
    set({
      origin: null,
      destination: null,
      routes: [],
      activeRouteIndex: 0,
      activeRoute: null,
      isLoading: false,
      error: null,
    }),
}));

export default useRouteStore;
