const colors = {
  gray:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  red:    'bg-red-500/15 text-red-400 border-red-500/30',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1
      px-2 py-0.5 rounded text-xs font-mono font-medium
      border tracking-wider
      ${colors[color]}
      ${className}
    `}>
      {children}
    </span>
  );
}
