import { Zap } from 'lucide-react';

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center', padding: 40,
        fontFamily: 'var(--font-mono)', color: 'var(--muted)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #0BC1F4, #2765F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Zap size={22} color="white" />
        </div>
        <div style={{ fontSize: 13, letterSpacing: '0.12em' }}>LOGIN PAGE — COMING SOON</div>
      </div>
    </div>
  );
}
