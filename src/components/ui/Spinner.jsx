const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-14 h-14 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`
      ${sizes[size]}
      rounded-full
      border-emerald-500/20 border-t-emerald-500
      animate-spin
      ${className}
    `} />
  );
}
