import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, User, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useDebt } from '../hooks/useDebt';
import Button from './ui/Button';

export default function Navbar({ transparent = false }) {
  const { token, shortAddress, logout } = useWallet();
  const { debt } = useDebt();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 h-16
      flex items-center justify-between px-6
      transition-all duration-300
      ${solid
        ? 'bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)]'
        : 'bg-transparent'
      }
    `}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
          <Zap size={16} className="text-emerald-400" />
        </div>
        <span className="font-mono font-bold text-sm tracking-widest">
          PARK<span className="text-emerald-400">CHAIN</span>
        </span>
      </Link>

      {/* Center links */}
      {token && (
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-[var(--muted)] hover:text-emerald-400 transition-colors">
            <LayoutDashboard size={13} />
            TABLEAU DE BORD
          </Link>
          <Link to="/profile" className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-[var(--muted)] hover:text-emerald-400 transition-colors">
            <User size={13} />
            PROFIL
          </Link>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {token ? (
          <>
            {/* Debt badge */}
            {debt > 0 && (
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all"
              >
                <AlertTriangle size={12} />
                DETTE: {debt.toFixed(4)} ETH
              </button>
            )}

            {/* Address chip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface3)] border border-[var(--border-light)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 blink" />
              <span className="font-mono text-xs text-[var(--muted)]">{shortAddress}</span>
            </div>

            {/* Disconnect */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm">
              CONNECTER
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
