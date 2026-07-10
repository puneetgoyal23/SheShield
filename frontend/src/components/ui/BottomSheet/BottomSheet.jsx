import { Shield } from 'lucide-react';
import { getTimeSlot, getTimeSafetyLevel } from '../../../utils/timeOfDay';
import useUiStore from '../../../stores/uiStore';
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


/* ── Empty State (Phase 1) ── */
const EmptyState = () => {
  return (
    <div className="bs-empty-state">
      <div className="bs-empty-hero">
        <div className="bs-shield-icon" aria-hidden="true">
          <Shield size={28} strokeWidth={1.8} />
        </div>
        <div className="bs-empty-text">
          <div className="bs-empty-header">
            <h2 className="bs-empty-title">Plan a Safe Route</h2>
            <TimeBadge />
          </div>
          <p className="bs-empty-subtitle">
            Get AI-powered safe route recommendations.
          </p>
          <p className="bs-empty-hint">
            Search a destination above to compare safer routes
          </p>
        </div>
      </div>
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
