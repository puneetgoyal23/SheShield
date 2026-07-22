/**
 * SafetyRoomsPage — route-based travel community for safer commuting.
 * Replaces the old Community / incident-reports page.
 * Uses local state + mock data only (no backend changes).
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Plus, MapPin, ArrowRight, Clock,
  Shield, ShieldCheck, Send, ChevronLeft,
  Radio, Navigation, AlertTriangle, CheckCircle2,
  Star, Globe, UserCheck, MessageCircle,
  UserPlus, X, Zap, Search, Bike, LogOut,
  CalendarDays, Info, Route, Phone,
} from 'lucide-react';
import './CommunityPage.css';

/* ══════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════ */
const SEED_ROOMS = [
  {
    id: 'r1',
    from: 'Sarojini Nagar',
    to: 'Delhi Railway Station',
    creator: 'Priya Sharma',
    frequency: 'Daily',
    timing: '8:30 AM',
    mode: 'Auto / Metro',
    distance: '12.4 km',
    eta: '22 mins',
    members: 24,
    reason: 'I travel this route daily for work and want to connect with others for safer commuting together.',
    privacy: 'women_only',
    safetyScore: 92,
    verified: true,
    color: '#E91E8C',
    createdOn: 'Jan 12, 2025',
    meetingPoint: 'Gate 2, Sarojini Nagar Market',
    messages: [
      { id: 'm1', author: 'Priya S.',  text: 'Good morning! Anyone heading out at 8:30?',              time: '8:12 AM', self: false },
      { id: 'm2', author: 'Ananya K.', text: "Yes! I'll be at Gate 2 by 8:25.",                        time: '8:14 AM', self: false },
      { id: 'm3', author: 'Neha R.',   text: "Same. Let's wait for each other near the auto stand.",   time: '8:16 AM', self: false },
      { id: 'm4', author: 'You',       text: "Perfect, I'll join at the auto stand 👍",                 time: '8:18 AM', self: true  },
    ],
    travelling: [
      { name: 'Priya S.',  time: '8:20 AM' },
      { name: 'Ananya K.', time: '8:30 AM' },
      { name: 'Neha R.',   time: '8:35 AM' },
    ],
    membersList: [
      { name: 'Priya Sharma',  mode: 'Metro',  verified: true,  status: 'travelling' },
      { name: 'Ananya K.',     mode: 'Auto',   verified: true,  status: 'travelling' },
      { name: 'Neha Rawat',    mode: 'Bike',   verified: false, status: 'travelling' },
      { name: 'Deepika M.',    mode: 'Metro',  verified: true,  status: 'offline' },
      { name: 'Riya Singh',    mode: 'Auto',   verified: false, status: 'offline' },
    ],
  },
  {
    id: 'r2',
    from: 'Lajpat Nagar',
    to: 'Connaught Place',
    creator: 'Meena Tanwar',
    frequency: 'Weekdays',
    timing: '9:00 AM',
    mode: 'Metro',
    distance: '8.7 km',
    eta: '18 mins',
    members: 11,
    reason: 'Metro line is often crowded and sometimes feels unsafe. Looking for travel companions.',
    privacy: 'everyone',
    safetyScore: 88,
    verified: true,
    color: '#7C4DFF',
    createdOn: 'Feb 3, 2025',
    meetingPoint: 'Lajpat Nagar Metro Station, Entrance A',
    messages: [
      { id: 'm1', author: 'Meena T.',  text: 'Anyone taking the blue line metro today?',  time: '8:55 AM', self: false },
      { id: 'm2', author: 'Divya P.',  text: 'Yes! See you at the platform.',              time: '8:57 AM', self: false },
    ],
    travelling: [
      { name: 'Meena T.',  time: '9:00 AM' },
      { name: 'Divya P.',  time: '9:10 AM' },
    ],
    membersList: [
      { name: 'Meena Tanwar', mode: 'Metro', verified: true,  status: 'travelling' },
      { name: 'Divya Patel',  mode: 'Metro', verified: false, status: 'travelling' },
      { name: 'Asha Gupta',   mode: 'Metro', verified: true,  status: 'offline' },
    ],
  },
  {
    id: 'r3',
    from: 'Sector 44',
    to: 'Huda City Centre',
    creator: 'Rina Mehta',
    frequency: 'Daily',
    timing: '7:45 AM',
    mode: 'Bike',
    distance: '5.2 km',
    eta: '14 mins',
    members: 8,
    reason: 'The stretch near the underpass can feel isolated early in the morning. Safety in numbers!',
    privacy: 'verified_only',
    safetyScore: 79,
    verified: false,
    color: '#00BCD4',
    createdOn: 'Mar 18, 2025',
    meetingPoint: 'Near Sector 44 Bus Stop',
    messages: [
      { id: 'm1', author: 'Rina M.',  text: 'Morning everyone! Safe travel today 🙏',   time: '7:40 AM', self: false },
    ],
    travelling: [
      { name: 'Rina M.',   time: '7:45 AM' },
    ],
    membersList: [
      { name: 'Rina Mehta',  mode: 'Bike', verified: true,  status: 'travelling' },
      { name: 'Pooja K.',    mode: 'Bike', verified: false, status: 'offline' },
    ],
  },
];

const FREQUENCY_OPTIONS = ['Daily', 'Weekdays', 'Occasionally'];
const PRIVACY_OPTIONS   = [
  { value: 'women_only',    label: 'Women Only',    icon: Shield    },
  { value: 'everyone',      label: 'Everyone',       icon: Globe     },
  { value: 'verified_only', label: 'Verified Users', icon: UserCheck },
];

const PRIVACY_META = {
  women_only:    { label: 'Women Only', icon: Shield,    color: '#E91E8C' },
  everyone:      { label: 'Everyone',   icon: Globe,     color: '#42A5F5' },
  verified_only: { label: 'Verified',   icon: UserCheck, color: '#AB47BC' },
};

/* ══════════════════════════════════════════════
   ROOM CARD
   ══════════════════════════════════════════════ */
const RoomCard = ({ room, onJoin }) => {
  const privacy  = PRIVACY_META[room.privacy] || PRIVACY_META.everyone;
  const PrivIcon = privacy.icon;

  return (
    <article className="sr-room-card anim-fade-in" onClick={() => onJoin(room)}>
      <div className="sr-room-accent" style={{ background: room.color }} />
      <div className="sr-room-body">
        <div className="sr-route-row">
          <span className="sr-route-point">{room.from}</span>
          <ArrowRight size={14} className="sr-route-arrow" />
          <span className="sr-route-point">{room.to}</span>
        </div>
        <div className="sr-meta-row">
          <span className="sr-meta-pill">
            <Clock size={11} /> {room.frequency} · {room.timing}
          </span>
          <span className="sr-meta-pill" style={{ color: privacy.color, borderColor: `${privacy.color}44` }}>
            <PrivIcon size={11} /> {privacy.label}
          </span>
        </div>
        <div className="sr-creator-row">
          <span className="sr-creator">Created by {room.creator}</span>
          <span className="sr-member-badge">
            <Users size={11} /> {room.members} members
          </span>
        </div>
        <p className="sr-reason">"{room.reason}"</p>
        <div className="sr-card-footer">
          {room.verified && (
            <span className="sr-verified-badge">
              <ShieldCheck size={12} /> Verified Safety Room
            </span>
          )}
          <div className="sr-score-chip">
            <Star size={11} /> {room.safetyScore}/100
          </div>
        </div>
        <button className="sr-join-btn" onClick={e => { e.stopPropagation(); onJoin(room); }}>
          Open Room <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════
   CREATE ROOM MODAL
   ══════════════════════════════════════════════ */
const CreateRoomModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    from: '', to: '', frequency: 'Daily',
    timing: '', reason: '', privacy: 'women_only',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from.trim() || !form.to.trim()) return;
    onCreate({
      id: `r-${Date.now()}`,
      from: form.from.trim(),
      to: form.to.trim(),
      creator: 'You',
      frequency: form.frequency,
      timing: form.timing || '—',
      mode: '—',
      distance: '—',
      eta: '—',
      members: 1,
      reason: form.reason.trim() || 'Looking for travel companions on this route.',
      privacy: form.privacy,
      safetyScore: 85,
      verified: false,
      color: '#E91E8C',
      createdOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      meetingPoint: '—',
      messages: [],
      travelling: [],
      membersList: [{ name: 'You', mode: '—', verified: false, status: 'travelling' }],
    });
    onClose();
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal anim-scale-in-spring" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h2 className="sr-modal-title">Create Safety Room</h2>
          <button className="sr-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form className="sr-modal-form" onSubmit={handleSubmit}>
          <div className="sr-form-section">
            <label className="sr-form-label">Route</label>
            <div className="sr-route-inputs">
              <div className="sr-input-wrap">
                <MapPin size={14} className="sr-input-icon" />
                <input className="sr-input" placeholder="Starting location" value={form.from} onChange={e => set('from', e.target.value)} required />
              </div>
              <div className="sr-route-connector"><ArrowRight size={16} /></div>
              <div className="sr-input-wrap">
                <Navigation size={14} className="sr-input-icon" />
                <input className="sr-input" placeholder="Destination" value={form.to} onChange={e => set('to', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Travel Frequency</label>
            <div className="sr-chip-group">
              {FREQUENCY_OPTIONS.map(f => (
                <button key={f} type="button" className={`sr-chip ${form.frequency === f ? 'sr-chip--active' : ''}`} onClick={() => set('frequency', f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Preferred Travel Time</label>
            <div className="sr-input-wrap">
              <Clock size={14} className="sr-input-icon" />
              <input className="sr-input" placeholder="e.g. 8:00 AM – 9:00 AM" value={form.timing} onChange={e => set('timing', e.target.value)} />
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Why are you creating this room?</label>
            <textarea className="sr-textarea" placeholder="e.g. I travel this route daily for work…" value={form.reason} onChange={e => set('reason', e.target.value)} rows={3} />
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Who can join?</label>
            <div className="sr-privacy-group">
              {PRIVACY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" className={`sr-privacy-btn ${form.privacy === value ? 'sr-privacy-btn--active' : ''}`} onClick={() => set('privacy', value)}>
                  <Icon size={15} /><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="sr-submit-btn"><Plus size={16} /> Create Room</button>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOM DETAIL — SUB-COMPONENTS
   ══════════════════════════════════════════════ */

/* 1. Room Header */
const RoomHeader = ({ room, onBack }) => (
  <header className="rd-header anim-slide-down">
    <div className="rd-header-top">
      <button className="sr-back-btn" onClick={onBack} aria-label="Back">
        <ChevronLeft size={20} /> Back
      </button>
      {room.verified && (
        <span className="rd-verified-chip"><ShieldCheck size={12} /> Verified Room</span>
      )}
    </div>

    {/* Accent bar */}
    <div className="rd-accent-bar" style={{ background: `linear-gradient(90deg, ${room.color}, transparent)` }} />

    {/* Route */}
    <div className="rd-route-row">
      <div className="rd-route-point rd-route-from">
        <MapPin size={14} style={{ color: room.color }} />
        <span>{room.from}</span>
      </div>
      <div className="rd-route-dashes" />
      <ArrowRight size={18} style={{ color: room.color, flexShrink: 0 }} />
      <div className="rd-route-dashes" />
      <div className="rd-route-point rd-route-to">
        <Navigation size={14} style={{ color: room.color }} />
        <span>{room.to}</span>
      </div>
    </div>

    {/* Stats row */}
    <div className="rd-stats-row">
      <div className="rd-stat-chip" style={{ '--chip-color': '#00E676' }}>
        <Star size={12} /> {room.safetyScore}/100
      </div>
      <div className="rd-stat-chip" style={{ '--chip-color': '#42A5F5' }}>
        <Route size={12} /> {room.distance}
      </div>
      <div className="rd-stat-chip" style={{ '--chip-color': '#FFB300' }}>
        <Clock size={12} /> {room.eta}
      </div>
      <div className="rd-stat-chip" style={{ '--chip-color': '#AB47BC' }}>
        <Bike size={12} /> {room.mode}
      </div>
    </div>

    {/* Creator + members */}
    <div className="rd-creator-row">
      <span className="rd-creator-label">Created by <strong>{room.creator}</strong></span>
      <span className="rd-members-chip"><Users size={12} /> {room.members} Members</span>
    </div>
  </header>
);

/* 2. Today's Status Card */
const StatusCard = ({ room }) => {
  const [travelling, setTravelling] = useState(false);
  const extras = Math.max(0, room.travelling.length - 3);

  return (
    <div className={`rd-status-card ${travelling ? 'rd-status-card--active' : ''}`}>
      <div className="rd-status-top">
        <div className="rd-status-text">
          <span className="rd-status-title">
            {travelling ? '✅ You\'re marked as travelling today!' : 'Travelling today?'}
          </span>
          <span className="rd-status-sub">
            {travelling ? 'Other members can see you are on the way.' : 'Let your room know you\'re heading out.'}
          </span>
        </div>
        <button
          className={`rd-travel-toggle ${travelling ? 'rd-travel-toggle--on' : ''}`}
          onClick={() => setTravelling(t => !t)}
        >
          {travelling ? 'Cancel' : "I'm Travelling Today"}
        </button>
      </div>

      <div className="rd-divider" />

      <div className="rd-active-travellers">
        <span className="rd-travellers-label">
          <Radio size={13} className="rd-live-pulse" /> Today's Active Travellers
        </span>
        <div className="rd-avatars-row">
          {room.travelling.slice(0, 3).map((t, i) => (
            <div key={i} className="rd-avatar-wrap" title={t.name}>
              <div className="rd-avatar">{t.name.charAt(0)}</div>
            </div>
          ))}
          {extras > 0 && <div className="rd-avatar rd-avatar--more">+{extras}</div>}
          {room.travelling.length === 0 && (
            <span className="rd-no-travellers">No one yet — be the first!</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* 3. Chat Section */
const ChatSection = ({ room }) => {
  const [messages, setMessages] = useState(room.messages);
  const [input, setInput]       = useState('');
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      author: 'You', text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      self: true,
    }]);
    setInput('');
  };

  return (
    <div className="rd-section">
      <div className="rd-section-label"><MessageCircle size={14} /> Group Chat</div>
      <div className="rd-chat-box">
        <div className="rd-chat-messages">
          {messages.length === 0 && (
            <div className="sr-chat-empty">
              <MessageCircle size={32} />
              <p>No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`sr-msg ${msg.self ? 'sr-msg--self' : ''}`}>
              {!msg.self && <span className="sr-msg-author">{msg.author}</span>}
              <div className="sr-msg-bubble">{msg.text}</div>
              <span className="sr-msg-time">{msg.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="sr-chat-input-row">
          <input
            className="sr-chat-input"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="sr-chat-send" onClick={send} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* 4. Quick Actions */
const QuickActions = ({ onBack }) => {
  const [reached, setReached]       = useState(false);
  const [locShared, setLocShared]   = useState(false);
  const [showLeave, setShowLeave]   = useState(false);

  const actions = [
    {
      id: 'location',
      icon: MapPin,
      label: locShared ? 'Location Shared' : 'Share Live Location',
      color: '#42A5F5',
      active: locShared,
      onClick: () => setLocShared(true),
    },
    {
      id: 'reached',
      icon: CheckCircle2,
      label: reached ? '✅ Marked Safe' : 'Mark Reached Safely',
      color: '#00E676',
      active: reached,
      onClick: () => setReached(true),
    },
    {
      id: 'sos',
      icon: Zap,
      label: 'Emergency SOS',
      color: '#FF1744',
      active: false,
      onClick: () => {},       // SOS flow handled by existing SOSButton globally
    },
    {
      id: 'leave',
      icon: LogOut,
      label: 'Leave Room',
      color: '#FF6B6B',
      active: false,
      onClick: () => setShowLeave(true),
    },
  ];

  return (
    <div className="rd-section">
      <div className="rd-section-label"><Zap size={14} /> Quick Actions</div>
      <div className="rd-actions-grid">
        {actions.map(({ id, icon: Icon, label, color, active, onClick }) => (
          <button
            key={id}
            className={`rd-action-btn ${active ? 'rd-action-btn--done' : ''}`}
            style={{ '--qa-color': color }}
            onClick={onClick}
            disabled={active && id !== 'leave'}
          >
            <div className="rd-action-icon"><Icon size={20} /></div>
            <span className="rd-action-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Leave confirmation */}
      {showLeave && (
        <div className="rd-confirm-overlay" onClick={() => setShowLeave(false)}>
          <div className="rd-confirm-box anim-scale-in-spring" onClick={e => e.stopPropagation()}>
            <LogOut size={28} style={{ color: '#FF6B6B' }} />
            <p className="rd-confirm-title">Leave Room?</p>
            <p className="rd-confirm-sub">You will no longer receive updates from this room.</p>
            <div className="rd-confirm-btns">
              <button className="rd-confirm-cancel" onClick={() => setShowLeave(false)}>Cancel</button>
              <button className="rd-confirm-danger" onClick={onBack}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 5. Members List */
const MembersList = ({ room }) => (
  <div className="rd-section">
    <div className="rd-section-label"><Users size={14} /> Members ({room.membersList.length})</div>
    <div className="rd-members-list">
      {room.membersList.map((m, i) => (
        <div key={i} className="rd-member-card">
          <div className="rd-member-avatar" style={{ background: m.status === 'travelling' ? 'linear-gradient(135deg,#00C853,#00E676)' : 'linear-gradient(135deg,#1E1E38,#2A2A50)' }}>
            {m.name.charAt(0)}
          </div>
          <div className="rd-member-info">
            <div className="rd-member-name-row">
              <span className="rd-member-name">{m.name}</span>
              {m.verified && <ShieldCheck size={12} className="rd-member-verified" />}
            </div>
            <span className="rd-member-mode"><Bike size={10} /> {m.mode}</span>
          </div>
          <span className={`rd-member-status ${m.status === 'travelling' ? 'rd-member-status--live' : ''}`}>
            {m.status === 'travelling' ? '🟢 Travelling' : '⚫ Offline'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* 6. Room Info Card */
const RoomInfoCard = ({ room }) => (
  <div className="rd-section">
    <div className="rd-section-label"><Info size={14} /> Room Information</div>
    <div className="rd-info-card">
      {[
        { label: 'Created On',      value: room.createdOn,    icon: CalendarDays },
        { label: 'Frequency',       value: room.frequency,    icon: Clock        },
        { label: 'Preferred Time',  value: room.timing,       icon: Clock        },
        { label: 'Travel Mode',     value: room.mode,         icon: Bike         },
        { label: 'Meeting Point',   value: room.meetingPoint, icon: MapPin       },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="rd-info-row">
          <div className="rd-info-icon"><Icon size={14} /></div>
          <div className="rd-info-text">
            <span className="rd-info-label">{label}</span>
            <span className="rd-info-value">{value}</span>
          </div>
        </div>
      ))}
      {/* Reason */}
      <div className="rd-info-reason">
        <span className="rd-info-label">Reason for Room</span>
        <p className="rd-info-reason-text">"{room.reason}"</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ROOM DETAIL — MAIN
   ══════════════════════════════════════════════ */
const RoomDetail = ({ room, onBack }) => (
  <div className="rd-page">
    <RoomHeader  room={room} onBack={onBack} />
    <div className="rd-scroll">
      <StatusCard   room={room} />
      <ChatSection  room={room} />
      <QuickActions onBack={onBack} />
      <MembersList  room={room} />
      <RoomInfoCard room={room} />
      {/* bottom breathing room */}
      <div style={{ height: 24 }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
const SafetyRoomsPage = () => {
  const [rooms, setRooms]             = useState(SEED_ROOMS);
  const [activeRoom, setActiveRoom]   = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [search, setSearch]           = useState('');
  const [joined, setJoined]           = useState(new Set());

  const handleJoin = (room) => {
    setJoined(prev => new Set([...prev, room.id]));
    setActiveRoom(room);
  };

  const handleCreate = (room) => {
    setRooms(prev => [room, ...prev]);
    setJoined(prev => new Set([...prev, room.id]));
  };

  const filteredRooms = rooms.filter(r => {
    const q = search.toLowerCase();
    if (!q) return showMyRooms ? joined.has(r.id) : true;
    const match = r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q);
    return showMyRooms ? joined.has(r.id) && match : match;
  });

  /* Inside-room view */
  if (activeRoom) {
    return (
      <div className="cp-page">
        <RoomDetail room={activeRoom} onBack={() => setActiveRoom(null)} />
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-scroll">

        {/* ── Header ── */}
        <header className="cp-header anim-slide-down">
          <div>
            <h1 className="cp-page-title">Safety Rooms</h1>
            <p className="cp-page-sub">Find people who travel the same routes as you</p>
          </div>
          <button className="cp-report-fab" id="sr-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create
          </button>
        </header>

        {/* ── Search ── */}
        <div className="sr-search-wrap anim-fade-in">
          <Search size={15} className="sr-search-icon" />
          <input
            className="sr-search-input"
            placeholder="Search by route or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Quick-action row ── */}
        <div className="sr-action-row anim-fade-in">
          <button className={`sr-action-btn ${!showMyRooms ? 'sr-action-btn--active' : ''}`} onClick={() => setShowMyRooms(false)}>
            <Globe size={14} /> All Rooms
          </button>
          <button className={`sr-action-btn ${showMyRooms ? 'sr-action-btn--active' : ''}`} onClick={() => setShowMyRooms(true)}>
            <UserPlus size={14} /> My Rooms {joined.size > 0 && <span className="sr-badge-dot">{joined.size}</span>}
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="cp-stats-bar anim-fade-in">
          <div className="cp-stat">
            <span className="cp-stat-num">{rooms.length}</span>
            <span className="cp-stat-label">Active Rooms</span>
          </div>
          <div className="cp-stat-divider" />
          <div className="cp-stat">
            <span className="cp-stat-num">{rooms.reduce((a, r) => a + r.members, 0)}</span>
            <span className="cp-stat-label">Total Members</span>
          </div>
          <div className="cp-stat-divider" />
          <div className="cp-stat">
            <span className="cp-stat-num">{joined.size}</span>
            <span className="cp-stat-label">Joined</span>
          </div>
        </div>

        {/* ── Rooms feed ── */}
        <section className="cp-feed">
          {filteredRooms.length === 0 ? (
            <div className="cp-empty">
              <Shield size={44} />
              <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                {showMyRooms ? "You haven't joined any rooms yet." : 'No rooms found for this route.'}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                {showMyRooms
                  ? 'Browse All Rooms and join one, or create your own.'
                  : 'Create the first Safety Room and invite travellers.'}
              </p>
              <button className="sr-submit-btn" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Create a Room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} onJoin={handleJoin} />
            ))
          )}
        </section>

      </div>

      {/* ── Create Room Modal ── */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default SafetyRoomsPage;
