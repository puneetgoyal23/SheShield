/**
 * HomePage — SheShield Premium Dashboard
 *
 * Design: Apple × Linear × modern fintech.
 * Sections:
 *   Hero → Timeline → Features → Stats Bar → Quick Actions → Bottom CTA
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, ShieldCheck, Users,
  Siren, ChevronRight, ArrowRight,
  Building2, UserCircle2, Compass,
  CheckCircle, Star, Zap,
} from 'lucide-react';
import useUserStore       from '../stores/userStore';
import useNavigationStore from '../stores/navigationStore';
import useContactStore    from '../stores/contactStore';
import useSosStore        from '../stores/sosStore';
import './HomePage.css';

/* ── helpers ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/* ── timeline data ── */
const TIMELINE = [
  { id: 1, icon: Compass,      title: 'Choose Destination',      desc: 'Tell us where you want to go.' },
  { id: 2, icon: Zap,          title: 'AI Analyses Every Route',  desc: 'Real-time safety signals from the community.' },
  { id: 3, icon: Star,         title: 'SafeScore Generated',       desc: 'Every route gets a live safety rating.' },
  { id: 4, icon: Users,        title: 'Community Insights Added',  desc: 'Reports and room data refine the score.' },
  { id: 5, icon: CheckCircle,  title: 'Reach Safely',             desc: 'Trusted contacts track you until you arrive.' },
];

/* ── feature rows ── */
const FEATURES = [
  {
    id: 'routes',
    emoji: '🛡',
    title: 'AI Safe Routes',
    desc: 'Choose routes based on safety—not just speed. Every path is scored before you travel.',
  },
  {
    id: 'location',
    emoji: '📍',
    title: 'Live Location Sharing',
    desc: 'Trusted contacts follow your entire journey in real time until you arrive.',
  },
  {
    id: 'rooms',
    emoji: '👥',
    title: 'Safety Rooms',
    desc: 'Travel in sync with others on the same route. Safer together.',
  },
  {
    id: 'sos',
    emoji: '🚨',
    title: 'Emergency SOS',
    desc: 'One tap instantly alerts all your emergency contacts with your live location.',
  },
];

/* ── quick action buttons ── */
const QUICK = [
  { id: 'nav',     Icon: Navigation,  label: 'Start Navigation', path: '/app/navigation', accent: 'theme' },
  { id: 'rooms',   Icon: Users,       label: 'Safety Rooms',      path: '/app/community',  accent: 'theme' },
  { id: 'sos',     Icon: Siren,       label: 'Emergency SOS',     path: null,              accent: 'sos'   },
  { id: 'help',    Icon: Building2,   label: 'Nearby Help',       path: '/app/safety',     accent: 'theme' },
  { id: 'profile', Icon: UserCircle2, label: 'Profile',           path: '/app/profile',    accent: 'muted' },
];

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
const HomePage = () => {
  const navigate        = useNavigate();
  const profile         = useUserStore((s) => s.profile);
  const userPosition    = useNavigationStore((s) => s.userPosition);
  const contacts        = useContactStore((s) => s.contacts);
  const beginCountdown  = useSosStore((s) => s.beginCountdown);

  const userName = useMemo(() => {
    const raw = profile?.name || profile?.email?.split('@')[0] || null;
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
  }, [profile]);

  const go    = (path) => navigate(path);
  const goSOS = () => { navigate('/app/navigation'); setTimeout(() => beginCountdown(), 120); };

  return (
    <div className="hp-page">
      <div className="hp-scroll">

        {/* ══ SECTION 1: HERO ══ */}
        <section className="hp-hero">
          <div className="hp-hero-ambient" aria-hidden="true" />

          {/* location chip */}
          <div className="hp-loc-chip">
            <span
              className="hp-loc-dot"
              style={{ background: userPosition ? 'var(--color-safe)' : 'var(--color-text-muted)' }}
            />
            <MapPin size={11} />
            <span>{userPosition ? 'Location Active' : 'Locating…'}</span>
          </div>

          {/* greeting */}
          <p className="hp-greeting">
            {getGreeting()}, <span className="hp-greeting-name">{userName || 'Stay Safe'}</span> 👋
          </p>

          {/* headline */}
          <h1 className="hp-headline">
            Navigate Smarter.<br />
            <span className="hp-headline-accent">Navigate Safer.</span>
          </h1>

          {/* sub */}
          <p className="hp-sub">
            AI-powered navigation that helps women choose safer routes using
            community reports, SafeScore and live protection.
          </p>

          {/* CTAs */}
          <div className="hp-cta-group">
            <button
              id="hp-btn-nav"
              className="hp-cta-primary"
              onClick={() => go('/app/navigation')}
            >
              <Navigation size={18} />
              Start Safe Navigation
              <ArrowRight size={16} className="hp-cta-arrow" />
            </button>
            <button
              id="hp-btn-rooms"
              className="hp-cta-outline"
              onClick={() => go('/app/community')}
            >
              <Users size={15} />
              Join Safety Rooms
            </button>
          </div>
        </section>

        {/* ══ SECTION 2: HOW IT WORKS — TIMELINE ══ */}
        <section className="hp-section">
          <p className="hp-eyebrow">The Process</p>
          <h2 className="hp-section-title">How SheShield Protects You</h2>

          <div className="hp-timeline">
            {TIMELINE.map(({ id, icon: Icon, title, desc }, i) => (
              <div key={id} className="hp-step">
                {/* connector line */}
                {i < TIMELINE.length - 1 && <div className="hp-step-line" aria-hidden="true" />}

                <div className="hp-step-left">
                  <div className="hp-step-icon">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="hp-step-body">
                  <p className="hp-step-num">0{id}</p>
                  <h3 className="hp-step-title">{title}</h3>
                  <p className="hp-step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SECTION 3: FEATURES ══ */}
        <section className="hp-section">
          <p className="hp-eyebrow">Built for Safety</p>
          <h2 className="hp-section-title">Safety Features</h2>

          <div className="hp-features">
            {FEATURES.map(({ id, emoji, title, desc }, i) => (
              <div key={id} className={`hp-feature-row ${i % 2 === 1 ? 'hp-feature-row--alt' : ''}`}>
                <div className="hp-feature-emoji" aria-hidden="true">{emoji}</div>
                <div className="hp-feature-body">
                  <h3 className="hp-feature-title">{title}</h3>
                  <p className="hp-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SECTION 4: QUICK STATS BAR ══ */}
        <section className="hp-section">
          <p className="hp-eyebrow">Right Now</p>
          <h2 className="hp-section-title">Today's Overview</h2>

          <div className="hp-stats-bar">
            <div className="hp-stat-chip">
              <span className="hp-stat-num hp-stat-num--safe">94</span>
              <span className="hp-stat-lbl">SafeScore</span>
            </div>
            <div className="hp-stat-divider" aria-hidden="true" />
            <div className="hp-stat-chip">
              <span className="hp-stat-num hp-stat-num--caution">3</span>
              <span className="hp-stat-lbl">Reports Nearby</span>
            </div>
            <div className="hp-stat-divider" aria-hidden="true" />
            <div className="hp-stat-chip">
              <span className="hp-stat-num hp-stat-num--info">1</span>
              <span className="hp-stat-lbl">Police Station</span>
            </div>
            <div className="hp-stat-divider" aria-hidden="true" />
            <div className="hp-stat-chip">
              <span className="hp-stat-num hp-stat-num--theme">6</span>
              <span className="hp-stat-lbl">Safety Rooms</span>
            </div>
          </div>

          {/* contacts badge */}
          {contacts.length > 0 && (
            <div className="hp-contacts-badge">
              <ShieldCheck size={14} />
              <span>
                {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''} ready
              </span>
            </div>
          )}
        </section>

        {/* ══ SECTION 5: QUICK ACTIONS ══ */}
        <section className="hp-section">
          <p className="hp-eyebrow">Navigate</p>
          <h2 className="hp-section-title">Quick Actions</h2>

          <div className="hp-actions">
            {QUICK.map(({ id, Icon, label, path, accent }) => (
              <button
                key={id}
                id={`hp-action-${id}`}
                className={`hp-action-btn hp-action-btn--${accent}`}
                onClick={() => (id === 'sos' ? goSOS() : go(path))}
              >
                <span className={`hp-action-icon hp-action-icon--${accent}`}>
                  <Icon size={18} />
                </span>
                <span className="hp-action-label">{label}</span>
                <ChevronRight size={14} className="hp-action-arrow" />
              </button>
            ))}
          </div>
        </section>

        {/* ══ SECTION 6: BOTTOM CTA ══ */}
        <section className="hp-bottom-cta">
          <div className="hp-bottom-cta-glow" aria-hidden="true" />
          <p className="hp-bottom-eyebrow">You're protected.</p>
          <h2 className="hp-bottom-title">Ready to travel safely?</h2>
          <button
            id="hp-bottom-nav-btn"
            className="hp-cta-primary hp-cta-primary--full"
            onClick={() => go('/app/navigation')}
          >
            <Navigation size={18} />
            Start Navigation
            <ArrowRight size={16} className="hp-cta-arrow" />
          </button>
          <p className="hp-bottom-hint">Your journey begins with a safer route.</p>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
