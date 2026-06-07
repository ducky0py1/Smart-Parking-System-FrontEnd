import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, MapPin, Coins, Car, ShieldCheck, Zap,
  LayoutDashboard, Radio, Sun, Moon, Check, Loader2,
  TrendingUp, Activity, AlertTriangle, Box, Lock,
  Github, Linkedin,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ParkingScene3D from '../components/three/ParkingScene3D';
import './home.css';
import logo from '../components/ui/logo.png'
// ── Shared animation presets ──────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

function heroAnim(delay = 0) {
  return {
    initial: { opacity: 0, y: 34 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  };
}

function revealAnim(delay = 0) {
  return {
    initial: { opacity: 0, y: 34 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' },
    transition: { duration: 0.8, delay, ease: EASE },
  };
}

// ── Count-up component ────────────────────────────────────────
function CountUp({ target, dec = 0, suffix = '' }) {
  const ref = useRef(null);
  const triggered = useRef(false);
  const [val, setVal] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        const dur = 1600;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const n = target * eased;
          setVal(
            n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix
          );
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, dec, suffix]);

  return <span ref={ref}>{val}</span>;
}

// ── Brand mark (parking-P logo) ───────────────────────────────
function BrandMark({ size = 34 }) {
  return (
    <span className="pc-brand-mark" style={{ width: size, height: size }}>
      {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: size * 0.59, height: size * 0.59 }}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg> */}
      <span className='logo'><img src={logo} alt='logo'/></span>
      
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [navScrolled, setNavScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState(1248);
  const [payState, setPayState] = useState('idle'); // idle | pending | verified

  // Nav glass on scroll
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Live spots counter jitter
  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((prev) => {
        const next = prev + Math.round((Math.random() - 0.5) * 6);
        return Math.max(1180, Math.min(1320, next));
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  // Payment card demo state machine
  function handlePayConfirm() {
    if (payState !== 'idle') return;
    setPayState('pending');
    setTimeout(() => {
      setPayState('verified');
      setTimeout(() => setPayState('idle'), 2600);
    }, 2100);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="pc-home" id="top">

      {/* Fixed 3D parking scene */}
      <ParkingScene3D theme={theme} />

      {/* ── Nav ── */}
      <nav className={`pc-nav${navScrolled ? ' pc-scrolled' : ''}`}>
        <div className="pc-nav-inner">
          <a className="pc-brand" href="#top">
            <BrandMark />
            SmartPark
          </a>

          <div className="pc-nav-links">
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#comment">Comment ça marche</a>
            <a href="#carte">Carte 3D</a>
            <a href="#blockchain">Blockchain</a>
            <a href="#reseau">Réseau</a>
          </div>

          <div className="pc-nav-spacer" />

          <div className="pc-nav-actions">
            <button className="pc-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="pc-btn pc-btn-wallet" onClick={() => navigate('/login')}>
              <Wallet size={18} />
              Se connecter
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content (above canvas) ── */}
      <div className="pc-page">

        {/* ── HERO ── */}
        <header className="pc-hero">
          <div className="pc-container">

            {/* <motion.span className="pc-eyebrow" {...heroAnim(0)}>
              <span className="pc-dot" />
              Stationnement décentralisé · Web3
            </motion.span> */}

            <motion.h1 {...heroAnim(0.08)}>
              Garez-vous en un clic.
              <br />
              <span className="pc-accent">Payez en toute confiance.</span>
            </motion.h1>

            <motion.p className="pc-lead" {...heroAnim(0.16)}>
              SmartPark réinvente le stationnement urbain : repérez une place libre en temps
              réel sur une carte 3D vivante, réservez instantanément et réglez en ETH.
              Sans ticket, sans file d'attente, sans intermédiaire.
            </motion.p>

            <motion.div className="pc-hero-cta" {...heroAnim(0.24)}>
              <button className="pc-btn pc-btn-wallet pc-btn-lg" onClick={() => navigate('/login')}>
                <Wallet size={18} />
                Se connecter
              </button>
              <a href="#carte" className="pc-btn pc-btn-ghost pc-btn-lg">
                <Box size={18} />
               Voir la carte 3D
              </a>
            </motion.div>

            <motion.div className="pc-hero-live pc-glass" {...heroAnim(0.32)}>
              <div className="pc-bars">
                <span /><span /><span /><span />
              </div>
              <div>
                <span className="pc-live-num">{liveCount.toLocaleString('fr-FR')}</span>
                <span className="pc-live-label">&nbsp;places disponibles en direct sur le réseau</span>
              </div>
            </motion.div>
          </div>

          <div className="pc-scroll-hint">
            <div className="pc-mouse" />
            <span>Défilez</span>
          </div>
        </header>

        {/* ── STATS ── */}
        <section className="pc-block" style={{ paddingTop: 40 }}>
          <div className="pc-container">
            <motion.div className="pc-stats pc-glass" {...revealAnim(0)}>
              <div className="pc-stat">
                <div className="pc-num"><CountUp target={32500} suffix="+" /></div>
                <div className="pc-lbl">Places connectées</div>
              </div>
              <div className="pc-stat">
                <div className="pc-num"><CountUp target={48} /></div>
                <div className="pc-lbl">Villes partenaires</div>
              </div>
              <div className="pc-stat">
                <div className="pc-num"><CountUp target={19400} /></div>
                <div className="pc-lbl">Transactions / jour</div>
              </div>
              <div className="pc-stat">
                <div className="pc-num"><CountUp target={9} suffix=" s" /></div>
                <div className="pc-lbl">Réservation moyenne</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className="pc-block" id="comment">
          <div className="pc-container">
            <motion.div className="pc-section-head" {...revealAnim(0)}>
              <span className="pc-kicker">Comment ça marche</span>
              <h2>Du wallet au pare-brise en quatre étapes.</h2>
              <p>Une expérience pensée pour la rue : tout se passe depuis votre téléphone, en quelques secondes.</p>
            </motion.div>

            <div className="pc-steps">
              {[
                { icon: <Wallet size={24} />, num: '01', title: 'Connectez votre wallet', body: "Liez MetaMask en un instant. Votre identité est vérifiée, aucun mot de passe à retenir." },
                { icon: <MapPin size={24} />, num: '02', title: 'Repérez une place', body: "La carte 3D affiche en direct les places libres. Filtrez par distance, prix ou type de véhicule." },
                { icon: <Coins size={24} />, num: '03', title: 'Payez en ETH', body: "Le tarif et l’éventuelle dette s’additionnent automatiquement. Une signature, et c’est réglé." },
                { icon: <Car size={24} />, num: '04', title: 'Stationnez sereinement', body: "Votre place est garantie et vérifiée par capteur. Le reçu est gravé dans la blockchain.", last: true },
              ].map(({ icon, num, title, body, last }, i) => (
                <motion.div key={num} className="pc-step pc-glass" {...revealAnim(i * 0.08)}>
                  {!last && <div className="pc-step-line" />}
                  <span className="pc-step-idx">ÉTAPE {num}</span>
                  <div className="pc-step-ico">{icon}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FONCTIONNALITÉS ── */}
        <section className="pc-block" id="fonctionnalites">
          <div className="pc-container">
            <motion.div className="pc-section-head" {...revealAnim(0)}>
              <span className="pc-kicker">Fonctionnalités clés</span>
              <h2>Tout ce qu'il faut pour stationner intelligemment.</h2>
              <p>Une plateforme complète qui relie conducteurs, exploitants de parkings et infrastructure urbaine.</p>
            </motion.div>

            <div className="pc-features">
              {[
                { cls: 'pc-c-cyan', icon: <Box size={26} />, title: 'Carte 3D temps réel', body: "Chaque place est un objet 3D interactif. Visualisez l'occupation niveau par niveau, en direct.", chips: ['Three.js', 'WebGL', 'Live'] },
                { cls: 'pc-c-orange', icon: <ShieldCheck size={26} />, title: 'Paiement blockchain', body: "Réglez en ETH via MetaMask. Transactions transparentes, immuables et sans frais cachés.", chips: ['MetaMask', 'Ethereum', 'Smart contract'] },
                { cls: 'pc-c-pink', icon: <Radio size={26} />, title: 'Capteurs IoT intelligents', body: "Des capteurs détectent l'arrivée et le départ des véhicules, mettant la carte à jour à la seconde.", chips: ['IoT', 'Détection'] },
                { cls: 'pc-c-green', icon: <Zap size={26} />, title: 'Réservation instantanée', body: "Bloquez une place avant même d'arriver. Plus de tours de pâté de maisons, plus de stress.", chips: ['Temps réel', '< 10 s'] },
                { cls: 'pc-c-cyan', icon: <LayoutDashboard size={26} />, title: 'Tableau de bord exploitant', body: "Revenus, taux d'occupation, alertes capteurs : pilotez votre parking depuis des KPIs en direct.", chips: ['Analytics', 'Admin'] },
                { cls: 'pc-c-orange', icon: <Lock size={26} />, title: 'Sécurité & transparence', body: "Chaque réservation et chaque paiement sont traçables et infalsifiables sur la chaîne.", chips: ['Immuable', 'Auditable'] },
              ].map(({ cls, icon, title, body, chips }, i) => (
                <motion.div key={title} className={`pc-feature pc-glass ${cls}`} {...revealAnim((i % 3) * 0.08)}>
                  <div className="pc-feat-ico">{icon}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <div className="pc-chips">
                    {chips.map((c) => <span key={c} className="pc-chip">{c}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARTE 3D SHOWCASE ── */}
        <section className="pc-block" id="carte">
          <div className="pc-container">
            <div className="pc-showcase">
              <motion.div className="pc-showcase-copy" {...revealAnim(0)}>
                <span className="pc-kicker">Carte 3D vivante</span>
                <h2>Une vue 3D de chaque place, mise à jour en direct.</h2>
                <p>
                  La carte que vous voyez défiler en arrière-plan n'est pas une image : c'est un vrai moteur 3D.
                  Survolez une place, cliquez pour réserver, basculez entre les niveaux. Le statut de chaque
                  emplacement se reflète instantanément.
                </p>
                <div className="pc-legend">
                  <div className="pc-legend-row">
                    <span className="pc-legend-dot pc-legend-dot-g" />
                    <b>Libre</b>
                    <span>— disponible à la réservation immédiate</span>
                  </div>
                  <div className="pc-legend-row">
                    <span className="pc-legend-dot pc-legend-dot-c" />
                    <b>Réservée</b>
                    <span>— bloquée par un conducteur en approche</span>
                  </div>
                  <div className="pc-legend-row">
                    <span className="pc-legend-dot pc-legend-dot-r" />
                    <b>Occupée</b>
                    <span>— véhicule détecté par capteur</span>
                  </div>
                </div>
                <button className="pc-btn pc-btn-ghost pc-btn-lg" style={{ marginTop: 30 }} onClick={() => navigate('/login')}>
                  Ouvrir la carte en direct
                </button>
              </motion.div>

              {/* IMAGE PLACEHOLDER — replace with ParkingMap3D screenshot / GIF */}
              <motion.div className="pc-ph pc-ph-tall" {...revealAnim(0.08)}>
                <div className="pc-ph-inner">
                  <div className="pc-ph-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.5-3.5L9 20" />
                    </svg>
                  </div>
                  <div className="pc-ph-title">[ IMAGE — Capture de la carte 3D ]</div>
                  <div className="pc-ph-note">
                    Insérez ici une capture d'écran ou un GIF de votre composant ParkingMap3D.jsx.
                    Format conseillé : ~900×1100px.
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── BLOCKCHAIN / PAIEMENT ── */}
        <section className="pc-block" id="blockchain">
          <div className="pc-container">
            <motion.div className="pc-section-head" {...revealAnim(0)}>
              <span className="pc-kicker">Paiement &amp; blockchain</span>
              <h2>Le calcul «&nbsp;tarif + dette&nbsp;», réglé avant la chaîne.</h2>
              <p>
                SmartPark additionne automatiquement le prix de la place et toute dette impayée,
                puis exécute une transaction unique et vérifiable.
              </p>
            </motion.div>

            <div className="pc-pay-grid">
              {/* Payment card mock */}
              <motion.div className="pc-pay-card pc-glass" {...revealAnim(0)}>
                <div className="pc-pay-head">
                  <span className="pc-pay-head-title">Réservation · Place B-14</span>
                  <span className="pc-pay-badge">
                    <span className="pc-pay-badge-dot" /> MetaMask
                  </span>
                </div>

                <div className="pc-pay-line">
                  <span>Prix de base</span>
                  <span className="pc-pay-line-val">0,001 ETH</span>
                </div>
                <div className="pc-pay-line pc-pay-line-debt">
                  <span>Dette impayée</span>
                  <span className="pc-pay-line-val">+ 0,005 ETH</span>
                </div>
                <div className="pc-pay-total">
                  <span className="pc-pay-total-lbl">Total à régler</span>
                  <span className="pc-pay-total-val">0,006 ETH</span>
                </div>

                <button
                  className="pc-btn pc-btn-wallet pc-pay-confirm"
                  onClick={handlePayConfirm}
                  disabled={payState !== 'idle'}
                >
                  {payState === 'idle' && (
                    <><Check size={18} /> Confirmer le paiement</>
                  )}
                  {payState === 'pending' && (
                    <><Loader2 size={18} className="pc-spin" /> Transaction en cours…</>
                  )}
                  {payState === 'verified' && (
                    <><Check size={18} /> Réservation vérifiée</>
                  )}
                </button>
              </motion.div>

              {/* Transaction flow */}
              <motion.div className="pc-pay-steps" {...revealAnim(0.08)}>
                {[
                  { n: '1', title: 'Signature de la transaction', body: "MetaMask s'ouvre. Vous validez le montant exact, en toute transparence." },
                  { n: '2', title: 'Confirmation sur la blockchain', body: "Le smart contract enregistre le paiement et attend le reçu du réseau." },
                  { n: '3', title: 'Réservation vérifiée', body: "Le backend Laravel est notifié et la place vous est définitivement attribuée." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="pc-pay-step">
                    <span className="pc-pay-step-num">{n}</span>
                    <div><h4>{title}</h4><p>{body}</p></div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ADMIN KPIs ── */}
        <section className="pc-block" id="reseau">
          <div className="pc-container">
            <motion.div className="pc-section-head" {...revealAnim(0)}>
              {/* <span className="pc-kicker">Pour les exploitants</span> */}
              <h2>Pilotez votre réseau de parkings en un coup d'œil.</h2>
              <p>Un tableau de bord temps réel pour suivre les revenus, l'occupation et la santé des capteurs.</p>
            </motion.div>

            <div className="pc-kpis">
              <motion.div className="pc-kpi pc-glass pc-kpi-green" {...revealAnim(0)}>
                <div className="pc-kpi-top">
                  <span>Revenus du jour</span>
                  <span className="pc-kpi-ico"><TrendingUp size={19} /></span>
                </div>
                <div className="pc-kpi-val"><CountUp target={14.82} dec={2} /> ETH</div>
                <div className="pc-kpi-sub">≈ 41 200 € · +12,4 % vs hier</div>
              </motion.div>

              <motion.div className="pc-kpi pc-glass pc-kpi-cyan" {...revealAnim(0.08)}>
                <div className="pc-kpi-top">
                  <span>Taux d'occupation</span>
                  <span className="pc-kpi-ico"><Activity size={19} /></span>
                </div>
                <div className="pc-kpi-val"><CountUp target={87} suffix=" %" /></div>
                <div className="pc-kpi-sub">28 312 places actives sur 32 500</div>
              </motion.div>

              <motion.div className="pc-kpi pc-glass pc-kpi-pink" {...revealAnim(0.16)}>
                <div className="pc-kpi-top">
                  <span>Capteurs hors-ligne</span>
                  <span className="pc-kpi-ico"><AlertTriangle size={19} /></span>
                </div>
                <div className="pc-kpi-val"><CountUp target={3} /></div>
                <div className="pc-kpi-sub">Maintenance recommandée · zone Nord</div>
              </motion.div>
            </div>

            {/* IMAGE PLACEHOLDER — replace with admin dashboard screenshot */}
            <motion.div className="pc-ph pc-ph-wide" style={{ marginTop: 24 }} {...revealAnim(0)}>
              <div className="pc-ph-inner">
                <div className="pc-ph-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div className="pc-ph-title">[ IMAGE — Tableau de bord exploitant ]</div>
                <div className="pc-ph-note">
                  Insérez une capture du dashboard admin (KPIs, graphiques, tableau des réservations).
                  Format conseillé : ~1600×1000px (16:10).
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="pc-cta-final">
          <div className="pc-container">
            <motion.div className="pc-cta-card pc-glass" {...revealAnim(0)}>
              <h2>Prêt à révolutionner votre stationnement&nbsp;?</h2>
              <p>Connectez votre wallet et trouvez votre première place en moins de dix secondes.</p>
              <div className="pc-hero-cta pc-cta-cta">
                <button className="pc-btn pc-btn-wallet pc-btn-lg" onClick={() => navigate('/login')}>
                  <Wallet size={18} />
                  Se connecter
                </button>
                <a href="/login" className="pc-btn pc-btn-ghost pc-btn-lg">Voir une démo</a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="pc-footer">
        <div className="pc-container">
          <div className="pc-foot-grid">
            <div className="pc-foot-brand">
              <a className="pc-brand" href="#top">
                <BrandMark />
                SmartPark
              </a>
              <p>Le stationnement urbain intelligent, sécurisé par la blockchain. Trouvez, réservez et payez en quelques secondes.</p>
            </div>

            <div className="pc-foot-col">
              <h5>Produit</h5>
              <a href="#fonctionnalites">Fonctionnalités</a>
              <a href="#carte">Carte 3D</a>
              <a href="#blockchain">Paiement ETH</a>
              <a href="#reseau">Exploitants</a>
            </div>

            <div className="pc-foot-col">
              <h5>Ressources</h5>
              <a href="#">Documentation</a>
              <a href="#">Smart contracts</a>
              <a href="#">API développeurs</a>
              <a href="#">Statut du réseau</a>
            </div>

            <div className="pc-foot-col">
              <h5>Entreprise</h5>
              <a href="#">À propos</a>
              <a href="#">Villes partenaires</a>
              <a href="#">Contact</a>
              <a href="#">Mentions légales</a>
            </div>
          </div>

          <div className="pc-foot-bottom">
            <span>© 2026 SmartPark. Tous droits réservés.</span>
            <div className="pc-socials">
              <a href="#" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub">
                <Github size={17} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
