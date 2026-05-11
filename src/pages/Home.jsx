import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ShieldCheck, ArrowRight, ArrowUpRight, Zap, Activity, Layers } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

/* ── Inline MetaMask fox SVG ── */
function FoxIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 35 33" fill="none">
      <path d="M32.958 1L19.4 10.93l2.52-5.928L32.958 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.03 1l13.448 10.02-2.396-6.017L2.03 1zM28.13 23.533l-3.61 5.53 7.73 2.128 2.22-7.537-6.34-.121zM.555 23.654l2.206 7.537 7.716-2.128-3.596-5.53-6.326.121z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.076 14.454l-2.16 3.267 7.686.342-.27-8.268-5.256 4.66zM24.907 14.454l-5.324-4.75-.175 8.36 7.672-.342-2.173-3.268zM10.477 29.063l4.62-2.249-3.986-3.104-.634 5.353zM19.886 26.814l4.633 2.249-.648-5.353-3.985 3.104z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24.519 29.063l-4.633-2.249.377 3.037-.04 1.26 4.296-2.048zM10.477 29.063l4.31 2.048-.027-1.26.35-3.037-4.633 2.249z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.854 21.99l-3.84-1.13 2.71-1.24 1.13 2.37zM20.127 21.99l1.13-2.37 2.724 1.24-3.854 1.13z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.477 29.063l.661-5.53-4.257.121 3.596 5.41zM23.844 23.533l.675 5.53 3.611-5.41-4.286-.12zM27.265 17.721l-7.672.342.714 3.927 1.13-2.37 2.724 1.24 3.104-3.14zM11.014 20.86l2.71-1.24 1.116 2.37.728-3.927-7.686-.342 3.132 3.14z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.916 17.721l3.224 6.286-.108-3.146-3.116-3.14zM23.967 20.861l-.121 3.146 3.237-6.286-3.116 3.14zM15.582 18.063l-.728 3.927.916 4.726.202-6.232-.39-2.421zM19.393 18.063l-.377 2.408.175 6.245.929-4.726-.727-3.927z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.127 21.99l-.929 4.726.661.46 4.002-3.118.121-3.146-3.855 1.078zM11.014 20.861l.108 3.146 4.002 3.118.661-.46-.916-4.726-3.855-1.078z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.2 31.111l.04-1.26-.35-.3h-5.31l-.323.3.027 1.26-4.31-2.048 1.507 1.236 3.06 2.128h5.216l3.073-2.128 1.48-1.236-4.11 2.048z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.886 26.814l-.661-.46h-3.476l-.661.46-.35 3.037.323-.3h5.31l.35.3-.835-3.037z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33.518 11.394l1.1-5.326L32.958 1 19.886 10.574l4.98 4.217 7.044 2.061 1.56-1.815-.674-.487 1.075-.98-.83-.647 1.075-.82-.6-.714zM.38 6.068l1.1 5.326-.7.527 1.088.82-.817.647 1.075.98-.674.487 1.546 1.815 7.043-2.061 4.98-4.217L2.03 1 .38 6.068z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M31.91 16.852l-7.044-2.061 2.16 3.267-3.236 6.286 4.257-.12h6.34l-2.477-7.372zM10.076 14.79L3.032 16.852.555 24.224h6.326l4.244.121-3.224-6.286 2.175-3.268zM19.393 18.063l.444-7.489 2.034-5.502h-9.04l2.007 5.502.472 7.49.148 2.435.014 6.218h3.475l.027-6.218.419-2.436z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ── Animated background with floating particles ── */
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mesh orbs */}
      <div className="orb w-[600px] h-[600px] top-[-200px] left-[-150px]"
        style={{ background: 'radial-gradient(circle, rgba(39,101,245,0.15) 0%, transparent 70%)' }} />
      <div className="orb w-[500px] h-[500px] top-[100px] right-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(11,193,244,0.12) 0%, transparent 70%)' }} />
      <div className="orb w-[400px] h-[400px] bottom-[0px] left-[30%]"
        style={{ background: 'radial-gradient(circle, rgba(39,245,200,0.08) 0%, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Diagonal accent lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0BC1F4" stopOpacity="0" />
            <stop offset="50%" stopColor="#0BC1F4" stopOpacity="1" />
            <stop offset="100%" stopColor="#0BC1F4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30%" x2="100%" y2="70%" stroke="url(#lineGrad)" strokeWidth="1" />
        <line x1="0" y1="60%" x2="100%" y2="20%" stroke="url(#lineGrad)" strokeWidth="0.5" />
      </svg>

      {/* Floating data nodes */}
      {[
        { x: '8%',  y: '20%', delay: '0s',   size: 6, label: 'TX: 0xa3f...' },
        { x: '88%', y: '15%', delay: '1.2s', size: 5, label: 'SPOT A4' },
        { x: '92%', y: '65%', delay: '2.4s', size: 7, label: '0.004 ETH' },
        { x: '5%',  y: '72%', delay: '0.8s', size: 5, label: 'LIBRE' },
        { x: '50%', y: '8%',  delay: '1.8s', size: 4, label: 'BLOCK #194' },
      ].map((node, i) => (
        <div key={i} className="absolute flex items-center gap-2 float"
          style={{ left: node.x, top: node.y, animationDelay: node.delay }}>
          <div className="rounded-full border border-[var(--border-hi)] blink"
            style={{ width: node.size * 2, height: node.size * 2,
              background: 'rgba(11,193,244,0.2)', boxShadow: '0 0 10px rgba(11,193,244,0.4)' }} />
          <span className="font-mono text-[10px] text-[var(--muted)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)] hidden lg:block">
            {node.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ transparent, token }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const solid = !transparent || scrolled;
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      transition: 'all 0.3s ease',
      background: solid ? 'rgba(3,8,15,0.92)' : 'transparent',
      backdropFilter: solid ? 'blur(24px)' : 'none',
      borderBottom: solid ? '1px solid rgba(39,101,245,0.18)' : 'none',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: 'linear-gradient(135deg, #0BC1F4 0%, #2765F5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(11,193,244,0.4)',
        }}>
          <Zap size={16} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: 1 }}>
          PARK<span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHAIN</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {token ? (
          <button onClick={() => navigate('/dashboard')} style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
            color: 'var(--cyan)', padding: '8px 20px', borderRadius: 8,
            background: 'rgba(11,193,244,0.08)', border: '1px solid rgba(11,193,244,0.3)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            TABLEAU DE BORD →
          </button>
        ) : (
          <Link to="/login" style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
            color: 'white', padding: '8px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, #63F8B5 0%, #0BC1F4 100%)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 0 20px rgba(11,193,244,0.2)',
          }}>
            CONNEXION
          </Link>
        )}
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onCTA, connected, loading }) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <HeroBg />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 820, width: '100%', textAlign: 'center' }}>

        {/* Status pill */}
        <div className="fade-up" style={{ animationDelay: '0s', display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 18px', borderRadius: 999, marginBottom: 32,
          background: 'rgba(11,193,244,0.08)', border: '1px solid rgba(11,193,244,0.25)' }}>
          <span className="blink" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--spring)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', letterSpacing: '0.12em' }}>
            RÉSEAU GANACHE · SMART CONTRACT ACTIF
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up font-display" style={{ animationDelay: '0.1s', lineHeight: 1.05, marginBottom: 20, fontWeight: 900 }}>
          <span style={{ display: 'block', fontSize: 'clamp(52px, 9vw, 96px)', color: 'white', letterSpacing: '-0.02em' }}>
            Stationnement
          </span>
          <span className="grad-text-full" style={{ display: 'block', fontSize: 'clamp(52px, 9vw, 96px)', letterSpacing: '-0.02em' }}>
            Décentralisé.
          </span>
        </h1>

        {/* Subline */}
        <p className="fade-up" style={{ animationDelay: '0.2s', fontSize: 18, color: 'var(--muted)', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.7 }}>
          Réservez et payez votre place directement sur la blockchain.
          Transparent, vérifiable, sans intermédiaire.
        </p>

        {/* CTA buttons */}
        <div className="fade-up" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {connected ? (
            <button onClick={onCTA} className="btn-primary"
              style={{ padding: '16px 40px', borderRadius: 12, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={16} /> ACCÉDER AU TABLEAU DE BORD
            </button>
          ) : (
            <button onClick={onCTA} disabled={loading} className="btn-metamask"
              style={{ padding: '16px 40px', borderRadius: 12, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><span className="blink">●</span> CONNEXION EN COURS…</>
                : <><FoxIcon size={22} /> CONNECTER METAMASK</>
              }
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted2)', letterSpacing: '0.08em' }}>
            Aucune inscription · Connexion via portefeuille Ethereum
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted2)', letterSpacing: '0.2em' }}>
          DÉFILER
        </span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--muted2), transparent)' }} />
      </div>
    </section>
  );
}

/* ── How it Works ── */
const STEPS = [
  {
    num: '01',
    icon: <MapPin size={22} />,
    color: '#63F8B5',
    colorBg: 'rgba(99,248,181,0.08)',
    colorBorder: 'rgba(99,248,181,0.25)',
    title: 'Choisissez une place',
    desc: 'Visualisez en temps réel les places disponibles sur la carte 3D interactive. Sélectionnez celle qui vous convient.',
  },
  {
    num: '02',
    icon: <FoxIcon size={22} />,
    color: '#F4640B',
    colorBg: 'rgba(244,100,11,0.08)',
    colorBorder: 'rgba(244,100,11,0.30)',
    title: <><span style={{ color: '#F4640B' }}>MetaMask</span> paie en ETH</>,
    desc: 'Confirmez le paiement via votre portefeuille MetaMask. Le smart contract enregistre la transaction de façon immuable.',
    metamask: true,
  },
  {
    num: '03',
    icon: <ShieldCheck size={22} />,
    color: '#0BC1F4',
    colorBg: 'rgba(11,193,244,0.08)',
    colorBorder: 'rgba(11,193,244,0.25)',
    title: 'Garez-vous sereinement',
    desc: 'Votre réservation est cryptographiquement prouvée sur la blockchain. Consultable à tout moment.',
  },
];

function HowItWorks() {
  return (
    <section style={{ padding: '120px 24px', position: 'relative' }}>
      {/* Section bg accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(11,193,244,0.4), transparent)'
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', letterSpacing: '0.15em' }}>
              PROCESSUS
            </span>
            <h2 className="font-display" style={{ fontSize: 44, fontWeight: 800, color: 'white', marginTop: 8, letterSpacing: '-0.02em' }}>
              Comment ça<br /><span className="grad-text">fonctionne</span>
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.7 }}>
            Trois étapes simples pour réserver votre stationnement de façon décentralisée.
          </span>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {STEPS.map(({ num, icon, color, colorBg, colorBorder, title, desc, metamask }) => (
            <div key={num} style={{
              position: 'relative', padding: 32, borderRadius: 20,
              background: metamask
                ? 'linear-gradient(145deg, rgba(244,100,11,0.06) 0%, rgba(8,21,37,0.95) 100%)'
                : 'rgba(8,21,37,0.8)',
              border: `1px solid ${colorBorder}`,
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: metamask ? '0 0 40px rgba(244,100,11,0.08)' : '0 0 0 transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${colorBg}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = metamask ? '0 0 40px rgba(244,100,11,0.08)' : '0 0 0 transparent'; }}
            >
              {/* Step number */}
              <span style={{ position: 'absolute', top: 20, right: 24,
                fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700,
                color: colorBorder, lineHeight: 1, userSelect: 'none' }}>
                {num}
              </span>

              {/* Icon */}
              <div style={{ width: 52, height: 52, borderRadius: 14, background: colorBg,
                border: `1px solid ${colorBorder}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 24, color }}>
                {icon}
              </div>

              {/* Title */}
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>
                {title}
              </h3>

              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{desc}</p>

              {/* MetaMask orange bar */}
              {metamask && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, transparent, #F4640B, transparent)',
                  borderRadius: '0 0 20px 20px' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features strip ── */
const FEATURES = [
  { icon: <Activity size={18} />, label: 'Temps réel', desc: 'Actualisation toutes les 3 secondes', color: 'var(--spring)' },
  { icon: <Layers size={18} />, label: 'On-chain', desc: 'Chaque transaction est immuable', color: 'var(--cyan)' },
  { icon: <ShieldCheck size={18} />, label: 'Sécurisé', desc: 'Smart contract auditable', color: 'var(--teal)' },
  { icon: <Zap size={18} />, label: 'IoT ready', desc: 'Capteurs Raspberry Pi Pico', color: '#2765F5' },
];

function Features() {
  return (
    <section style={{ padding: '0 24px 100px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 1, borderRadius: 20, overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--border)',
        }}>
          {FEATURES.map(({ icon, label, desc, color }) => (
            <div key={label} style={{
              padding: '32px 28px', background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', gap: 12,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{ color, display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon}
                <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Live Stats ── */
function LiveStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = async () => {
      try { const { data } = await api.get('/stats'); setStats(data); }
      catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
  if (!stats) return null;

  return (
    <section style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(39,101,245,0.04) 50%, transparent 100%)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }} />
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted2)', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 48 }}>
          STATISTIQUES EN DIRECT
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { val: stats.total_spots, label: 'PLACES TOTALES', color: 'white' },
            { val: stats.available_spots, label: 'DISPONIBLES', color: 'var(--spring)' },
            { val: stats.total_transactions, label: 'TRANSACTIONS', color: 'var(--cyan)' },
          ].map(({ val, label, color }) => (
            <div key={label}>
              <div className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, color, lineHeight: 1 }}>
                <Counter target={val} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 10, letterSpacing: '0.12em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner({ onCTA, connected, loading }) {
  return (
    <section style={{ padding: '80px 24px 120px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          padding: '64px 48px', borderRadius: 28,
          background: 'linear-gradient(145deg, rgba(39,101,245,0.12) 0%, rgba(11,193,244,0.06) 50%, rgba(8,21,37,0.98) 100%)',
          border: '1px solid var(--border-hi)',
          boxShadow: '0 0 80px rgba(11,193,244,0.07)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(11,193,244,0.12) 0%, transparent 70%)',
            pointerEvents: 'none' }} />

          <h2 className="font-display" style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.01em' }}>
            Prêt à vous garer<br />intelligemment ?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.7 }}>
            Connectez votre portefeuille <span style={{ color: '#F4640B', fontWeight: 600 }}>MetaMask</span> et réservez votre place en quelques secondes.
          </p>

          {connected ? (
            <button onClick={onCTA} className="btn-primary"
              style={{ padding: '16px 44px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              ACCÉDER AU TABLEAU DE BORD <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={onCTA} disabled={loading} className="btn-metamask"
              style={{ padding: '16px 44px', borderRadius: 12, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 12, opacity: loading ? 0.7 : 1 }}>
              <FoxIcon size={22} />
              {loading ? 'CONNEXION…' : 'CONNECTER METAMASK'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS;
  return (
    <footer style={{
      borderTop: '1px solid var(--border)', padding: '32px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
      background: 'rgba(6,14,26,0.9)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6,
          background: 'linear-gradient(135deg, #0BC1F4 0%, #2765F5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={12} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted2)', letterSpacing: '0.08em' }}>
          PARKCHAIN © 2024 — SYSTÈME DE STATIONNEMENT DÉCENTRALISÉ
        </span>
      </div>
      {addr && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted2)' }}>
          CONTRACT: {addr.slice(0,10)}…{addr.slice(-6)}
        </span>
      )}
    </footer>
  );
}

/* ── Page ── */
export default function Home() {
  const { connectWallet, token, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleCTA() {
    if (token) { navigate('/dashboard'); return; }
    await connectWallet();
    if (token && !user?.first_name) navigate('/login');
    else if (token) navigate('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      <Navbar transparent token={token} />
      <Hero onCTA={handleCTA} connected={!!token} loading={loading} />
      <HowItWorks />
      <Features />
      <LiveStats />
      <CTABanner onCTA={handleCTA} connected={!!token} loading={loading} />
      <Footer />
    </div>
  );
}
