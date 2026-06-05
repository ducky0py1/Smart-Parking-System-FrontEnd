import { Zap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'linear-gradient(135deg, #0BC1F4, #2765F5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 32px rgba(11,193,244,0.4)',
        animation: 'float 2.4s ease-in-out infinite',
      }}>
        <Zap size={24} color="white" />
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em',
        color: 'var(--muted)',
      }}>
        PARKCHAIN
      </div>
      <div style={{
        width: 120, height: 2, borderRadius: 2,
        background: 'var(--surface3)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'var(--grad-primary)',
          animation: 'shimmer 1.5s ease-in-out infinite',
          backgroundSize: '200% 100%',
        }} />
      </div>
    </div>
  );
}
