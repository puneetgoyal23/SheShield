import { useState, useEffect, useRef } from 'react';
import { Search, X, Crosshair } from 'lucide-react';
import useUiStore from '../../../stores/uiStore';
import useRouteStore from '../../../stores/routeStore';
import useNavigationStore from '../../../stores/navigationStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import { useDebounce } from '../../../hooks/useDebounce';
import { geocodingApi } from '../../../services/api/geocodingApi';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './SearchBar.css';

const SearchBar = () => {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);
  const appMode = useUiStore((s) => s.appMode);
  const setDestination = useRouteStore((s) => s.setDestination);
  const setOrigin = useRouteStore((s) => s.setOrigin);
  const userPosition = useNavigationStore((s) => s.userPosition);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      const results = await geocodingApi.searchPlaces(debouncedQuery, userPosition);
      setSuggestions(results);
      setIsLoading(false);
      setActiveIndex(-1);
    };
    
    // Only search if we are in searching mode (not planning)
    if (appMode !== APP_MODES.PLANNING) {
      fetchSuggestions();
    }
  }, [debouncedQuery, appMode, userPosition]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setFocused(true);
    if (appMode !== APP_MODES.PLANNING) {
      setAppMode(APP_MODES.SEARCHING);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setAppMode(APP_MODES.IDLE);
    setBottomSheet(SHEET_STATES.PEEK);
    useRouteStore.getState().clearRoute();
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setFocused(false);
    
    // Set origin to current user position
    if (userPosition) {
      setOrigin({
        lat: userPosition[0],
        lng: userPosition[1],
        name: 'My Location'
      });
    }

    setDestination(item);
    setAppMode(APP_MODES.PLANNING);
    setBottomSheet(SHEET_STATES.HALF);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  const showDropdown = focused && (suggestions.length > 0 || isLoading);

  return (
    <div className="search-bar-container" ref={wrapperRef} style={{ position: 'relative' }}>
      <div className={`search-bar-wrapper ${focused ? 'focused' : ''}`}>
        {/* ── Search Icon ── */}
        <span className="search-icon" aria-hidden="true">
          <Search size={18} strokeWidth={2.2} />
        </span>

        {/* ── Input ── */}
        <input
          id="she-search-input"
          type="text"
          className="search-input"
          placeholder="Where do you want to go?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (appMode === APP_MODES.PLANNING) setAppMode(APP_MODES.SEARCHING);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search destination"
        />

        {/* ── Clear Button (visible when query exists) ── */}
        {query && (
          <button
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={0}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        )}

        {/* ── Divider ── */}
        <span className="search-divider" aria-hidden="true" />

        {/* ── Locate Button ── */}
        <button
          className="search-locate-btn"
          aria-label="Use my location"
          tabIndex={0}
        >
          <Crosshair size={18} strokeWidth={2} />
        </button>
      </div>

      {showDropdown && (
        <SearchSuggestions 
          suggestions={suggestions} 
          activeIndex={activeIndex} 
          onSelect={handleSelect} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default SearchBar;
