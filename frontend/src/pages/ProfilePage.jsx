/**
 * ProfilePage — User info, emergency contacts, settings.
 * Reads from userStore and contactStore. No new backend logic.
 * Settings panels: Notifications, Privacy & Safety, Appearance, About.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Shield, Bell, Moon, Lock,
  LogOut, ChevronRight, Plus, Mail,
  ShieldCheck, Trash2, MapPin, Info,
  X, Globe, Palette, ExternalLink, Heart,
  Radio, Eye, Mic,
} from 'lucide-react';
import useUserStore    from '../stores/userStore';
import useContactStore from '../stores/contactStore';
import useThemeStore   from '../stores/themeStore';
import EmergencyContactsModal from '../components/contacts/EmergencyContactsModal/EmergencyContactsModal';
import './ProfilePage.css';

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

/* ── Persist settings in localStorage ── */
const loadPref = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const savePref = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

/* ══════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
   ══════════════════════════════════════════════ */

/* ── Slide-up settings overlay ── */
const SettingsOverlay = ({ title, onClose, children }) => (
  <div className="pp-overlay-backdrop" onClick={onClose}>
    <div className="pp-overlay-sheet anim-slide-up" onClick={e => e.stopPropagation()}>
      <div className="pp-overlay-header">
        <h2 className="pp-overlay-title">{title}</h2>
        <button className="pp-overlay-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="pp-overlay-body">{children}</div>
    </div>
  </div>
);

/* ── Toggle row ── */
const ToggleRow = ({ label, desc, storeKey, defaultVal = true }) => {
  const [on, setOn] = useState(() => loadPref(storeKey, defaultVal));
  const toggle = () => { const next = !on; setOn(next); savePref(storeKey, next); };
  return (
    <div className="pp-toggle-row">
      <div className="pp-toggle-text">
        <span className="pp-toggle-label">{label}</span>
        {desc && <span className="pp-toggle-desc">{desc}</span>}
      </div>
      <button
        className={`pp-toggle-switch ${on ? 'pp-toggle-switch--on' : ''}`}
        onClick={toggle}
        aria-checked={on}
        role="switch"
        aria-label={label}
      >
        <span className="pp-toggle-thumb" />
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════
   SETTINGS PANELS
   ══════════════════════════════════════════════ */

/* 1. Notifications */
const NotificationsPanel = ({ onClose }) => (
  <SettingsOverlay title="Notifications" onClose={onClose}>
    <ToggleRow label="Emergency Alerts"          desc="Critical SOS and danger alerts near you."      storeKey="notif_emergency"    defaultVal={true}  />
    <ToggleRow label="Community Room Messages"   desc="New messages in your joined Safety Rooms."     storeKey="notif_room_msg"     defaultVal={true}  />
    <ToggleRow label="Safety Room Notifications" desc="Join requests and room activity updates."       storeKey="notif_room_activity" defaultVal={true} />
    <ToggleRow label="SOS Status Updates"        desc="Updates when your SOS is acknowledged."        storeKey="notif_sos_status"   defaultVal={true}  />
    <ToggleRow label="Route Safety Alerts"       desc="Alerts about unsafe areas on your route."      storeKey="notif_route_safety" defaultVal={false} />
  </SettingsOverlay>
);

/* 2. Privacy & Safety */
const PrivacyPanel = ({ onClose }) => (
  <SettingsOverlay title="Privacy & Safety" onClose={onClose}>
    <ToggleRow label="Share Live Location"         desc="Allow SheShield to share your location during SOS and Alert Mode."    storeKey="priv_live_loc"      defaultVal={true}  />
    <ToggleRow label="Allow Background Location"   desc="Track location when the app is minimised for continuous safety."      storeKey="priv_bg_loc"        defaultVal={false} />
    <ToggleRow label="Share Anonymous Safety Data" desc="Help improve community safety scores. No personal data is included."  storeKey="priv_anon_data"     defaultVal={true}  />
    <ToggleRow label="Online Status in Safety Rooms" desc="Show when you are active inside a Safety Room."                    storeKey="priv_online_status" defaultVal={true}  />
  </SettingsOverlay>
);

/* 3. Appearance */
const THEMES = [
  { id: 'pink',    label: 'SheShield Pink', color: '#FF2D7A' },
  { id: 'purple',  label: 'Aurora Purple',  color: '#7C4DFF' },
  { id: 'emerald', label: 'Emerald',        color: '#00C98D' },
];
const AppearancePanel = ({ onClose }) => {
  const theme    = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  return (
    <SettingsOverlay title="Appearance" onClose={onClose}>
      {/* Dark Mode always on */}
      <div className="pp-toggle-row">
        <div className="pp-toggle-text">
          <span className="pp-toggle-label">Dark Mode</span>
          <span className="pp-toggle-desc">Always enabled for optimal visibility at night.</span>
        </div>
        <button className="pp-toggle-switch pp-toggle-switch--on pp-toggle-switch--locked" aria-checked aria-disabled role="switch" aria-label="Dark mode">
          <span className="pp-toggle-thumb" />
        </button>
      </div>

      {/* Theme picker */}
      <div className="pp-appearance-section">
        <span className="pp-appearance-label">App Theme</span>
        <div className="pp-theme-grid">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`pp-theme-btn ${theme === t.id ? 'pp-theme-btn--active' : ''}`}
              onClick={() => setTheme(t.id)}
              style={{ '--theme-color': t.color }}
            >
              <div className="pp-theme-swatch" />
              <span>{t.label}</span>
              {theme === t.id && <ShieldCheck size={13} className="pp-theme-check" />}
            </button>
          ))}
        </div>
      </div>
    </SettingsOverlay>
  );
};

/* 4. About SheShield */
const AboutPanel = ({ onClose }) => (
  <SettingsOverlay title="About SheShield" onClose={onClose}>
    <div className="pp-about-hero">
      <div className="pp-about-icon"><Shield size={32} /></div>
      <h3 className="pp-about-app-name">SheShield</h3>
      <span className="pp-about-version">Version 1.0.0</span>
      <span className="pp-about-tag">🏆 Hackathon Project</span>
    </div>

    {[
      { label: 'Developed By',       value: 'Team SheShield' },
      { label: 'Tech Stack',         value: 'React · Node.js · MongoDB · Google Maps' },
      { label: 'Category',           value: "Women's Safety & Community" },
      { label: 'Build',              value: 'Hackathon Demo — July 2025' },
    ].map(({ label, value }) => (
      <div key={label} className="pp-about-row">
        <span className="pp-about-key">{label}</span>
        <span className="pp-about-val">{value}</span>
      </div>
    ))}

    <div className="pp-about-actions">
      <button className="pp-about-btn"><ExternalLink size={14} /> Privacy Policy</button>
      <button className="pp-about-btn"><ExternalLink size={14} /> Terms of Use</button>
      <button className="pp-about-btn"><Heart size={14} /> Contact Support</button>
    </div>
  </SettingsOverlay>
);

/* ══════════════════════════════════════════════
   SETTINGS CONFIG
   ══════════════════════════════════════════════ */
const SETTINGS = [
  { id: 'notifications', icon: Bell,  label: 'Notifications',   sub: 'Alert preferences' },
  { id: 'privacy',       icon: Lock,  label: 'Privacy & Safety', sub: 'Location & data' },
  { id: 'theme',         icon: Moon,  label: 'Appearance',       sub: 'Dark mode enabled' },
  { id: 'about',         icon: Info,  label: 'About SheShield',  sub: 'Version 1.0.0' },
];

const PANEL_MAP = {
  notifications: NotificationsPanel,
  privacy:       PrivacyPanel,
  theme:         AppearancePanel,
  about:         AboutPanel,
};

/* ── Logout modal ── */
const LogoutModal = ({ onConfirm, onClose }) => (
  <div className="pp-modal-backdrop" onClick={onClose}>
    <div className="pp-modal-card anim-scale-in-spring" onClick={e => e.stopPropagation()}>
      <div className="pp-modal-icon"><LogOut size={26} /></div>
      <p className="pp-modal-title">Sign Out?</p>
      <p className="pp-modal-sub">You will need to log in again to access SheShield.</p>
      <div className="pp-modal-actions">
        <button className="pp-modal-btn pp-modal-btn--cancel" onClick={onClose}>Cancel</button>
        <button className="pp-modal-btn pp-modal-btn--confirm" onClick={onConfirm}>Sign Out</button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
const ProfilePage = () => {
  const navigate = useNavigate();

  const profile    = useUserStore((s) => s.profile);
  const clearToken = useUserStore((s) => s.clearToken);
  const contacts   = useContactStore((s) => s.contacts);
  const openContactModal = useContactStore((s) => s.setModalOpen);

  const [showLogout, setShowLogout]   = useState(false);
  const [activePanel, setActivePanel] = useState(null); // id of open settings panel

  const userName = useMemo(() => {
    const raw = profile?.name || profile?.email?.split('@')[0] || 'User';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [profile]);
  const userEmail = profile?.email || 'Not available';

  const handleLogout = () => { clearToken(); navigate('/login'); };

  const ActivePanel = activePanel ? PANEL_MAP[activePanel] : null;

  return (
    <div className="pp-page">
      <div className="pp-scroll">

        {/* ── Header ── */}
        <header className="pp-header anim-slide-down">
          <h1 className="pp-page-title">Profile</h1>
        </header>

        {/* ── 1. User Info Card ── */}
        <div className="pp-user-card anim-scale-in-spring">
          <div className="pp-user-bg-glow" aria-hidden="true" />
          <div className="pp-user-content">
            <div className="pp-avatar">{getInitials(userName)}</div>
            <div className="pp-user-info">
              <p className="pp-user-name">{userName}</p>
              <p className="pp-user-email"><Mail size={11} /> {userEmail}</p>
              <div className="pp-user-badge"><ShieldCheck size={11} /><span>SheShield Member</span></div>
            </div>
          </div>
        </div>

        {/* ── 2. Emergency Contacts ── */}
        <section className="pp-section">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Emergency Contacts</h2>
            <button className="pp-section-action" onClick={() => openContactModal(true)}>
              <Plus size={14} /> Add
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="pp-contacts-empty">
              <Phone size={28} />
              <p>No emergency contacts yet.</p>
              <button className="pp-add-contact-btn" onClick={() => openContactModal(true)}>
                <Plus size={14} /> Add Contact
              </button>
            </div>
          ) : (
            <div className="pp-contacts-list">
              {contacts.map((c, i) => (
                <div key={c._id || i} className="pp-contact-card">
                  <div className="pp-contact-avatar">{getInitials(c.name)}</div>
                  <div className="pp-contact-body">
                    <p className="pp-contact-name">{c.name}</p>
                    <p className="pp-contact-phone"><Phone size={10} /> {c.phone}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="pp-contact-call-btn" aria-label={`Call ${c.name}`}>
                    <Phone size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 3. Settings ── */}
        <section className="pp-section">
          <h2 className="pp-section-title">Settings</h2>
          <div className="pp-settings-list">
            {SETTINGS.map(({ id, icon: Icon, label, sub }) => (
              <button
                key={id}
                className="pp-setting-row"
                id={`pp-setting-${id}`}
                onClick={() => setActivePanel(id)}
              >
                <div className="pp-setting-icon"><Icon size={17} /></div>
                <div className="pp-setting-body">
                  <span className="pp-setting-label">{label}</span>
                  <span className="pp-setting-sub">{sub}</span>
                </div>
                <ChevronRight size={16} className="pp-setting-arrow" />
              </button>
            ))}
          </div>
        </section>

        {/* ── 4. Sign Out ── */}
        <section className="pp-section pp-section--last">
          <button id="pp-logout-btn" className="pp-logout-btn" onClick={() => setShowLogout(true)}>
            <LogOut size={16} /><span>Sign Out</span>
          </button>
          <p className="pp-version">SheShield v1.0.0 · Made for safety</p>
        </section>

      </div>

      {/* ── Modals ── */}
      {showLogout && (
        <LogoutModal onConfirm={handleLogout} onClose={() => setShowLogout(false)} />
      )}

      {/* ── Settings Panel ── */}
      {ActivePanel && <ActivePanel onClose={() => setActivePanel(null)} />}

      {/* ── Contact Modal ── */}
      <EmergencyContactsModal />

    </div>
  );
};

export default ProfilePage;
