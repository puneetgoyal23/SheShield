/**
 * CommunityPage — Safety reports feed with severity indicators.
 * Uses dummy data + the existing reportStore for live submitted reports.
 */
import React, { useState } from 'react';
import {
  Users, Plus, MapPin, Clock, AlertTriangle,
  Lightbulb, Eye, ThumbsUp, Flag, ChevronDown,
  TriangleAlert, ShieldCheck, Shield
} from 'lucide-react';
import useReportStore from '../stores/reportStore';
import ReportModal from '../components/report/ReportModal/ReportModal';
import './CommunityPage.css';

/* ── Dummy seed reports ── */
const SEED_REPORTS = [
  {
    id: 'seed-1',
    category: 'Poor Lighting',
    description: 'Street lights are broken near the underpass. Avoid after dark.',
    position: null,
    location: 'Sector 44 Underpass',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    severity: 'caution',
    upvotes: 14,
    icon: Lightbulb,
  },
  {
    id: 'seed-2',
    category: 'Suspicious Activity',
    description: 'Unknown individuals loitering near the parking lot entrance.',
    position: null,
    location: 'DLF Phase 2 Parking',
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    severity: 'danger',
    upvotes: 31,
    icon: TriangleAlert,
  },
  {
    id: 'seed-3',
    category: 'Safe Crowd',
    description: 'Large group of families. Very safe and well-lit area.',
    position: null,
    location: 'DLF Cyber Hub',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    severity: 'safe',
    upvotes: 8,
    icon: ShieldCheck,
  },
  {
    id: 'seed-4',
    category: 'Harassment',
    description: 'Verbal harassment reported near the bus stop.',
    position: null,
    location: 'MG Road Bus Stop',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: 'danger',
    upvotes: 47,
    icon: Flag,
  },
  {
    id: 'seed-5',
    category: 'Poorly Maintained Road',
    description: 'Large potholes and no street lights for 500m stretch.',
    position: null,
    location: 'Old Railway Road',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    severity: 'caution',
    upvotes: 22,
    icon: Eye,
  },
];

/* ── Helpers ── */
const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const SEVERITY_MAP = {
  caution: { label: 'Caution',   color: 'var(--color-caution)' },
  danger:  { label: 'Danger',    color: 'var(--color-danger)'  },
  safe:    { label: 'Safe Area', color: 'var(--color-safe)'    },
};

const CATEGORY_ICON_MAP = {
  'Poor Lighting':        Lightbulb,
  'Suspicious Activity':  TriangleAlert,
  'Safe Crowd':           ShieldCheck,
  'Harassment':           Flag,
  'Poorly Maintained Road': Eye,
};

/* ── Incident card ── */
const IncidentCard = ({ report, upvoted, onUpvote }) => {
  const sev     = SEVERITY_MAP[report.severity] || SEVERITY_MAP.caution;
  const Icon    = CATEGORY_ICON_MAP[report.category] || Flag;
  const votes   = (report.upvotes || 0) + (upvoted ? 1 : 0);
  return (
    <article className={`cp-incident-card cp-incident--${report.severity || 'caution'}`}>
      {/* Severity stripe is handled via border-left in CSS */}

      <div className="cp-incident-top">
        <div className={`cp-incident-icon cp-incident-icon--${report.severity || 'caution'}`}>
          <Icon size={17} />
        </div>
        <div className="cp-incident-meta">
          <span className="cp-incident-category">{report.category}</span>
          <span
            className="cp-severity-badge"
            style={{ '--sev-color': sev.color }}
          >
            {sev.label}
          </span>
        </div>
        <span className="cp-incident-time">
          <Clock size={10} /> {timeAgo(report.timestamp)}
        </span>
      </div>

      {report.description && (
        <p className="cp-incident-desc">{report.description}</p>
      )}

      <div className="cp-incident-bottom">
        <span className="cp-incident-location">
          <MapPin size={11} /> {report.location || 'Nearby Area'}
        </span>
        <button
          className={`cp-upvote-btn ${upvoted ? 'cp-upvote-btn--active' : ''}`}
          onClick={() => onUpvote(report.id)}
        >
          <ThumbsUp size={12} />
          <span>{votes}</span>
        </button>
      </div>
    </article>
  );
};

/* ── Stats bar ── */
const StatsBar = ({ total, danger, caution }) => (
  <div className="cp-stats-bar anim-fade-in">
    <div className="cp-stat">
      <span className="cp-stat-num">{total}</span>
      <span className="cp-stat-label">Reports Today</span>
    </div>
    <div className="cp-stat-divider" />
    <div className="cp-stat">
      <span className="cp-stat-num" style={{ color: 'var(--color-danger)' }}>{danger}</span>
      <span className="cp-stat-label">Danger Alerts</span>
    </div>
    <div className="cp-stat-divider" />
    <div className="cp-stat">
      <span className="cp-stat-num" style={{ color: 'var(--color-caution)' }}>{caution}</span>
      <span className="cp-stat-label">Cautions</span>
    </div>
  </div>
);

/* ── Main Page ── */
const CommunityPage = () => {
  const liveReports    = useReportStore((s) => s.reports);
  const openModal      = useReportStore((s) => s.openReportModal);
  const [upvoted, setUpvoted] = useState({});
  const [filter, setFilter]   = useState('all');

  // Merge live reports from store with seed data
  const allReports = [
    ...liveReports.map((r) => ({
      ...r,
      severity: r.category === 'Suspicious Activity' || r.category === 'Harassment' ? 'danger'
              : r.category === 'Safe Crowd' ? 'safe' : 'caution',
      location: r.position ? `${r.position[0].toFixed(4)}, ${r.position[1].toFixed(4)}` : 'Nearby Area',
      upvotes: 0,
    })),
    ...SEED_REPORTS,
  ];

  const filtered = filter === 'all'
    ? allReports
    : allReports.filter((r) => r.severity === filter);

  const dangerCount  = allReports.filter((r) => r.severity === 'danger').length;
  const cautionCount = allReports.filter((r) => r.severity === 'caution').length;

  const handleUpvote = (id) =>
    setUpvoted((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="cp-page">
      <div className="cp-scroll">

        {/* ── Header ── */}
        <header className="cp-header anim-slide-down">
          <div>
            <h1 className="cp-page-title">Community</h1>
            <p className="cp-page-sub">Real-time safety reports from your area</p>
          </div>
          <button id="cp-report-btn" className="cp-report-fab" onClick={openModal}>
            <Plus size={18} />
            <span>Report</span>
          </button>
        </header>

        {/* ── Stats ── */}
        <StatsBar
          total={allReports.length}
          danger={dangerCount}
          caution={cautionCount}
        />

        {/* ── Filter tabs ── */}
        <div className="cp-filter-row" role="tablist">
          {['all', 'danger', 'caution', 'safe'].map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`cp-filter-tab ${filter === f ? 'cp-filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Reports feed ── */}
        <section className="cp-feed">
          {filtered.length === 0 ? (
            <div className="cp-empty">
              <Shield size={40} />
              <p>No reports in this category.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <IncidentCard
                key={r.id}
                report={r}
                upvoted={!!upvoted[r.id]}
                onUpvote={handleUpvote}
              />
            ))
          )}
        </section>

      </div>
      
      {/* ── Report Modal ── */}
      <ReportModal />

    </div>
  );
};

export default CommunityPage;
