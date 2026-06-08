// ============================================================
//  ParkChain Dashboard — first-login Welcome Guide
//  A floating, stepped pop-up shown ONCE on first login.
//  Persists "seen" in localStorage['pc-onboarded'].
//  Uses global Icon. Exports WelcomeGuide to window.
//
//  NOTE FOR CLAUDE CODE: gate this on a per-user flag from the
//  backend instead of localStorage (e.g. user.onboarded_at).
//  Mark it seen via PATCH /me { onboarded: true } in onClose().
// ============================================================
const { useState: ogUseState } = React;

const SP_GUIDE_STEPS = [
  {
    kind: "hero",
    icon: "layers",
    eyebrow: "Bienvenue sur ParkChain",
    title: "Garez-vous sans stress.",
    body: "Trouvez une place libre en temps réel, réservez-la en quelques secondes et payez en toute sécurité depuis votre portefeuille. Voici l'essentiel en 4 étapes.",
    accent: "cyan",
  },
  {
    kind: "feature",
    icon: "map",
    eyebrow: "Étape 1 · La carte 3D",
    title: "Visualisez le parking en direct",
    body: "Faites pivoter et zoomez sur le parking en 3D. Chaque place change de couleur en temps réel : orange = libre, violet = réservée, rose = occupée.",
    accent: "green",
    legend: true,
  },
  {
    kind: "feature",
    icon: "wallet",
    eyebrow: "Étape 2 · Réservez & payez",
    title: "Choisissez la durée, payez en un geste",
    body: "Cliquez une place libre, réglez la durée (heures + minutes) et le tarif jour ou nuit. Le prix se calcule automatiquement, puis vous validez via MetaMask.",
    accent: "orange",
  },
  {
    kind: "feature",
    icon: "history",
    eyebrow: "Étape 3 · Suivez votre session",
    title: "Minuteur, portefeuille & historique",
    body: "Un minuteur suit votre stationnement en cours. Retrouvez votre solde, votre dette éventuelle (ajoutée au prochain paiement) et l'historique on-chain à tout moment.",
    accent: "pink",
  },
];

function WelcomeGuide({ name, onClose }) {
  const [i, setI] = ogUseState(0);
  const [leaving, setLeaving] = ogUseState(false);
  const step = SP_GUIDE_STEPS[i];
  const last = i === SP_GUIDE_STEPS.length - 1;

  function finish() {
    setLeaving(true);
    setTimeout(onClose, 280);
  }
  function next() { last ? finish() : setI(i + 1); }
  function prev() { if (i > 0) setI(i - 1); }

  return (
    <div className={"guide-scrim" + (leaving ? " leaving" : "")} role="dialog" aria-modal="true" aria-label="Guide de bienvenue">
      <div className="guide-card" key={i}>
        <button className="guide-skip" onClick={finish}>Passer <Icon name="x" size={14} /></button>

        <div className={"guide-visual accent-" + step.accent}>
          <div className="gv-glow"></div>
          {step.kind === "hero" ? (
            <div className="gv-brand">
              <span className="gv-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>
              </span>
            </div>
          ) : (
            <div className="gv-ico"><Icon name={step.icon} size={40} stroke={1.7} /></div>
          )}
          {step.legend && (
            <div className="gv-legend">
              <span><i className="dot-free"></i> Libre</span>
              <span><i className="dot-resv"></i> Réservée</span>
              <span><i className="dot-occ"></i> Occupée</span>
            </div>
          )}
        </div>

        <div className="guide-body">
          <span className="guide-eyebrow">{step.eyebrow}</span>
          <h3 className="guide-title">
            {step.kind === "hero" && name ? <span className="gt-hi">Bonjour {name},</span> : null}
            {step.title}
          </h3>
          <p className="guide-text">{step.body}</p>
        </div>

        <div className="guide-foot">
          <div className="guide-dots">
            {SP_GUIDE_STEPS.map((_, k) => (
              <button key={k} className={"gd" + (k === i ? " on" : "")} onClick={() => setI(k)} aria-label={"Étape " + (k + 1)}></button>
            ))}
          </div>
          <div className="guide-actions">
            {i > 0 && <button className="btn btn-ghost btn-sm" onClick={prev}>Précédent</button>}
            <button className="btn btn-wallet btn-sm" onClick={next}>
              {last ? <><Icon name="check" size={16} stroke={2.4} /> Commencer</> : <>Suivant <Icon name="arrowRight" size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WelcomeGuide = WelcomeGuide;
