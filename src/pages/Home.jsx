import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

function HeroSection({ onCTA, connected, loading }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 hex-bg overflow-hidden">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full border border-emerald-500/5 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-emerald-500/8 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/12 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 blink" />
          <span className="font-mono text-xs text-emerald-400 tracking-widest">RÉSEAU DÉCENTRALISÉ · GANACHE</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold mb-6 leading-tight animate-slide-up">
          <span className="block text-5xl sm:text-7xl text-white">
            Stationnement
          </span>
          <span className="block text-5xl sm:text-7xl gradient-text">
            Intelligent
          </span>
        </h1>

        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Réservez et payez votre place de parking directement sur la blockchain. Transparent, rapide, sans intermédiaire.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="xl"
            loading={loading}
            onClick={onCTA}
            className="min-w-[220px]"
          >
            {connected ? (
              <><LayoutDashboard size={16} /> TABLEAU DE BORD</>
            ) : (
              <><Zap size={16} /> CONNECTER METAMASK</>
            )}
          </Button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-mono text-[var(--muted)] hover:text-white transition-colors"
          >
            ⌥ Code source <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-[var(--muted2)] tracking-widest">DÉFILER</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--muted2)] to-transparent" />
      </div>
    </section>
  );
}

// Needed for HeroSection
function LayoutDashboard({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

const STEPS = [
  {
    icon: <MapPin size={24} className="text-emerald-400" />,
    step: '01',
    title: 'Choisissez une place',
    desc: 'Visualisez en temps réel les places disponibles sur la carte 3D interactive.',
  },
  {
    icon: <CreditCard size={24} className="text-blue-400" />,
    step: '02',
    title: 'Payez en ETH',
    desc: 'Confirmez le paiement via MetaMask. Le smart contract enregistre la transaction.',
  },
  {
    icon: <ShieldCheck size={24} className="text-yellow-400" />,
    step: '03',
    title: 'Garez-vous en toute sécurité',
    desc: 'Votre réservation est cryptographiquement prouvée et consultable sur la blockchain.',
  },
];

function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-emerald-400 tracking-widest">PROCESSUS</span>
          <h2 className="font-display font-bold text-3xl text-white mt-3">Comment ça fonctionne</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon, step, title, desc }) => (
            <div key={step} className="relative p-6 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] hover:border-emerald-500/30 transition-all group">
              <div className="absolute top-4 right-4 font-mono text-4xl font-bold text-[var(--border)] group-hover:text-emerald-500/20 transition-colors select-none">
                {step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--surface3)] border border-[var(--border)] flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveStatsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/stats');
        setStats(data);
      } catch { /* silent fail */ }
    }
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (!stats) return null;

  return (
    <section className="py-10 border-y border-[var(--border)] bg-[var(--surface)]/50">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
        {[
          { label: 'PLACES TOTALES',       value: stats.total_spots },
          { label: 'DISPONIBLES',           value: stats.available_spots,   color: 'text-emerald-400' },
          { label: 'TRANSACTIONS',          value: stats.total_transactions, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className={`font-mono font-bold text-4xl sm:text-5xl ${color || 'text-white'} mb-1`}>
              {value ?? '—'}
            </div>
            <div className="font-mono text-xs text-[var(--muted)] tracking-widest">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS;
  return (
    <footer className="py-12 px-6 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-[var(--muted2)] tracking-widest">
          PARK<span className="text-emerald-500/60">CHAIN</span> — SYSTÈME DE STATIONNEMENT DÉCENTRALISÉ
        </span>
        {addr && (
          <span className="font-mono text-xs text-[var(--muted2)] break-all text-right">
            CONTRACT: {addr.slice(0, 10)}…{addr.slice(-6)}
          </span>
        )}
      </div>
    </footer>
  );
}

export default function Home() {
  const { connectWallet, token, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleCTA() {
    if (token) {
      navigate('/dashboard');
      return;
    }
    await connectWallet();
    // After connect, check if profile is complete
    if (token && !user?.first_name) navigate('/login');
    else if (token) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="scanline" />
      <Navbar transparent />
      <HeroSection onCTA={handleCTA} connected={!!token} loading={loading} />
      <HowItWorks />
      <LiveStatsStrip />
      <Footer />
    </div>
  );
}
