import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import fox from '../components/ui/Fox.jpg';
import logo from '../components/ui/logo.png';
import './login.css';

const GUIDE_NOTE =
  "Nouveau ici ? Connecter votre portefeuille crée votre compte SmartPark — sans mot de passe, sans e-mail. Vous signerez un message gratuit pour prouver votre identité ; ce n'est pas une transaction et n'engendre aucuns frais.";

// ── Animated background placeholder (swap <source> with your .mp4 later) ──
function VideoLayer() {
  const particles = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      dur: 14 + Math.random() * 22,
      delay: -Math.random() * 30,
      hue: Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent-2)',
    }))
  ).current;

  return (
    <div className="sp-video-layer">
      {/* <video id="bg-video" className="sp-bg-video" autoPlay muted loop playsInline> */}
        {/* <source src={foxVideo} type="image" /> */}
        <div className='bg-img'>
            <img src={fox} alt="fox" />
        </div>
       

      {/* </video> */}

      <div className="sp-video-placeholder">
        <div className="sp-vp-grad sp-vp-grad-a" />
        <div className="sp-vp-grad sp-vp-grad-b" />
        <div className="sp-vp-scan" />
        <div className="sp-vp-grid" />
        <div className="sp-vp-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                left: p.left + '%',
                top: p.top + '%',
                width: p.size + 'px',
                height: p.size + 'px',
                background: p.hue,
                animationDuration: p.dur + 's',
                animationDelay: p.delay + 's',
              }}
            />
          ))}
        </div>
      </div>


    </div>
  );
}

// ── Generic geometric wallet glyph (not MetaMask-branded) ──
function WalletMark() {
  return (
    <svg className="sp-wallet-mark" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="12.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return <span className="sp-spinner" aria-hidden="true" />;
}

function Step({ n, label, active, done }) {
  return (
    <span className={`sp-step${active ? ' active' : ''}${done ? ' done' : ''}`}>
      <span className="sp-step-n">{done ? '✓' : n}</span>
      <span>{label}</span>
    </span>
  );
}

function truncate(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

// ── Main connect card ──
function ConnectPanel() {
  const navigate = useNavigate();
  const { connectWallet, logout, user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const after = (ms, fn) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  // Show connected state if user is already set (edge-case; App.jsx redirects anyway)
  useEffect(() => {
    if (user) setStatus('connected');
  }, [user]);

  async function connect() {
    if (status !== 'idle') return;
    setStatus('connecting');
    await connectWallet();
    // Reached only if connection failed (success → App.jsx redirects + unmounts this page)
    setStatus('idle');
  }

  function disconnect() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    logout();
    setStatus('idle');
    setCopied(false);
  }

  function copyAddr() {
    const addr = user?.wallet_address || '';
    navigator.clipboard?.writeText(addr).catch(() => { });
    setCopied(true);
    after(1400, () => setCopied(false));
  }

  const busy = status === 'connecting';
  const addr = user?.wallet_address || user?.address || '';

  return (
    <section className="sp-panel sp-panel-holo" aria-label="Se connecter à SmartPark">
      {/* <div className="sp-panel-glow" aria-hidden="true" /> */}

      <div className="sp-panel-inner">
        {/* Brand */}
        <div className="sp-brand">
          <div className="sp-brand-logo">
            {/* <span className="sp-brand-logo-tag"></span> */}
            <source src={logo} type="image" />
          </div>
          <div className="sp-brand-text">
            <h1 className="sp-brand-name">SmartPark</h1>
            <p className="sp-brand-kicker">Réseau de stationnement décentralisé</p>
          </div>
        </div>

        <div className="sp-rule" />

        {status !== 'connected' ? (
          <>
            <div className="sp-lead">
              <p className="sp-lead-title">
                {!busy && 'Connectez votre portefeuille pour continuer'}
                {busy && 'Ouverture de MetaMask…'}
              </p>
              <p className="sp-lead-sub">
                {!busy && 'Connectez-vous à SmartPark avec votre portefeuille Web3.'}
                {busy && 'Approuvez la demande de connexion dans la fenêtre.'}
              </p>
            </div>

            <button
              className={`sp-btn sp-btn-primary${busy ? ' is-busy' : ''}`}
              onClick={connect}
              disabled={busy}
            >
              {busy ? <Spinner /> : <WalletMark />}
              <span>
                {!busy && 'Connecter MetaMask'}
                {busy && 'Connexion…'}
              </span>
            </button>

            {busy && (
              <div className="sp-steps" aria-hidden="true">
                <Step n="1" label="Portefeuille" active done={false} />
                <span className="sp-steps-line" />
                <Step n="2" label="Connexion" active={false} done={false} />
              </div>
            )}

            <p className="sp-note">{GUIDE_NOTE}</p>

            <p className="sp-alt">
              Vous n&apos;avez pas de portefeuille ?{' '}
              <a
                className="sp-link"
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
              >
                Obtenir MetaMask
              </a>
            </p>
          </>
        ) : (
          <div className="sp-connected">
            <div className="sp-ok-ring" aria-hidden="true">
              <span className="sp-ok-check" />
            </div>
            <p className="sp-lead-title is-centered">Portefeuille connecté</p>

            <div
              className="sp-acct"
              onClick={copyAddr}
              role="button"
              tabIndex={0}
              title="Copier l'adresse"
            >
              <span className="sp-acct-avatar" aria-hidden="true" />
              <span className="sp-acct-addr">{truncate(addr)}</span>
              <span className="sp-acct-copy">{copied ? 'Copié ✓' : 'Copier'}</span>
            </div>

            <div className="sp-meta-row">
              <span className="sp-chip"><span className="sp-chip-dot" />Ganache Local</span>
              <span className="sp-chip">0.0 ETH</span>
              <span className="sp-chip">Vérifié</span>
            </div>

            <button className="sp-btn sp-btn-primary" onClick={() => navigate('/')}>
              <span>Entrer dans SmartPark</span>
              <span className="sp-arrow">→</span>
            </button>
            <button className="sp-btn sp-btn-ghost" onClick={disconnect}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Login() {
  return (
    <div className="sp-stage">
      <VideoLayer />

      <Link to="/" className="sp-back-home" aria-label="Retour à l'accueil">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        <span>Accueil</span>
      </Link>

      <main className="sp-center">
        <ConnectPanel />
      </main>

      <footer className="sp-page-foot">
        <span>SmartPark</span>
        <span className="sp-dot-sep">·</span>
        <span>Accès Web3 sécurisé</span>
        <span className="sp-dot-sep">·</span>
        <span>v0.1</span>
      </footer>
    </div>
  );
}
