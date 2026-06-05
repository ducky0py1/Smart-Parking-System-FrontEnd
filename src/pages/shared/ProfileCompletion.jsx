export default function ProfileCompletion() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 13,
        letterSpacing: '0.12em', color: 'var(--muted)', textAlign: 'center',
      }}>
        PROFILE COMPLETION — COMING SOON
      </div>
    </div>
  );
}
