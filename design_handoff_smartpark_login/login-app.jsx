/* global React, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSlider, TweakText, TweakColor */
const { useState, useEffect, useRef } = React;

// ---- Tweakable defaults ----------------------------------------------------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "holo",
  "accent": "orange",
  "gridTexture": true,
  "glow": 0.6,
  "note": "Nouveau ici ? Connecter votre portefeuille crée votre compte SmartPark — sans mot de passe, sans e-mail. Vous signerez un message gratuit pour prouver votre identité ; ce n'est pas une transaction et n'engendre aucuns frais.",
  "showVideoBadge": true
}/*EDITMODE-END*/;

// Accent palettes -> [primary, secondary]
const ACCENTS = {
  orange:   ["#f45100", "#ff9a4d"],
  purple:   ["#6900b9", "#8d18dc"],
  duotone:  ["#ff6a1d", "#b14dff"],
};

// ---- Animated video-background placeholder ---------------------------------
function VideoLayer({ showBadge }) {
  // Floating particles to make the placeholder feel like live motion footage.
  const particles = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      dur: 14 + Math.random() * 22,
      delay: -Math.random() * 30,
      hue: Math.random() > 0.5 ? "var(--accent)" : "var(--accent-2)",
    }))
  ).current;

  return (
    <div className="video-layer" aria-hidden="true">
      {/* Drop your animated video in here later — set the src and it covers the page. */}
      <video
        id="bg-video"
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        poster=""
      >
        {/* <source src="your-video.mp4" type="video/mp4" /> */}
      </video>

      {/* Placeholder scene shown until a real video <source> is added. */}
      <div className="video-placeholder">
        <div className="vp-grad vp-grad-a" />
        <div className="vp-grad vp-grad-b" />
        <div className="vp-scan" />
        <div className="vp-grid" />
        <div className="vp-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                left: p.left + "%",
                top: p.top + "%",
                width: p.size,
                height: p.size,
                background: p.hue,
                animationDuration: p.dur + "s",
                animationDelay: p.delay + "s",
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

// ---- Generic geometric wallet mark (not a branded logo) --------------------
function WalletMark() {
  return (
    <svg className="wallet-mark" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="12.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

// ---- The connect card ------------------------------------------------------
const FAKE_ADDR = "0x7A3f9C12bE4d8a01F5cD6e0b9aF21E92bC4d8a01";
function truncate(a) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

function ConnectPanel({ t }) {
  // status: idle | connecting | signing | connected | error
  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  function connect() {
    if (status === "connecting" || status === "signing") return;
    setStatus("connecting");
    after(1600, () => setStatus("signing"));
    after(3400, () => setStatus("connected"));
  }
  function reset() {
    timers.current.forEach(clearTimeout);
    setStatus("idle");
    setCopied(false);
  }
  function copyAddr() {
    setCopied(true);
    after(1400, () => setCopied(false));
  }

  const busy = status === "connecting" || status === "signing";

  return (
    <section className={"panel panel-" + t.variant} aria-label="Se connecter à SmartPark">
      {t.gridTexture && <div className="panel-tex" aria-hidden="true" />}
      <div className="panel-glow" aria-hidden="true" />

      <div className="panel-inner">
        {/* Brand row */}
        <div className="brand">
          <div className="brand-logo" title="Téléversez votre logo plus tard">
            <span className="brand-logo-tag">LOGO</span>
          </div>
          <div className="brand-text">
            <h1 className="brand-name">SmartPark</h1>
            <p className="brand-kicker">Réseau de stationnement décentralisé</p>
          </div>
        </div>

        <div className="rule" />

        {status !== "connected" ? (
          <>
            <div className="lead">
              <p className="lead-title">
                {status === "idle" && "Connectez votre portefeuille pour continuer"}
                {status === "connecting" && "Ouverture de MetaMask…"}
                {status === "signing" && "Confirmez dans votre portefeuille"}
              </p>
              <p className="lead-sub">
                {status === "idle" && "Connectez-vous à SmartPark avec votre portefeuille Web3."}
                {status === "connecting" && "Approuvez la demande de connexion dans la fenêtre."}
                {status === "signing" && "Signez le message pour confirmer que c'est bien vous — sans frais, sans transaction."}
              </p>
            </div>

            <button
              className={"btn btn-primary" + (busy ? " is-busy" : "")}
              onClick={connect}
              disabled={busy}
            >
              {busy ? <Spinner /> : <WalletMark />}
              <span>
                {status === "idle" && "Connecter MetaMask"}
                {status === "connecting" && "Connexion…"}
                {status === "signing" && "En attente de la signature…"}
              </span>
            </button>

            {busy && (
              <div className="steps" aria-hidden="true">
                <Step n="1" label="Portefeuille" active={true} done={status === "signing"} />
                <span className="steps-line" />
                <Step n="2" label="Connexion" active={status === "signing"} done={false} />
              </div>
            )}

            {/* Guiding note — centered with the button */}
            <p className="note">{t.note}</p>

            <p className="alt">
              Vous n&apos;avez pas de portefeuille ?{" "}
              <a className="link" href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                Obtenir MetaMask
              </a>
            </p>
          </>
        ) : (
          <div className="connected">
            <div className="ok-ring" aria-hidden="true"><span className="ok-check" /></div>
            <p className="lead-title is-centered">Portefeuille connecté</p>

            <div className="acct" onClick={copyAddr} role="button" title="Copier l'adresse">
              <span className="acct-avatar" aria-hidden="true" />
              <span className="acct-addr">{truncate(FAKE_ADDR)}</span>
              <span className="acct-copy">{copied ? "Copié ✓" : "Copier"}</span>
            </div>

            <div className="meta-row">
              <span className="chip"><span className="chip-dot" />Polygon</span>
              <span className="chip">0.0 SPK</span>
              <span className="chip">Vérifié</span>
            </div>

            <button className="btn btn-primary">
              <span>Entrer dans SmartPark</span>
              <span className="arrow">→</span>
            </button>
            <button className="btn btn-ghost" onClick={reset}>Déconnexion</button>
          </div>
        )}
      </div>
    </section>
  );
}

function Step({ n, label, active, done }) {
  return (
    <span className={"step" + (active ? " active" : "") + (done ? " done" : "")}>
      <span className="step-n">{done ? "✓" : n}</span>
      <span className="step-label">{label}</span>
    </span>
  );
}

// ---- App -------------------------------------------------------------------
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [pri, sec] = ACCENTS[t.accent] || ACCENTS.duotone;

  const rootStyle = {
    "--accent": pri,
    "--accent-2": sec,
    "--glow": t.glow,
  };

  return (
    <div className="stage" style={rootStyle} data-variant={t.variant}>
      <VideoLayer showBadge={t.showVideoBadge} />

      <main className="center">
        <ConnectPanel t={t} />
      </main>

      <footer className="page-foot">
        <span>SmartPark</span>
        <span className="dot-sep">·</span>
        <span>Accès Web3 sécurisé</span>
        <span className="dot-sep">·</span>
        <span>v0.1</span>
      </footer>

      <TweaksPanel>
        <TweakSection label="Panel direction" />
        <TweakRadio
          label="Style"
          value={t.variant}
          options={["grid", "holo", "terminal"]}
          onChange={(v) => setTweak("variant", v)}
        />
        <TweakToggle
          label="Grid texture"
          value={t.gridTexture}
          onChange={(v) => setTweak("gridTexture", v)}
        />
        <TweakSection label="Accent" />
        <TweakRadio
          label="Color"
          value={t.accent}
          options={["orange", "purple", "duotone"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSlider
          label="Glow"
          value={t.glow}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => setTweak("glow", v)}
        />
        <TweakSection label="Content" />
        <TweakText
          label="Guiding note"
          value={t.note}
          onChange={(v) => setTweak("note", v)}
        />
        <TweakToggle
          label="Show video badge"
          value={t.showVideoBadge}
          onChange={(v) => setTweak("showVideoBadge", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
