/**
 * themeStore — manages the active colour theme.
 *
 * Persists to localStorage and applies [data-theme] on <html>
 * so every CSS var override in themes.css takes effect globally.
 *
 * Themes: 'pink' (default) | 'purple' | 'emerald'
 */
import { create } from 'zustand';

const STORAGE_KEY = 'she_theme';
const VALID_THEMES = new Set(['pink', 'purple', 'emerald']);
const DEFAULT_THEME = 'pink';

/** Read saved preference, fall back to default. */
const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

/** Write [data-theme] attribute to <html>. */
const applyTheme = (themeId) => {
  document.documentElement.setAttribute('data-theme', themeId);
};

const useThemeStore = create((set) => {
  // Apply saved theme immediately on module load (before first render)
  const initial = getSavedTheme();
  applyTheme(initial);

  return {
    theme: initial,

    setTheme: (themeId) => {
      if (!VALID_THEMES.has(themeId)) return;
      applyTheme(themeId);
      try { localStorage.setItem(STORAGE_KEY, themeId); } catch { /* ignore */ }
      set({ theme: themeId });
    },
  };
});

export default useThemeStore;
