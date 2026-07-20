/**
 * SafetyHubPage — Emergency actions, nearby resources, safety tips.
 * Pure UI — dummy data only. No backend calls.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Phone, MapPin, Share2, AlertTriangle,
  Navigation, Lightbulb, ChevronRight, Radio,
  Building2, Cross, Siren, Users, Lock, Bell,
  ShieldCheck, Zap
} from 'lucide-react';
import useSosStore from '../stores/sosStore';
import './SafetyHubPage.css';

/* ── Static dummy data ── */
const HELP_RESOURCES = [
  { id: 1, icon: Building2, label: 'Police',    sub: '0.4 km · 24/7', color: '#42a5f5', phone: '100' },
  { id: 2, icon: Cross,     label: 'Hospital',  sub: '0.8 km · Open', color: '#ef5350', phone: '102' },
  { id: 3, icon: Shield,    label: "Women's Help", sub: '1.2 km · 24/7', color: '#ec407a', phone: '1091' },
  { id: 4, icon: Siren,     label: 'Fire Dept', sub: '1.9 km · 24/7', color: '#ffa726', phone: '101' },
];

const SAFETY_TIPS = [
  { id: 1, icon: Bell,       tip: 'Keep Alert Mode on during late-night commutes.' },
  { id: 2, icon: Share2,     tip: 'Share live location with a trusted contact when travelling alone.' },
  { id: 3, icon: Lock,       tip: 'Walk in well-lit, populated streets whenever possible.' },
  { id: 4, icon: ShieldCheck,tip: 'Save emergency numbers on speed dial.' },
  { id: 5, icon: Users,      tip: 'Trust your instincts — leave any situation that feels unsafe.' },
];

/* ── Section header ── */
const SectionHeader = ({ title }) => (
  <div className="sh-section-header">
    <h2 className="sh-section-title">{title}</h2>
  </div>
);

/* ── Emergency call confirmation ── */
const DialConfirm = ({ number, label, onClose }) => (
  <div className="sh-modal-backdrop" onClick={onClose}>
    <div className="sh-modal-card anim-scale-in-spring" onClick={e => e.stopPropagation()}>
      <div className="sh-modal-icon-wrap">
        <Phone size={28} />
      </div>
      <p className="sh-modal-title">Call {label}?</p>
      <p className="sh-modal-sub">You are about to call <strong>{number}</strong></p>
      <div className="sh-modal-actions">
        <button className="sh-modal-btn sh-modal-btn--cancel" onClick={onClose}>Cancel</button>
        <a  className="sh-modal-btn sh-modal-btn--call" href={`tel:${number}`} onClick={onClose}>
          <Phone size={15} /> Call Now
        </a>
      </div>
    </div>
  </div>
);

/* ── Share location sheet ── */
const ShareConfirm = ({ onClose }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'My Location', text: 'I am sharing my live location via SheShield.', url: window.location.href });
    }
    onClose();
  };
  return (
    <div className="sh-modal-backdrop" onClick={onClose}>
      <div className="sh-modal-card anim-scale-in-spring" onClick={e => e.stopPropagation()}>
        <div className="sh-modal-icon-wrap sh-modal-icon-wrap--safe">
          <Share2 size={28} />
        </div>
        <p className="sh-modal-title">Share Location</p>
        <p className="sh-modal-sub">Share your current location with trusted contacts instantly.</p>
        <div className="sh-modal-actions">
          <button className="sh-modal-btn sh-modal-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="sh-modal-btn sh-modal-btn--share" onClick={handleShare}>
            <Share2 size={15} /> Share Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const SafetyHubPage = () => {
  const navigate      = useNavigate();
  const beginCountdown = useSosStore((s) => s.beginCountdown);
  const [dialTarget, setDialTarget] = useState(null);
  const [showShare, setShowShare]   = useState(false);

  const handleSOS = () => {
    navigate('/app/navigation');
    setTimeout(() => beginCountdown(), 100);
  };

  return (
    <div className="sh-page">
      <div className="sh-scroll">

        {/* ── Page Title ── */}
        <header className="sh-header anim-slide-down">
          <div className="sh-header-icon">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="sh-page-title">Safety Hub</h1>
            <p className="sh-page-sub">Your emergency command centre</p>
          </div>
        </header>

        {/* ── 1. Emergency Actions ── */}
        <section className="sh-section">
          <SectionHeader title="Emergency Actions" />

          {/* SOS — hero button */}
          <button className="sh-sos-card" id="sh-sos-btn" onClick={handleSOS}>
            <div className="sh-sos-glow" aria-hidden="true" />
            <div className="sh-sos-inner">
              <div className="sh-sos-icon-ring">
                <AlertTriangle size={30} />
              </div>
              <div className="sh-sos-text">
                <strong>SOS Emergency Alert</strong>
                <span>Instantly alert all emergency contacts</span>
              </div>
              <ChevronRight size={20} className="sh-sos-arrow" />
            </div>
          </button>

          {/* Secondary quick actions */}
          <div className="sh-quick-row">
            <button className="sh-quick-btn sh-quick-btn--call" onClick={() => setDialTarget({ number: '112', label: 'Emergency (112)' })}>
              <div className="sh-quick-icon"><Phone size={20} /></div>
              <span className="sh-quick-label">Emergency Call</span>
              <span className="sh-quick-sub">Call 112</span>
            </button>

            <button className="sh-quick-btn sh-quick-btn--share" onClick={() => setShowShare(true)}>
              <div className="sh-quick-icon"><Share2 size={20} /></div>
              <span className="sh-quick-label">Share Location</span>
              <span className="sh-quick-sub">Send to contacts</span>
            </button>

            <button className="sh-quick-btn sh-quick-btn--nav" onClick={() => navigate('/app/navigation')}>
              <div className="sh-quick-icon"><Navigation size={20} /></div>
              <span className="sh-quick-label">Safe Route</span>
              <span className="sh-quick-sub">Navigate now</span>
            </button>
          </div>
        </section>

        {/* ── 2. Nearby Help Resources ── */}
        <section className="sh-section">
          <SectionHeader title="Nearby Help" />
          <div className="sh-resources-list">
            {HELP_RESOURCES.map(({ id, icon: Icon, label, sub, color, phone }) => (
              <div key={id} className="sh-resource-card">
                <div className="sh-resource-icon" style={{ '--res-color': color }}>
                  <Icon size={20} />
                </div>
                <div className="sh-resource-body">
                  <p className="sh-resource-name">{label}</p>
                  <p className="sh-resource-sub">
                    <MapPin size={10} /> {sub}
                  </p>
                </div>
                <button
                  className="sh-resource-call-btn"
                  onClick={() => setDialTarget({ number: phone, label })}
                  aria-label={`Call ${label}`}
                >
                  <Phone size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Safety Tips ── */}
        <section className="sh-section sh-section--last">
          <SectionHeader title="Safety Tips" />
          <div className="sh-tips-list">
            {SAFETY_TIPS.map(({ id, icon: Icon, tip }) => (
              <div key={id} className="sh-tip-card">
                <div className="sh-tip-icon"><Icon size={15} /></div>
                <p className="sh-tip-text">{tip}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Modals ── */}
      {dialTarget && (
        <DialConfirm
          number={dialTarget.number}
          label={dialTarget.label}
          onClose={() => setDialTarget(null)}
        />
      )}
      {showShare && <ShareConfirm onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default SafetyHubPage;
