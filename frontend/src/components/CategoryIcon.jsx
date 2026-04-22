// Farby kategórií — bg, text, accent
export const CATEGORY_COLORS = {
  kas:    { bg: '#FAEEDA', color: '#633806', accent: '#BA7517' },
  pc:     { bg: '#E6F1FB', color: '#0C447C', accent: '#185FA5' },
  inet:   { bg: '#EEEDFE', color: '#3C3489', accent: '#534AB7' },
  skener: { bg: '#E1F5EE', color: '#085041', accent: '#0F6E56' },
};

export function CategoryIcon({ icon, catId }) {
  const colors = CATEGORY_COLORS[catId] || { bg: '#E1F5EE', color: '#085041' };

  return (
    <span
      className="category-icon"
      style={{ background: colors.bg, color: colors.color }}
    >
      {icon === 'receipt'  && <IconKasa />}
      {icon === 'monitor'  && <IconMonitor />}
      {icon === 'wifi'     && <IconInternet />}
      {icon === 'scan'     && <IconSkener />}
    </span>
  );
}

function IconKasa() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <rect x="4" y="8" width="20" height="14" rx="3"
            stroke="currentColor" strokeWidth="1.8"/>
      <rect x="7" y="11" width="8" height="4" rx="1"
            fill="currentColor" opacity="0.2"/>
      <circle cx="20" cy="17" r="2" fill="currentColor"/>
      <rect x="9" y="4" width="10" height="5" rx="1"
            stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <rect x="3" y="4" width="22" height="15" rx="2"
            stroke="currentColor" strokeWidth="1.8"/>
      <rect x="5" y="6" width="18" height="11" rx="1"
            fill="currentColor" opacity="0.12"/>
      <rect x="10" y="19" width="8" height="2" rx="1"
            fill="currentColor"/>
      <rect x="8" y="21" width="12" height="2" rx="1"
            stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function IconInternet() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10"
              stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 14h20M14 4c-3.5 3-5 6.5-5 10s1.5 7 5 10c3.5-3 5-6.5 5-10s-1.5-7-5-10z"
            stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function IconSkener() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <rect x="3" y="6" width="22" height="16" rx="3"
            stroke="currentColor" strokeWidth="1.8"/>
      <line x1="7"  y1="10" x2="7"  y2="18" stroke="currentColor" strokeWidth="2"/>
      <line x1="11" y1="10" x2="11" y2="18" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="14" y1="10" x2="14" y2="18" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="18" y1="10" x2="18" y2="18" stroke="currentColor" strokeWidth="1"/>
      <line x1="21" y1="10" x2="21" y2="18" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}
