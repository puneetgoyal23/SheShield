/**
 * ProfilePage — User info, emergency contacts, settings.
 * Reads from userStore and contactStore. No new backend logic.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Shield, Bell, Moon, Lock,
  LogOut, ChevronRight, Plus, Mail,
  ShieldCheck, Trash2, MapPin, Info
} from 'lucide-react';
import useUserStore    from '../stores/userStore';
import useContactStore from '../stores/contactStore';
import EmergencyContactsModal from '../components/contacts/EmergencyContactsModal/EmergencyContactsModal';
import './ProfilePage.css';

/* ── Settings rows data ── */
const SETTINGS = [
  { id: 'notifications', icon: Bell,       label: 'Notifications',    sub: 'Alert preferences' },
  { id: 'privacy',       icon: Lock,       label: 'Privacy & Safety',  sub: 'Location & data' },
  { id: 'theme',         icon: Moon,       label: 'Appearance',        sub: 'Dark mode enabled' },
  { id: 'about',         icon: Info,       label: 'About SheShield',   sub: 'Version 1.0.0' },
];

/* ── User avatar initials ── */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

/* ── Logout confirmation modal ── */
const LogoutModal = ({ onConfirm, onClose }) => (
  <div className="pp-modal-backdrop" onClick={onClose}>
    <div className="pp-modal-card anim-scale-in-spring" onClick={(e) => e.stopPropagation()}>
      <div className="pp-modal-icon">
        <LogOut size={26} />
      </div>
      <p className="pp-modal-title">Sign Out?</p>
      <p className="pp-modal-sub">You will need to log in again to access SheShield.</p>
      <div className="pp-modal-actions">
        <button className="pp-modal-btn pp-modal-btn--cancel" onClick={onClose}>Cancel</button>
        <button className="pp-modal-btn pp-modal-btn--confirm" onClick={onConfirm}>Sign Out</button>
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
const ProfilePage = () => {
  const navigate = useNavigate();

  const profile    = useUserStore((s) => s.profile);
  const clearToken = useUserStore((s) => s.clearToken);
  const contacts   = useContactStore((s) => s.contacts);
  const openContactModal = useContactStore((s) => s.setModalOpen);

  const [showLogout, setShowLogout] = useState(false);

  const userName = useMemo(() => {
    const raw = profile?.name || profile?.email?.split('@')[0] || 'User';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [profile]);
  const userEmail = profile?.email || 'Not available';

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="pp-page">
      <div className="pp-scroll">

        {/* ── Header ── */}
        <header className="pp-header anim-slide-down">
          <h1 className="pp-page-title">Profile</h1>
        </header>

        {/* ── 1. User Info Card ── */}
        <div className="pp-user-card anim-scale-in-spring">
          {/* Background gradient decoration */}
          <div className="pp-user-bg-glow" aria-hidden="true" />

          <div className="pp-user-content">
            <div className="pp-avatar">
              {getInitials(userName)}
            </div>
            <div className="pp-user-info">
              <p className="pp-user-name">{userName}</p>
              <p className="pp-user-email">
                <Mail size={11} /> {userEmail}
              </p>
              <div className="pp-user-badge">
                <ShieldCheck size={11} />
                <span>SheShield Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Emergency Contacts ── */}
        <section className="pp-section">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Emergency Contacts</h2>
            <button
              className="pp-section-action"
              onClick={() => openContactModal(true)}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="pp-contacts-empty">
              <Phone size={28} />
              <p>No emergency contacts yet.</p>
              <button
                className="pp-add-contact-btn"
                onClick={() => openContactModal(true)}
              >
                <Plus size={14} /> Add Contact
              </button>
            </div>
          ) : (
            <div className="pp-contacts-list">
              {contacts.map((c, i) => (
                <div key={c._id || i} className="pp-contact-card">
                  <div className="pp-contact-avatar">
                    {getInitials(c.name)}
                  </div>
                  <div className="pp-contact-body">
                    <p className="pp-contact-name">{c.name}</p>
                    <p className="pp-contact-phone">
                      <Phone size={10} /> {c.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="pp-contact-call-btn"
                    aria-label={`Call ${c.name}`}
                  >
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
              <button key={id} className="pp-setting-row" id={`pp-setting-${id}`}>
                <div className="pp-setting-icon">
                  <Icon size={17} />
                </div>
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
          <button
            id="pp-logout-btn"
            className="pp-logout-btn"
            onClick={() => setShowLogout(true)}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <p className="pp-version">SheShield v1.0.0 · Made for safety</p>
        </section>

      </div>

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onClose={() => setShowLogout(false)}
        />
      )}

      {/* ── Contact Modal ── */}
      <EmergencyContactsModal />

    </div>
  );
};

export default ProfilePage;
