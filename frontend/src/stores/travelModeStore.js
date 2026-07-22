/**
 * travelModeStore — holds the user's selected travel mode for the Navigation page.
 * Used to compute ETA multipliers without changing backend or route data.
 */
import { create } from 'zustand';

/* ──────────────────────────────────────────────
   ETA multipliers relative to walking (base = 1)
   Walking : 1.0  (base — what Google returns for WALKING)
   Bike    : 0.45 (≈40–50% of walking time)
   Car     : 0.30 (≈25–35% of walking time)
   ────────────────────────────────────────────── */
export const TRAVEL_MODES = {
  walk: { id: 'walk', label: 'Walk',  emoji: '🚶', multiplier: 1.00 },
  bike: { id: 'bike', label: 'Bike',  emoji: '🛵', multiplier: 0.45 },
  car:  { id: 'car',  label: 'Car',   emoji: '🚗', multiplier: 0.30 },
};

const useTravelModeStore = create((set, get) => ({
  mode: 'walk',                           // default: walking

  setMode: (id) => set({ mode: id }),

  /** Returns the duration multiplier for the currently selected mode. */
  getMultiplier: () => TRAVEL_MODES[get().mode]?.multiplier ?? 1,
}));

export default useTravelModeStore;
