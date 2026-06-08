// ============================================================
//  ParkChain Dashboard — Modals: ProfileModal · PaymentModal
//  Uses global Icon, window.SP. Exports both to window.
// ============================================================
const { useState: spUseState, useEffect: spUseEffect, useRef: spUseRef } = React;

/* ---------------------------------------------------------------
   ProfileModal — non-dismissible. Appears when first_name/email null.
   Mirrors requirement §1: calls updateProfile(formData).
--------------------------------------------------------------- */
function ProfileModal({ onComplete }) {
  const [form, setForm] = spUseState({ firstName: "", lastName: "", email: "" });
  const [touched, setTouched] = spUseState({});
  const [saving, setSaving] = spUseState(false);

  const errors = {
    firstName: form.firstName.trim().length < 2 ? "Au moins 2 caractères." : "",
    lastName: form.lastName.trim().length < 2 ? "Au moins 2 caractères." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "Adresse e-mail invalide." : "",
  };
  const valid = !errors.firstName && !errors.lastName && !errors.email;

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function blur(k) { setTouched((t) => ({ ...t, [k]: true })); }

  async function submit(e) {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true });
    if (!valid || saving) return;
    setSaving(true);
    // TODO(Claude Code): AuthContext.updateProfile(form)
    await window.SP.api.updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() });
    setSaving(false);
    onComplete({ ...form });
  }

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-pad">
          <span className="modal-eyebrow"><Icon name="user" size={14} /> Bienvenue sur ParkChain</span>
          <h3>Complétez votre profil</h3>
          <p className="modal-sub">
            Votre portefeuille est connecté. Avant de réserver une place, dites-nous qui vous êtes —
            ces informations restent privées et ne sont jamais publiées on-chain.
          </p>

          <form onSubmit={submit} noValidate>
            <div className="field-row">
              <div className="field">
                <label>Prénom <span className="req">*</span></label>
                <input
                  className={touched.firstName && errors.firstName ? "invalid" : ""}
                  value={form.firstName} placeholder="Camille"
                  onChange={(e) => set("firstName", e.target.value)} onBlur={() => blur("firstName")}
                />
                <div className="err">{touched.firstName ? errors.firstName : ""}</div>
              </div>
              <div className="field">
                <label>Nom <span className="req">*</span></label>
                <input
                  className={touched.lastName && errors.lastName ? "invalid" : ""}
                  value={form.lastName} placeholder="Durand"
                  onChange={(e) => set("lastName", e.target.value)} onBlur={() => blur("lastName")}
                />
                <div className="err">{touched.lastName ? errors.lastName : ""}</div>
              </div>
            </div>
            <div className="field">
              <label>Adresse e-mail <span className="req">*</span></label>
              <input
                type="email" className={touched.email && errors.email ? "invalid" : ""}
                value={form.email} placeholder="camille.durand@email.com"
                onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")}
              />
              <div className="err">{touched.email ? errors.email : ""}</div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-wallet btn-lg" disabled={!valid || saving}
                style={{ opacity: valid && !saving ? 1 : 0.55 }}>
                {saving
                  ? <><Icon name="spinner" size={18} className="ts-spin" stroke={2.2} /> Enregistrement…</>
                  : <><Icon name="check" size={18} stroke={2.4} /> Continuer vers le tableau de bord</>}
              </button>
            </div>
            <p className="modal-note">
              Ce formulaire ne peut pas être fermé tant que votre profil n'est pas complet —
              c'est une exigence de sécurité du réseau.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PaymentModal — reservation summary, debt + price, tx stepper.
   Mirrors requirement §3 and UI design §3.A (glassmorphism).
--------------------------------------------------------------- */
const SP_TX_STEPS = [
  { t: "Signature de la transaction", p: "MetaMask s'ouvre — validez le montant exact." },
  { t: "Confirmation sur la blockchain", p: "Le smart contract attend le reçu du réseau." },
  { t: "Réservation vérifiée", p: "Le backend Laravel est notifié, la place est à vous." },
];

function PaymentModal({ spot, debt, onClose, onConfirmed }) {
  const [phase, setPhase] = spUseState("review"); // review · tx · done
  const [step, setStep] = spUseState(0);          // 0..3 (0 = not started)
  const [hours, setHours] = spUseState(1);
  const [minutes, setMinutes] = spUseState(0);
  const [period, setPeriod] = spUseState(window.SP.currentPeriod());

  const durationMin = Math.max(15, hours * 60 + minutes);
  const tarif = window.SP.TARIF[period];
  const subtotal = window.SP.computePrice(durationMin, period);
  const total = +(subtotal + debt).toFixed(4);

  function stepH(d) { setHours((h) => Math.max(0, Math.min(12, h + d))); }
  function stepM(d) { setMinutes((m) => { let v = m + d; if (v < 0) v = 45; if (v > 45) v = 0; return v; }); }

  async function confirm() {
    setPhase("tx"); setStep(1);
    // TODO(Claude Code): blockchainService.payForSpot(spot.id, total) then api.post('/reservations', …)
    const { txHash } = await window.SP.blockchain.payForSpot(spot.id, total, (s) => setStep(s));
    await window.SP.api.saveReservation({ spot_id: spot.id, transaction_hash: txHash, amount: total, duration_min: durationMin, period });
    setPhase("done");
    setTimeout(() => onConfirmed({ spot, txHash, total, subtotal, durationMin, period }), 1100);
  }

  const busy = phase === "tx";
  const review = phase !== "tx" && phase !== "done";

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" onClick={() => !busy && phase !== "done" && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {phase === "review" && (
          <button className="modal-close" onClick={onClose} aria-label="Fermer"><Icon name="x" size={16} /></button>
        )}
        <div className="modal-pad">
          <span className="modal-eyebrow"><Icon name="pin" size={14} /> Réservation de place</span>
          <h3>Confirmer &amp; payer</h3>

          <div className="spot-preview">
            <div className="sp-sq free">{spot.label}</div>
            <div className="sp-info">
              <h4>Place {spot.label} · {spot.level}</h4>
              <p>Disponible immédiatement · capteur vérifié</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--neon-green)", fontSize: 13, fontWeight: 600 }}>
                <span className="dot-free"></span> Libre
              </div>
            </div>
          </div>

          {review && (
            <>
              {/* duration */}
              <div className="field-label">Durée de stationnement</div>
              <div className="dur-grid">
                <div className="stepper">
                  <button className="st-btn" onClick={() => stepH(-1)} aria-label="Moins une heure"><Icon name="minus" size={16} /></button>
                  <div><span className="st-val">{hours}</span><span className="st-unit">h</span></div>
                  <button className="st-btn" onClick={() => stepH(1)} aria-label="Plus une heure"><Icon name="plus" size={16} /></button>
                </div>
                <div className="stepper">
                  <button className="st-btn" onClick={() => stepM(-15)} aria-label="Moins 15 minutes"><Icon name="minus" size={16} /></button>
                  <div><span className="st-val">{String(minutes).padStart(2, "0")}</span><span className="st-unit">min</span></div>
                  <button className="st-btn" onClick={() => stepM(15)} aria-label="Plus 15 minutes"><Icon name="plus" size={16} /></button>
                </div>
              </div>
              <div className="dur-chips">
                {[[0, 30], [1, 0], [2, 0], [4, 0]].map(([h, m]) => (
                  <button key={h + "-" + m} className={"dur-chip" + (hours === h && minutes === m ? " on" : "")} onClick={() => { setHours(h); setMinutes(m); }}>
                    {window.SP.durLabel(h * 60 + m)}
                  </button>
                ))}
              </div>

              {/* tarif jour / nuit */}
              <div className="field-label">Tarif</div>
              <div className="tarif-seg">
                {["day", "night"].map((p) => {
                  const tr = window.SP.TARIF[p];
                  return (
                    <button key={p} className={"tarif-opt" + (period === p ? " on" : "")} onClick={() => setPeriod(p)}>
                      <div className="to-top">
                        <Icon name={p === "day" ? "sun" : "moon"} size={15} /> {tr.label}
                        {window.SP.currentPeriod() === p && <span className="to-now">maintenant</span>}
                      </div>
                      <div className="to-rate">{window.SP.fmtEth(tr.rate)} <small>ETH/h</small></div>
                      <div className="to-win">{tr.window}</div>
                    </button>
                  );
                })}
              </div>

              {/* récapitulatif */}
              <div className="pay-summary">
                <div className="pay-row">
                  <span>Tarif {tarif.label.toLowerCase()} · {window.SP.fmtEth(tarif.rate)} × {window.SP.durLabel(durationMin)}</span>
                  <span className="v">{window.SP.fmtEth(subtotal)} ETH</span>
                </div>
                {debt > 0 && <div className="pay-row debt"><span>Dette impayée</span><span className="v">+ {window.SP.fmtEth(debt)} ETH</span></div>}
                <hr className="pay-divider" />
                <div className="pay-total-row">
                  <span className="lbl">Total à régler</span>
                  <span className="v">{window.SP.fmtEth(total)} <small>ETH</small></span>
                </div>
                <div style={{ textAlign: "right", color: "var(--faint)", fontSize: 12.5, marginTop: 4 }}>≈ {window.SP.ethToEur(total)} €</div>
              </div>
            </>
          )}

          {(phase === "tx" || phase === "done") && (
            <div className="tx-steps">
              {SP_TX_STEPS.map((s, i) => {
                const n = i + 1;
                const state = phase === "done" || step > n ? "done" : step === n ? "active" : "";
                return (
                  <React.Fragment key={i}>
                    <div className={"tx-step " + state}>
                      <span className="tx-n">
                        {state === "done" ? <Icon name="check" size={16} stroke={2.6} />
                          : state === "active" ? <Icon name="spinner" size={16} className="tx-spin" stroke={2.2} />
                          : n}
                      </span>
                      <div className="tx-body"><h4>{s.t}</h4><p>{s.p}</p></div>
                    </div>
                    {i < SP_TX_STEPS.length - 1 && <div className="tx-line"></div>}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="modal-actions">
            {phase === "review" && (
              <button className="btn btn-wallet btn-lg" onClick={confirm}>
                <Icon name="wallet" size={18} /> Payer {window.SP.fmtEth(total)} ETH via MetaMask
              </button>
            )}
            {phase === "tx" && (
              <button className="btn btn-wallet btn-lg" disabled style={{ opacity: 0.7 }}>
                <Icon name="spinner" size={18} className="ts-spin" stroke={2.2} /> Transaction en cours…
              </button>
            )}
            {phase === "done" && (
              <button className="btn btn-wallet btn-lg" disabled style={{ background: "linear-gradient(135deg, oklch(0.76 0.18 150), oklch(0.66 0.2 160))", borderColor: "transparent" }}>
                <Icon name="check" size={18} stroke={2.4} /> Réservation vérifiée
              </button>
            )}
          </div>
          {phase === "review" && (
            <p className="modal-note">Prix = tarif {tarif.label.toLowerCase()} × durée, dette éventuelle incluse. Une seule signature.</p>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileModal, PaymentModal });
