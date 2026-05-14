import { Loader2 } from 'lucide-react';

const variants = {
  primary: {
    background: 'linear-gradient(135deg,#63F8B5 0%,#0BC1F4 60%,#2765F5 100%)',
    border: 'none', color: '#03080F',
    boxShadow: '0 0 24px rgba(11,193,244,0.2)',
  },
  secondary: {
    background: 'var(--surface3)', border: '1px solid var(--border-md)',
    color: 'var(--text)',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
  },
  ghost: {
    background: 'transparent', border: '1px solid transparent',
    color: 'var(--muted)',
  },
  outline: {
    background: 'transparent', border: '1px solid rgba(11,193,244,0.4)',
    color: 'var(--cyan)',
  },
};
const sizes = { sm:'8px 14px', md:'10px 18px', lg:'14px 28px', xl:'17px 40px' };
const fontSizes = { sm:11, md:12, lg:13, xl:14 };

export default function Button({ variant='primary', size='md', disabled=false, loading=false, onClick, children, className='', type='button', fullWidth=false, style={} }) {
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  return (
    <button type={type} onClick={onClick} disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: sizes[size], borderRadius: 10,
        fontFamily: 'var(--font-mono)', fontSize: fontSizes[size], fontWeight: 600, letterSpacing: '0.07em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1, width: fullWidth ? '100%' : undefined,
        transition: 'all 0.2s ease',
        ...v, ...style,
      }}
      className={className}
    >
      {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
