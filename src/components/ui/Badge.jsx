const colors = {
  gray:  { bg:'rgba(107,114,128,0.12)', color:'var(--muted)', border:'rgba(107,114,128,0.25)' },
  green: { bg:'rgba(99,248,181,0.12)',  color:'#63F8B5',      border:'rgba(99,248,181,0.30)' },
  amber: { bg:'rgba(250,204,21,0.12)',  color:'#facc15',      border:'rgba(250,204,21,0.30)' },
  red:   { bg:'rgba(239,68,68,0.12)',   color:'#ef4444',      border:'rgba(239,68,68,0.30)' },
  blue:  { bg:'rgba(59,130,246,0.12)',  color:'#3b82f6',      border:'rgba(59,130,246,0.30)' },
};
export default function Badge({ color='gray', children, className='' }) {
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 5,
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }} className={className}>
      {children}
    </span>
  );
}
