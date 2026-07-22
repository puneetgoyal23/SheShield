import React, { useMemo, useState, useEffect } from 'react';
import { AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { UserX, AlertTriangle, LightbulbOff, MessageSquareWarning, Clock, Eye, X } from 'lucide-react';
import useReportStore from '../../../stores/reportStore';
import './CommunityIncidentsLayer.css';

// Map categories to Lucide icons
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Harassment':
      return <UserX size={16} />;
    case 'Stalking':
      return <Eye size={16} />;
    case 'Unsafe Area':
      return <AlertTriangle size={16} />;
    case 'Poor Lighting':
      return <LightbulbOff size={16} />;
    default:
      return <MessageSquareWarning size={16} />;
  }
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CommunityIncidentsLayer = () => {
  const reports = useReportStore((s) => s.reports);
  const [activePopupId, setActivePopupId] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const listener = window.google.maps.event.addListener(map, 'click', () => {
      setActivePopupId(null);
    });
    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, [map]);

  const groupedReports = useMemo(() => {
    const groups = [];
    reports.forEach(report => {
      // Skip any report that doesn't have a valid [lat, lng] position
      if (
        !report.position ||
        !Array.isArray(report.position) ||
        report.position.length < 2 ||
        report.position[0] == null ||
        report.position[1] == null
      ) return;

      // Group reports that are essentially at the exact same location (< 0.0001 deg is ~11 meters)
      const existingGroup = groups.find(g => {
        const dLat = Math.abs(g.lat - report.position[0]);
        const dLng = Math.abs(g.lng - report.position[1]);
        return dLat < 0.0001 && dLng < 0.0001;
      });

      if (existingGroup) {
        existingGroup.reports.push(report);
      } else {
        groups.push({
          id: report.id,
          lat: report.position[0],
          lng: report.position[1],
          reports: [report]
        });
      }
    });
    return groups;
  }, [reports]);

  if (!groupedReports || groupedReports.length === 0) return null;

  return (
    <>
      {groupedReports.map((group) => {
        const isGrouped = group.reports.length > 1;
        const category = group.reports[0].category || 'Other';
        const safeClass = category.replace(/\s+/g, '.');

        return (
          <React.Fragment key={group.id}>
            <AdvancedMarker
              position={{ lat: group.lat + 0.00002, lng: group.lng + 0.00002 }}
              onClick={() => setActivePopupId(group.id)}
              zIndex={activePopupId === group.id ? 2000 : 1000}
            >
              {isGrouped ? (
                <div className="incident-point-marker marker-Grouped">
                  <MessageSquareWarning size={16} />
                  <div className="incident-group-badge">{group.reports.length}</div>
                </div>
              ) : (
                <div className={`incident-point-marker marker-${safeClass}`}>
                  {getCategoryIcon(category)}
                </div>
              )}
            </AdvancedMarker>

            {activePopupId === group.id && (
              <InfoWindow
                position={{ lat: group.lat, lng: group.lng }}
                onCloseClick={() => setActivePopupId(null)}
                pixelOffset={[0, -20]}
                headerDisabled={true}
                className="incident-popup"
              >
                <div className={`incident-popup-content ${isGrouped ? 'grouped-popup-content' : ''}`}>
                  <button 
                    className="incident-popup-close" 
                    onClick={(e) => { e.stopPropagation(); setActivePopupId(null); }}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                  <span className="incident-popup-label">
                    {isGrouped ? 'Multiple Reports' : 'Community Report'}
                  </span>
                  
                  {isGrouped ? (
                    // Grouped Popup Render
                    <div className="grouped-reports-list">
                      {group.reports.map((report, idx) => (
                        <React.Fragment key={report.id}>
                          <div className="grouped-report-item">
                            <div className="grouped-report-header">
                              <h3>{report.category}</h3>
                              <p className="incident-time">
                                <Clock size={12} />
                                {formatTime(report.timestamp)}
                              </p>
                            </div>
                            {report.description && (
                              <p className="incident-desc">{report.description}</p>
                            )}
                          </div>
                          {idx < group.reports.length - 1 && <div className="grouped-divider" />}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    // Single Popup Render
                    <>
                      <h3>{group.reports[0].category}</h3>
                      {group.reports[0].description && (
                        <p className="incident-desc">{group.reports[0].description}</p>
                      )}
                      <p className="incident-time">
                        <Clock size={12} />
                        {formatTime(group.reports[0].timestamp)}
                      </p>
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CommunityIncidentsLayer;
