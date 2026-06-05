import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, User, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useDebt } from '../../hooks/useDebt';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar({ transparent = false }) {
  const { token, shortAddress, logout } = useWallet();
  const { debt } = useDebt();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      transition: 'all 0.3s ease',
      background: solid ? 'var(--nav-bg)' : 'transparent',
      backdropFilter: solid ? 'blur(24px)' : 'none',
      borderBottom: solid ? '1px solid var(--nav-border)' : 'none',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg, #0BC1F4, #2765F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(11,193,244,0.4)',
          flexShrink: 0,
        }}>
          <Zap size={16} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text)', letterSpacing: 1 }}>
          PARK<span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHAIN</span>
        </span>
      </Link>

      {/* Center nav links — authenticated only */}
      {token && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
            color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <LayoutDashboard size={13} /> TABLEAU DE BORD
          </Link>
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
            color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <User size={13} /> PROFIL
          </Link>
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />

        {token ? (
          <>
            {debt > 0 && (
              <button onClick={() => navigate('/dashboard')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8,
                background: 'rgba(244,100,11,0.10)', border: '1px solid rgba(244,100,11,0.35)',
                color: '#F4640B', fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <AlertTriangle size={12} />
                DETTE: {debt.toFixed(4)} ETH
              </button>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 8,
              background: 'var(--surface3)', border: '1px solid var(--border-md)',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--spring)', animation: 'blink 1.8s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{shortAddress}</span>
            </div>

            <button onClick={logout} title="Déconnexion" style={{
              padding: 8, borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <Link to="/login" style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
            color: 'white', padding: '7px 18px', borderRadius: 8,
            background: 'linear-gradient(135deg, #63F8B5 0%, #0BC1F4 100%)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 0 16px rgba(11,193,244,0.2)', fontWeight: 600,
          }}>
            CONNEXION
          </Link>
        )}
      </div>
    </nav>
  );
}
