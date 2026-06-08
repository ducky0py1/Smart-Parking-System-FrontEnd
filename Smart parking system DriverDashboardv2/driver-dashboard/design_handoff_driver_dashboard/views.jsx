// ============================================================
//  ParkChain Dashboard — Views: History · Wallet · Settings
//  Uses global Icon, window.SP.
// ============================================================
const { useState: vUseState, useEffect: vUseEffect } = React;

/* ===================== HISTORY ========================================= */
function HistoryView({ history, activeResv }) {
  const [filter, setFilter] = vUseState("all");
  const [q, setQ] = vUseState("");

  let rows = [...history];
  if (activeResv && !rows.find((r) => r.id === activeResv.id)) {
    rows = [{ id: activeResv.id, label: activeResv.label, date: "À l'instant", durationMin: activeResv.durationMin, amountEth: activeResv.price, status: "active", txHash: activeResv.txHash }, ...rows];
  }
  rows = rows.filter((r) => (filter === "all" ? true : filter === "active" ? r.status === "active" : r.status === "completed"));
  if (q.trim()) rows = rows.filter((r) => r.label.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Mes réservations</h2>
        <p>Chaque paiement est gravé on-chain. Cliquez une transaction pour l'ouvrir dans l'explorateur Ganache.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 22 }}>
        <div className="card metric green glow-green">
          <div className="m-top"><span>Total stationné</span><span className="m-ico"><Icon name="receipt" size={19} /></span></div>
          <div className="m-val">{history.length + (activeResv ? 1 : 0)}</div>
          <div className="m-sub">réservations au total</div>
        </div>
        <div className="card metric cyan glow-cyan">
          <div className="m-top"><span>Dépense cumulée</span><span className="m-ico"><Icon name="wallet" size={19} /></span></div>
          <div className="m-val">{window.SP.fmtEth(history.reduce((a, r) => a + r.amountEth, 0))}<span style={{ fontSize: 18, color: "var(--muted)" }}> ETH</span></div>
          <div className="m-sub">≈ {window.SP.ethToEur(history.reduce((a, r) => a + r.amountEth, 0))} €</div>
        </div>
        <div className="card metric orange glow-orange">
          <div className="m-top"><span>Durée moyenne</span><span className="m-ico"><Icon name="clock" size={19} /></span></div>
          <div className="m-val">{Math.round(history.reduce((a, r) => a + r.durationMin, 0) / history.length)}<span style={{ fontSize: 18, color: "var(--muted)" }}> min</span></div>
          <div className="m-sub">par session de stationnement</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-tools">
          <div className="seg">
            {[["all", "Toutes"], ["active", "Actives"], ["completed", "Terminées"]].map(([k, l]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="search-box">
            <Icon name="search" size={16} />
            <input placeholder="Rechercher une place…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="history">
            <thead>
              <tr><th>Place</th><th>Date</th><th>Durée</th><th>Montant</th><th>Statut</th><th>Transaction</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><span className="spot-tag"><span className="sq">{r.label}</span></span></td>
                  <td style={{ color: "var(--muted)" }}>{r.date}</td>
                  <td>{r.durationMin} min</td>
                  <td><span className="amt">{window.SP.fmtEth(r.amountEth)} ETH</span></td>
                  <td>
                    <span className={"status-pill " + (r.status === "active" ? "active" : "done")}>
                      {r.status === "active" ? <><span className="dot-free"></span> Active</> : <><Icon name="check" size={13} stroke={2.6} /> Terminée</>}
                    </span>
                  </td>
                  <td>
                    <a className="tx-link" href={window.SP.GANACHE_EXPLORER + r.txHash} target="_blank" rel="noreferrer" title={r.txHash}>
                      {window.SP.shortHash(r.txHash)} <Icon name="external" size={14} />
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--faint)", padding: "40px 0" }}>Aucune réservation pour ce filtre.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== WALLET ========================================= */
function WalletView({ user, debt, history, onPayDebt, pushToast }) {
  const spent = history.reduce((a, r) => a + r.amountEth, 0);
  function copyAddr() {
    navigator.clipboard && navigator.clipboard.writeText(user.address);
    pushToast({ kind: "success", title: "Adresse copiée", sub: window.SP.shortAddr(user.address), ttl: 2600 });
  }
  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Portefeuille</h2>
        <p>Votre solde, votre dette et votre activité récente sur le réseau ParkChain.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.3fr 1fr", marginBottom: 22 }}>
        <div className="wallet-hero glass-panel">
          <div className="wh-top">
            <span className="wh-label">Solde du portefeuille</span>
            <span className="mm-badge"><span className="fox"></span> MetaMask</span>
          </div>
          <div className="wh-bal">{window.SP.fmtEth(user.balance)} <span className="eth">ETH</span></div>
          <div className="wh-fiat">≈ {window.SP.ethToEur(user.balance)} € · {user.network}</div>
          <div className="wh-addr">
            {window.SP.shortAddr(user.address)}
            <button onClick={copyAddr} title="Copier l'adresse"><Icon name="copy" size={15} /></button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card metric pink" style={{ flex: 1 }}>
            <div className="m-top"><span>Dette en cours</span><span className="m-ico"><Icon name="alert" size={19} /></span></div>
            <div className="m-val">{window.SP.fmtEth(debt)}<span style={{ fontSize: 18, color: "var(--muted)" }}> ETH</span></div>
            <div className="m-sub">{debt > 0 ? "Ajoutée à votre prochain paiement" : "Aucune dette — tout est réglé"}</div>
          </div>
          <div className="card metric cyan" style={{ flex: 1 }}>
            <div className="m-top"><span>Dépense totale</span><span className="m-ico"><Icon name="trend" size={19} /></span></div>
            <div className="m-val">{window.SP.fmtEth(spent)}<span style={{ fontSize: 18, color: "var(--muted)" }}> ETH</span></div>
            <div className="m-sub">sur {history.length} réservations</div>
          </div>
        </div>
      </div>

      {debt > 0 && (
        <div className="debt-banner" style={{ marginBottom: 22 }}>
          <div className="db-ico"><Icon name="alert" size={22} /></div>
          <div className="db-text">
            <h4>Vous avez une dette impayée</h4>
            <p>Elle sera automatiquement ajoutée à votre prochaine réservation, ou réglez-la maintenant.</p>
          </div>
          <div className="db-amt">{window.SP.fmtEth(debt)} ETH</div>
          <button className="btn btn-wallet btn-sm" onClick={onPayDebt} style={{ marginLeft: 8 }}>
            <Icon name="wallet" size={16} /> Régler
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Activité récente</h3>
          <span style={{ fontSize: 13, color: "var(--faint)" }}>{user.network}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {history.slice(0, 4).map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <span className="sq" style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, border: "1px solid var(--border-2)", background: "var(--surface-2)" }}>{r.label}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Stationnement · Place {r.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--faint)" }}>{r.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="amt" style={{ color: "var(--neon-pink)" }}>− {window.SP.fmtEth(r.amountEth)} ETH</div>
                <a className="tx-link" style={{ fontSize: 12 }} href={window.SP.GANACHE_EXPLORER + r.txHash} target="_blank" rel="noreferrer">{window.SP.shortHash(r.txHash)} <Icon name="external" size={12} /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== SETTINGS ======================================= */
function Switch({ on, onClick }) { return <button className={"switch" + (on ? " on" : "")} onClick={onClick} aria-pressed={on}></button>; }

function SettingsView({ user, theme, toggleTheme, profile, onSaveProfile, pushToast, onDisconnect }) {
  const [tab, setTab] = vUseState("profile");
  const [form, setForm] = vUseState({ firstName: profile.firstName || "", lastName: profile.lastName || "", email: profile.email || "" });
  const [notif, setNotif] = vUseState({ tx: true, reminders: true, marketing: false });

  vUseEffect(() => { setForm({ firstName: profile.firstName || "", lastName: profile.lastName || "", email: profile.email || "" }); }, [profile]);

  function save() {
    onSaveProfile(form);
    pushToast({ kind: "success", title: "Profil mis à jour", sub: "Vos informations ont été enregistrées", ttl: 2600 });
  }

  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Paramètres</h2>
        <p>Gérez votre profil, l'apparence du tableau de bord et vos préférences.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-nav">
          {[["profile", "Profil"], ["appearance", "Apparence"], ["notifications", "Notifications"], ["network", "Réseau & wallet"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="card set-block">
          {tab === "profile" && (
            <>
              <h3>Profil</h3>
              <p className="sb-sub">Ces informations restent privées et ne sont jamais publiées on-chain.</p>
              <div className="field-row">
                <div className="field"><label>Prénom</label><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="field"><label>Nom</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="field"><label>Adresse e-mail</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Adresse du portefeuille</label><input value={user.address} disabled style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, opacity: 0.7 }} /></div>
              <div style={{ marginTop: 18 }}>
                <button className="btn btn-wallet btn-sm" onClick={save}><Icon name="check" size={16} stroke={2.4} /> Enregistrer</button>
              </div>
            </>
          )}

          {tab === "appearance" && (
            <>
              <h3>Apparence</h3>
              <p className="sb-sub">Basculez entre les thèmes clair et sombre. La carte 3D s'adapte automatiquement.</p>
              <div className="set-row">
                <div className="sr-text"><h4>Thème {theme === "dark" ? "sombre" : "clair"}</h4><p>Le mode sombre met en valeur les accents néon et la scène 3D.</p></div>
                <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
                  <span className="icon-sun"><Icon name="sun" size={16} /></span><span className="icon-moon"><Icon name="moon" size={16} /></span>
                  Basculer
                </button>
              </div>
              <div className="set-row">
                <div className="sr-text"><h4>Réductions de mouvement</h4><p>Respecte le réglage système « prefers-reduced-motion ».</p></div>
                <span style={{ fontSize: 13, color: "var(--faint)" }}>Automatique</span>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3>Notifications</h3>
              <p className="sb-sub">Choisissez les alertes que vous souhaitez recevoir.</p>
              <div className="set-row">
                <div className="sr-text"><h4>État des transactions</h4><p>Signature, confirmation et vérification de vos paiements.</p></div>
                <Switch on={notif.tx} onClick={() => setNotif({ ...notif, tx: !notif.tx })} />
              </div>
              <div className="set-row">
                <div className="sr-text"><h4>Rappels de session</h4><p>Soyez prévenu avant l'expiration de votre stationnement.</p></div>
                <Switch on={notif.reminders} onClick={() => setNotif({ ...notif, reminders: !notif.reminders })} />
              </div>
              <div className="set-row">
                <div className="sr-text"><h4>Actualités ParkChain</h4><p>Nouvelles villes, fonctionnalités et offres du réseau.</p></div>
                <Switch on={notif.marketing} onClick={() => setNotif({ ...notif, marketing: !notif.marketing })} />
              </div>
            </>
          )}

          {tab === "network" && (
            <>
              <h3>Réseau &amp; wallet</h3>
              <p className="sb-sub">Connexion blockchain actuelle.</p>
              <div className="set-row">
                <div className="sr-text"><h4>Réseau</h4><p>Vous êtes connecté au réseau de développement.</p></div>
                <span className="tb-pill"><span className="net-dot"></span> {user.network}</span>
              </div>
              <div className="set-row">
                <div className="sr-text"><h4>Portefeuille connecté</h4><p style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{user.address}</p></div>
                <span className="mm-badge"><span className="fox"></span> MetaMask</span>
              </div>
              <div className="set-row">
                <div className="sr-text"><h4>Déconnexion</h4><p>Vous reviendrez à l'écran de connexion du portefeuille.</p></div>
                <button className="btn btn-danger btn-sm" onClick={onDisconnect}><Icon name="logout" size={16} /> Déconnecter</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HistoryView, WalletView, SettingsView, Switch });
