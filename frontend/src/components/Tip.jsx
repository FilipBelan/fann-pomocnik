const TIP_CONFIG = {
  info:   { icon: '💡', className: 'tip-info' },
  warn:   { icon: '⚠',  className: 'tip-warn' },
  danger: { icon: '⚠',  className: 'tip-danger' },
  ok:     { icon: '✓',  className: 'tip-ok' },
};

export default function Tip({ type, text }) {
  if (!text) return null;
  const config = TIP_CONFIG[type] || TIP_CONFIG.info;
  return (
    <div className={`tip-box ${config.className}`}>
      <span className="tip-icon" aria-hidden="true">{config.icon}</span>
      <p className="tip-text">{text}</p>
    </div>
  );
}
