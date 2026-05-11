import { Loader2 } from 'lucide-react';

const variants = {
  primary: `
    bg-emerald-500 hover:bg-emerald-400 text-white
    border border-emerald-400/50
    shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]
  `,
  secondary: `
    bg-[var(--surface3)] hover:bg-[var(--border)] text-[var(--text)]
    border border-[var(--border-light)] hover:border-emerald-500/40
  `,
  danger: `
    bg-red-500/10 hover:bg-red-500/20 text-red-400
    border border-red-500/30 hover:border-red-500/50
  `,
  ghost: `
    bg-transparent hover:bg-[var(--surface3)] text-[var(--muted)]
    hover:text-[var(--text)] border border-transparent
  `,
  outline: `
    bg-transparent hover:bg-emerald-500/10 text-emerald-400
    border border-emerald-500/40 hover:border-emerald-500/70
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
  fullWidth = false,
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-mono font-medium tracking-wider rounded-lg
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
