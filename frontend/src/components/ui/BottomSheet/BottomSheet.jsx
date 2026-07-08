import { Shield } from 'lucide-react';
import { getTimeSlot, getTimeSafetyLevel } from '../../../utils/timeOfDay';
import useUiStore from '../../../stores/uiStore';
import useSafetyStore from '../../../stores/safetyStore';
import { APP_MODES } from '../../../constants/appConstants';
import RouteCards from '../../route/RouteCards/RouteCards';
import ActiveJourneyPanel from '../../route/ActiveJourneyPanel/ActiveJourneyPanel';
import './BottomSheet.css';

/* ── Time of Day Safety Badge ── */
const TimeBadge = () => {
  const slot  = getTimeSlot();
  const level = getTimeSafetyLevel();

  const levelClass = {
    low:    'badge--safe',
    medium: 'badge--caution',
    high:   'badge--danger',
  }[level.level];

  return (
    <div className={`time-badge ${levelClass}`}>
      <span className="time-badge-icon" aria-hidden="true">{slot.icon}</span>
      <span className="time-badge-slot">{slot.label}</span>
      <span className="time-badge-divider" aria-hidden="true">·</span>
      <span className="time-badge-level">{level.label}</span>
    </div>
  );
};

/* ── Quick Destination Chip ── */
const QuickChip = ({ emoji, label, id, onClick, isActive }) => (
  <button 
    id={id} 
    className={`quick-chip ${isActive ? 'active' : ''}`} 
    aria-label={`Show ${label}`}
    onClick={onClick}
    style={{ borderColor: isActive ? 'var(--color-primary)' : '' }}
  >
    <span className="quick-chip-icon" aria-hidden="true">{emoji}</span>
    <span className="quick-chip-label">{label}</span>
  </button>
);

/* ── Empty State (Phase 1) ── */
const EmptyState = () => {
  const activeFilter = useSafetyStore((s) => s.activeFilter);
  const setFilter = useSafetyStore((s) => s.setFilter);
  const clearFilter = useSafetyStore((s) => s.clearFilter);
  const setSafePointsVisible = useSafetyStore((s) => s.setSafePointsVisible);
  const isSafePointsVisible = useSafetyStore((s) => s.isSafePointsVisible);
  const safePoints = useSafetyStore((s) => s.safePoints);
  const isLoadingSafePoints = useSafetyStore((s) => s.isLoadingSafePoints);
  const safePointsError = useSafetyStore((s) => s.safePointsError);
  const pushToast = useUiStore((s) => s.pushToast);

  const toggleFilter = (type) => {
    if (activeFilter === type && isSafePointsVisible) {
      setSafePointsVisible(false);
      clearFilter();
    } else {
      setFilter(type);
      setSafePointsVisible(true);

      const filtered = safePoints.filter(p => p.type === type);
      if (filtered.length === 0) {
        pushToast({ type: 'warning', message: `No nearby ${type.replace('_', ' ')} found.` });
      }
    }
  };

  return (
    <div className="bs-empty-state">
      <TimeBadge />

      <div className="bs-empty-hero">
        <div className="bs-shield-icon" aria-hidden="true">
          <Shield size={30} strokeWidth={1.8} />
        </div>
        <div className="bs-empty-text">
          <h2 className="bs-empty-title">Plan a Safe Route</h2>
          <p className="bs-empty-subtitle">
            Search your destination to get AI-powered safe route recommendations
          </p>
        </div>
      </div>

      <div className="bs-quick-actions" role="group" aria-label="Quick destinations">
        <QuickChip 
          id="chip-police" emoji="🚔" label="Nearest Police" 
          isActive={activeFilter === 'police' && isSafePointsVisible}
          onClick={() => toggleFilter('police')}
        />
        <QuickChip 
          id="chip-hospital" emoji="🏥" label="Hospital" 
          isActive={activeFilter === 'hospital' && isSafePointsVisible}
          onClick={() => toggleFilter('hospital')}
        />
        <QuickChip 
          id="chip-metro" emoji="🚇" label="Metro Station" 
          isActive={activeFilter === 'metro' && isSafePointsVisible}
          onClick={() => toggleFilter('metro')}
        />
        <QuickChip 
          id="chip-pharmacy" emoji="💊" label="24/7 Pharmacy" 
          isActive={activeFilter === 'pharmacy' && isSafePointsVisible}
          onClick={() => toggleFilter('pharmacy')}
        />
      </div>

      {/* ── Status Indicators ── */}
      {isLoadingSafePoints && (
        <div className="bs-safe-points-status status-loading">
          <span className="spinner-icon" aria-hidden="true">⏳</span>
          <span>Locating nearby safe points...</span>
        </div>
      )}
      
      {safePointsError && (
        <div className="bs-safe-points-status status-error">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{safePointsError}</span>
        </div>
      )}
    </div>
  );
};

/* ── Main BottomSheet ── */
const BottomSheet = ({ children }) => {
  const appMode = useUiStore((s) => s.appMode);
  
  return (
    <div className="bottom-sheet anim-slide-up" role="complementary" aria-label="Route panel">

      {/* Drag handle */}
      <div className="bs-handle-row" aria-hidden="true">
        <div className="bs-handle" />
      </div>

      {/* Content */}
      <div className="bs-content">
        {appMode === APP_MODES.PLANNING ? (
          <RouteCards />
        ) : appMode === APP_MODES.NAVIGATING ? (
          <ActiveJourneyPanel />
        ) : (
          children ?? <EmptyState />
        )}
      </div>

    </div>
  );
};

export default BottomSheet;
