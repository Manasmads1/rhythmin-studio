/* ============================================================
   RhythmIn — Shared UI helpers
   Sidebar, theme toggle, icons, toast, modal, formatters
   ============================================================ */

// ---------- Icons (Lucide subset, inline SVG) ----------
const ICONS = {
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h2M8 6v12M12 3v18M16 8v8M20 11v2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>',
  record: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
  skipBack: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16zM5 4h2v16H5z"/></svg>',
  skipFwd: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zM17 4h2v16h-2z"/></svg>',
  loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/></svg>',
  metronome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22l-6-2 3-18h6l3 18-6 2z"/><path d="M12 14l4-8"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  wand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M15 9l-6 6M17.8 6.2l1.4-1.4M9.6 14.4L3 21"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  drum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="9" ry="3"/><path d="M3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6"/></svg>',
  guitar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3l3 3-6 6"/><circle cx="9" cy="15" r="6"/><circle cx="9" cy="15" r="1"/></svg>',
  piano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="1"/><path d="M6 4v10M10 4v10M14 4v10M18 4v10M2 14h20"/></svg>',
  wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2l2-8 3 16 3-12 3 8 3-4 4 2h2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  scissor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15zM5 15l.5 1.5L7 17l-1.5.5L5 19l-.5-1.5L3 17l1.5-.5L5 15z"/></svg>',
  volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>',
  volumeMute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"/></svg>',
  eq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="4" height="16"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="2" width="4" height="18"/></svg>',
  keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>'
};

function icon(name) { return ICONS[name] || ''; }

// ---------- Theme ----------
// Versioned preference prevents an older prototype setting from forcing a washed-out light mode.
// Dark is the intentional first-run default; light mode remains fully switchable from the shell/settings.
const THEME_KEY = 'rhythmin.theme.v2';
function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}
// Apply immediately to avoid flash
setTheme(getTheme());

// ---------- Sidebar ----------
const NAV_ITEMS = [
  { section: 'Workspace' },
  { id: 'home', label: 'Home', icon: 'home', href: '/index.html' },
  { id: 'dashboard', label: 'Projects', icon: 'folder', href: '/app/dashboard.html', kbd: 'P' },
  { section: 'Create' },
  { id: 'upload', label: 'Separate', icon: 'upload', href: '/app/upload.html', kbd: 'S' },
  { id: 'mixer', label: 'Mixer', icon: 'sliders', href: '/app/mixer.html', kbd: 'M' },
  { id: 'studio', label: 'Studio', icon: 'layers', href: '/app/studio.html', kbd: 'T' },
  { id: 'rebuild', label: 'Rebuild', icon: 'wand', href: '/app/rebuild.html', kbd: 'R' },
  { section: 'System' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/app/settings.html' }
];

function renderSidebar(activeId) {
  const base = window.location.pathname.includes('/app/') ? '..' : '.';
  const items = NAV_ITEMS.map(item => {
    if (item.section) {
      return `<div class="sidebar-section-label">${item.section}</div>`;
    }
    const href = base + item.href;
    const active = item.id === activeId ? 'active' : '';
    const kbd = item.kbd ? `<span class="kbd">${item.kbd}</span>` : '';
    return `<a href="${href}" class="sidebar-link ${active}" data-nav="${item.id}">
      ${icon(item.icon)}
      <span>${item.label}</span>
      ${kbd}
    </a>`;
  }).join('');

  return `
    <div class="sidebar">
      <a href="${base}/index.html" class="sidebar-brand">
        <span class="logo">${icon('logo')}</span>
        <span>RhythmIn</span>
      </a>
      <div class="sidebar-nav-wrap" style="overflow-y: auto; flex: 1;">
        ${items}
      </div>
      <div class="sidebar-footer">
        <span class="dot on pulse"></span>
        <span>Demo mode · v0.1</span>
      </div>
    </div>
  `;
}

// ---------- Top bar ----------
function renderTopbar({ crumbs = [], right = '' } = {}) {
  const crumbHtml = crumbs.map((c, i) => {
    const sep = i > 0 ? '<span class="sep">/</span>' : '';
    return `${sep}<span>${c}</span>`;
  }).join('');

  return `
    <div class="topbar">
      <div class="breadcrumb">${crumbHtml}</div>
      <div class="topbar-right">
        ${right}
        <button class="btn icon ghost" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">
          <span class="theme-icon">${getTheme() === 'dark' ? icon('sun') : icon('moon')}</span>
        </button>
      </div>
    </div>
  `;
}

function wireTopbar() {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      toggleTheme();
      const iconEl = btn.querySelector('.theme-icon');
      if (iconEl) iconEl.innerHTML = getTheme() === 'dark' ? icon('sun') : icon('moon');
    });
  }
}

// ---------- Transport bar ----------
function renderTransport({ tempo = 120, timeSig = '4/4', showRecord = false } = {}) {
  return `
    <div class="transport" id="transport">
      <div class="row" style="gap:4px">
        <button class="transport-btn" data-transport="rewind" title="Rewind">${icon('skipBack')}</button>
        <button class="transport-btn play" data-transport="play" title="Play/Pause (Space)">${icon('play')}</button>
        <button class="transport-btn" data-transport="stop" title="Stop">${icon('stop')}</button>
        ${showRecord ? `<button class="transport-btn" data-transport="record" title="Record" style="color:var(--meter-hi)">${icon('record')}</button>` : ''}
        <button class="transport-btn" data-transport="loop" title="Loop">${icon('loop')}</button>
      </div>
      <div class="vdivider"></div>
      <div class="timecode mono" id="timecode">00:00.000</div>
      <div class="vdivider"></div>
      <div class="row" style="gap:12px">
        <div class="col" style="gap:2px">
          <span class="label">Tempo</span>
          <span class="mono" style="font-size:13px" id="tempo-display">${tempo}<span style="color:var(--fg-3);font-size:10px"> BPM</span></span>
        </div>
        <div class="col" style="gap:2px">
          <span class="label">Time</span>
          <span class="mono" style="font-size:13px">${timeSig}</span>
        </div>
        <div class="col" style="gap:2px">
          <span class="label">Key</span>
          <span class="mono" style="font-size:13px">C min</span>
        </div>
      </div>
      <div class="grow"></div>
      <div class="row" style="gap:8px; align-items:center">
        <span class="label">Master</span>
        <div style="width:100px; height:8px; display:flex; gap:2px">
          <div class="meter" style="height:8px; width:100%" id="master-meter-l">
            <div class="meter-fill" style="width:100%"></div>
          </div>
        </div>
        <span class="mono-sm" id="master-db">−∞ dB</span>
      </div>
    </div>
  `;
}

// ---------- Toast ----------
function toast(msg, kind = 'info', duration = 3000) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  const color = kind === 'error' ? 'var(--meter-hi)' : kind === 'success' ? 'var(--meter-low)' : 'var(--accent-hi)';
  const ico = kind === 'error' ? icon('alert') : kind === 'success' ? icon('check') : icon('info');
  el.innerHTML = `<span style="color:${color}; display:inline-flex">${ico}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s';
    setTimeout(() => el.remove(), 200);
  }, duration);
}

// ---------- Modal ----------
function openModal(html) {
  let backdrop = document.querySelector('.modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = `<div class="modal">${html}</div>`;
  requestAnimationFrame(() => backdrop.classList.add('open'));
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  return backdrop.querySelector('.modal');
}
function closeModal() {
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => backdrop.remove(), 200);
  }
}

// ---------- Formatters ----------
function fmtTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
}
function fmtBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}
function fmtDb(gain) {
  if (gain <= 0) return '−∞';
  const db = 20 * Math.log10(gain);
  return db.toFixed(1);
}
function linearToDb(v) { return v <= 0 ? -Infinity : 20 * Math.log10(v); }
function dbToLinear(db) { return Math.pow(10, db / 20); }

// ---------- Boot helper ----------
function mountShell({ activeId, crumbs = [], showTransport = true, tempo = 120, timeSig = '4/4', showRecord = false, topbarRight = '' }) {
  const app = document.querySelector('.app');
  if (!app) return;
  app.insertAdjacentHTML('afterbegin', renderSidebar(activeId));
  const main = app.querySelector('.main');
  if (main) {
    main.insertAdjacentHTML('afterbegin', renderTopbar({ crumbs, right: topbarRight }));
  }
  if (showTransport) {
    app.insertAdjacentHTML('beforeend', renderTransport({ tempo, timeSig, showRecord }));
  }
  wireTopbar();
}

// Export for global use
window.RhythmIn = {
  icon, ICONS,
  getTheme, setTheme, toggleTheme,
  renderSidebar, renderTopbar, wireTopbar, renderTransport,
  toast, openModal, closeModal,
  fmtTime, fmtBytes, fmtDb, linearToDb, dbToLinear,
  mountShell,
  NAV_ITEMS
};
