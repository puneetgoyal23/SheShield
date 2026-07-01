import { formatDistance, formatDuration } from '../../../utils/formatters';
import useRouteStore from '../../../stores/routeStore';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import './RouteCards.css';

const RouteCard = ({ route, isActive, onClick }) => {
  const isSafe = route.safetyScore >= 80;
  const isWarning = route.safetyScore >= 60 && route.safetyScore < 80;
  
  const scoreClass = isSafe ? 'score-safe' : (isWarning ? 'score-warning' : 'score-danger');
  const Icon = isSafe ? ShieldCheck : (isWarning ? Shield : ShieldAlert);

  return (
    <div 
      className={`route-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="route-card-header">
        <div className="route-card-title">
          <span className="route-card-label">{route.label}</span>
          <span className="route-card-time">{formatDuration(route.duration)}</span>
        </div>
        <div className="route-card-subtitle">
          {formatDistance(route.distance)}
        </div>
      </div>

      <div className={`route-card-safety ${scoreClass}`}>
        <div className="route-card-score-badge">
          <Icon size={16} />
          <span>{route.safetyScore}/100 Safety</span>
        </div>
        {route.warnings && route.warnings.length > 0 && (
          <ul className="route-card-warnings">
            {route.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        )}
      </div>
      
      {isActive && (
        <button className="route-start-btn">
          Start Navigation
        </button>
      )}
    </div>
  );
};

const RouteCards = () => {
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const setActiveRoute = useRouteStore((s) => s.setActiveRoute);
  const isLoading = useRouteStore((s) => s.isLoading);
  const error = useRouteStore((s) => s.error);

  if (isLoading) {
    return (
      <div className="route-cards-container loading">
        <div className="route-card skeleton"></div>
        <div className="route-card skeleton"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="route-cards-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!routes || routes.length === 0) return null;

  return (
    <div className="route-cards-container">
      {routes.map((route, index) => (
        <RouteCard 
          key={route.id}
          route={route}
          isActive={index === activeRouteIndex}
          onClick={() => setActiveRoute(index)}
        />
      ))}
    </div>
  );
};

export default RouteCards;
