// ============================================================
//  ParkChain Dashboard — shell: Sidebar · Topbar · Toasts
//  Uses global Icon. Exports Sidebar, Topbar, ToastStack to window.
// ============================================================
const SP_NAV = [
  { group: "Conduire" },
  { id: "map",      label: "Carte 3D",       icon: "map" },
  { id: "history",  label: "Mes réservations", icon: "history" },
  { group: "Compte" },
  { id: "wallet",   label: "Portefeuille",   icon: "wallet" },
  { id: "settings", label: "Paramètres",     icon: "settings" },
];

function Sidebar({ view, setView, freeCount, debt, profile }) {
  const initials = profile && profile.firstName
    ? ((profile.firstName[0] || "") + (profile.lastName ? profile.lastName[0] : "")).toUpperCase()
    : "•";
  const fullName = profile && profile.firstName ? (profile.firstName + " " + (profile.lastName || "")).trim() : "Conducteur";
  return (
    <aside className="sidebar">
      <a className="side-brand" href="#" onClick={(e) => { e.preventDefault(); setView("map"); }}>
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>
        </span>
        <span className="bt">ParkChain<small>Conducteur</small></span>
      </a>

      <nav className="nav-list">
        {SP_NAV.map((item, i) =>
          item.group ? (
            <div className="side-section-label" key={"g" + i}>{item.group}</div>
          ) : (
            <button
              key={item.id}
              className={"nav-item" + (view === item.id ? " active" : "") + (item.id === "wallet" && debt > 0 ? " alert" : "")}
              onClick={() => setView(item.id)}
            >
              <span className="ni-ico"><Icon name={item.icon} size={21} /></span>
              <span className="ni-label">{item.label}</span>
              {item.id === "map" && freeCount != null && <span className="ni-badge">{freeCount}</span>}
              {item.id === "wallet" && debt > 0 && <span className="ni-badge">dette</span>}
            </button>
          )
        )}
      </nav>

      <div className="side-spacer"></div>

      <button className="side-foot" onClick={() => setView("settings")} style={{ cursor: "pointer", textAlign: "left", width: "100%" }}>
        <span className="sf-av">{initials}</span>
        <span className="sf-text">
          <b>{fullName}</b>
          <span>{window.SP.shortAddr(window.SP.user.address)}</span>
        </span>
      </button>
    </aside>
  );
}

const SP_VIEW_META = {
  map:      { title: "Carte de stationnement", sub: "Sélectionnez une place libre pour réserver" },
  history:  { title: "Mes réservations",        sub: "Historique de vos stationnements" },
  wallet:   { title: "Portefeuille",            sub: "Solde, dette et activité on-chain" },
  settings: { title: "Paramètres",              sub: "Profil, thème et préférences" },
};

function Topbar({ view, theme, toggleTheme, user, debt, onBurger, onBell, notifCount }) {
  const meta = SP_VIEW_META[view] || SP_VIEW_META.map;
  return (
    <header className="topbar">
      <button className="tb-burger" onClick={onBurger} aria-label="Menu"><Icon name="menu" size={20} /></button>
      <div className="tb-title">
        <h1>{meta.title}</h1>
        <span>{meta.sub}</span>
      </div>
      <div className="tb-spacer"></div>
      <div className="tb-actions">
        <span className="tb-pill net" title="Réseau blockchain">
          <span className="net-dot"></span> {user.network}
        </span>
        {debt > 0 && (
          <span className="tb-pill debt" title="Dette impayée — ajoutée à votre prochain paiement">
            Dette&nbsp;<b>{window.SP.fmtEth(debt)} ETH</b>
          </span>
        )}
        <span className="tb-pill wallet-pill" title={user.address}>
          <span className="net-dot" style={{ background: "var(--metamask)", boxShadow: "0 0 10px var(--metamask)" }}></span>
          <b>{window.SP.shortAddr(user.address)}</b>
        </span>
        <button className="icon-btn" onClick={onBell} aria-label="Notifications">
          <Icon name="bell" size={19} />
          {notifCount > 0 && <span className="nd"></span>}
        </button>
        <button className="icon-btn theme" onClick={toggleTheme} aria-label="Thème clair / sombre">
          <span className="icon-sun"><Icon name="sun" size={19} /></span>
          <span className="icon-moon"><Icon name="moon" size={19} /></span>
        </button>
      </div>
    </header>
  );
}

// ---- Toasts -------------------------------------------------------------
function ToastStack({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={"toast show " + (t.kind || "pending")}>
          <div className="ts-ico">
            {t.kind === "success" ? <Icon name="check" size={18} stroke={2.4} />
              : t.kind === "error" ? <Icon name="alert" size={18} />
              : <Icon name="spinner" size={18} className="ts-spin" stroke={2.2} />}
          </div>
          <div>
            <div>{t.title}</div>
            {t.sub && <small>{t.sub}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, ToastStack, SP_VIEW_META });
