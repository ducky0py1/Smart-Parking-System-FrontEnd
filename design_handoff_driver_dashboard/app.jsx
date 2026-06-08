// ============================================================
//  ParkChain Dashboard — main app
//  Ties together shell, views, modals, 3D map, toasts, tweaks.
//  Uses globals: Sidebar, Topbar, ToastStack, MapView, HistoryView,
//  WalletView, SettingsView, ProfileModal, PaymentModal, Icon,
//  useTweaks + Tweak* controls, window.SP.
// ============================================================
const { useState, useEffect, useRef, useCallback } = React;

const SP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "sidebar": "expanded",
  "showOverlay": true,
  "radius": 16,
  "compactNav": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(SP_TWEAK_DEFAULTS);

  // remove boot loader once mounted (robust: not dependent on rAF timeline)
  useEffect(() => {
    const b = document.getElementById("boot");
    if (b) { b.classList.add("gone"); setTimeout(() => { if (b.parentNode) b.remove(); }, 650); }
  }, []);

  const [view, setView] = useState("map");
  const [theme, setTheme] = useState(() => localStorage.getItem("pc-theme") || "dark");
  const [navOpen, setNavOpen] = useState(false);

  const [spots, setSpots] = useState(() => window.SP.getSpots());
  const [profile, setProfile] = useState({ firstName: window.SP.user.firstName, lastName: window.SP.user.lastName, email: window.SP.user.email });
  const [showProfile, setShowProfile] = useState(!window.SP.user.email);
  const [debt, setDebt] = useState(window.SP.user.debt);
  const [balance, setBalance] = useState(window.SP.user.balance);
  const [payingSpot, setPayingSpot] = useState(null);
  const [activeResv, setActiveResv] = useState(null);
  const [history, setHistory] = useState(window.SP.history);
  const [toasts, setToasts] = useState([]);

  /* ---- theme: reflect to <html data-theme> + persist ---- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pc-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((x) => (x === "dark" ? "light" : "dark"));

  /* ---- corner radius tweak ---- */
  useEffect(() => {
    document.documentElement.style.setProperty("--panel-radius", t.radius + "px");
    document.documentElement.style.setProperty("--radius", t.radius + 2 + "px");
  }, [t.radius]);

  /* ---- real-time polling (ParkingContext analogue, every 3s) ---- */
  useEffect(() => {
    const id = setInterval(() => setSpots(window.SP.tick()), 3000);
    return () => clearInterval(id);
  }, []);

  /* ---- toasts ---- */
  const pushToast = useCallback((toast) => {
    const id = "t" + Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, ...toast }]);
    if (toast.ttl) setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), toast.ttl);
    return id;
  }, []);
  const removeToast = useCallback((id) => setToasts((arr) => arr.filter((x) => x.id !== id)), []);
  const updateToast = useCallback((id, patch) => setToasts((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);

  /* ---- profile completion ---- */
  function completeProfile(form) {
    setProfile(form);
    window.SP.user.firstName = form.firstName; window.SP.user.lastName = form.lastName; window.SP.user.email = form.email;
    setShowProfile(false);
    pushToast({ kind: "success", title: "Profil complété", sub: "Bienvenue, " + form.firstName + " !", ttl: 3200 });
  }

  /* ---- reservation / payment ---- */
  function selectSpot(spot) { setPayingSpot(spot); }

  function onConfirmed({ spot, txHash, total, subtotal, durationMin }) {
    // mark spot reserved
    setSpots((arr) => arr.map((s) => (s.id === spot.id ? { ...s, status: "reserved" } : s)));
    // clear debt (it was included in total), debit balance
    setDebt(0); window.SP.user.debt = 0;
    setBalance((b) => +(b - total).toFixed(4));
    // active session — uses the chosen duration
    setActiveResv({ id: "r-" + Date.now(), label: spot.label, durationMin, startTime: Date.now(), price: subtotal, txHash });
    // history
    setHistory((h) => [{ id: "r-" + Date.now(), label: spot.label, date: "À l'instant", durationMin, amountEth: total, status: "active", txHash }, ...h]);
    setPayingSpot(null);
    setView("map");
    pushToast({ kind: "success", title: "Réservation vérifiée", sub: "Place " + spot.label + " · " + window.SP.durLabel(durationMin), ttl: 4200 });
  }

  function endSession() {
    if (!activeResv) return;
    const lbl = activeResv.label;
    setSpots((arr) => arr.map((s) => (s.label === lbl ? { ...s, status: "free" } : s)));
    setHistory((h) => h.map((r) => (r.status === "active" ? { ...r, status: "completed", date: "À l'instant" } : r)));
    setActiveResv(null);
    pushToast({ kind: "success", title: "Session terminée", sub: "Place " + lbl + " libérée", ttl: 3200 });
  }
  function extendSession() {
    if (!activeResv) return;
    setActiveResv((r) => ({ ...r, durationMin: r.durationMin + 30 }));
    pushToast({ kind: "success", title: "Session prolongée", sub: "+30 minutes ajoutées", ttl: 2600 });
  }

  /* ---- pay debt directly from wallet ---- */
  async function payDebt() {
    if (debt <= 0) return;
    const id = pushToast({ kind: "pending", title: "Connexion à MetaMask…", sub: "Règlement de la dette" });
    const amount = debt;
    await window.SP.blockchain.payForSpot("debt", amount, (s) => {
      if (s === 2) updateToast(id, { title: "Confirmation sur la blockchain…", sub: "En attente du reçu réseau" });
    });
    removeToast(id);
    setDebt(0); window.SP.user.debt = 0;
    setBalance((b) => +(b - amount).toFixed(4));
    pushToast({ kind: "success", title: "Dette réglée", sub: window.SP.fmtEth(amount) + " ETH payés", ttl: 3600 });
  }

  function disconnect() {
    pushToast({ kind: "pending", title: "Déconnexion…", sub: "Retour à l'écran de connexion", ttl: 2600 });
    // TODO(Claude Code): AuthContext.disconnect() / navigate to /login
  }

  const freeCount = spots.filter((s) => s.status === "free").length;
  const sidebarMode = t.compactNav ? "rail" : t.sidebar;

  const user = { ...window.SP.user, network: window.SP.user.network };

  return (
    <div className={"app" + (navOpen ? " nav-open" : "")} data-sidebar={sidebarMode}>
      {sidebarMode !== "floating" || true ? (
        <Sidebar view={view} setView={(v) => { setView(v); setNavOpen(false); }} freeCount={freeCount} debt={debt} profile={profile} />
      ) : null}

      <div className="main">
        <Topbar
          view={view} theme={theme} toggleTheme={toggleTheme}
          user={{ ...user, balance }} debt={debt}
          onBurger={() => setNavOpen((x) => !x)}
          onBell={() => pushToast({ kind: "success", title: "Vous êtes à jour", sub: "Aucune nouvelle notification", ttl: 2600 })}
          notifCount={debt > 0 ? 1 : 0}
        />

        <div className="content">
          {view === "map" && (
            <MapView
              spots={spots} theme={theme} onSelectSpot={selectSpot}
              activeResv={activeResv} onEndSession={endSession} onExtend={extendSession}
              tweaks={t}
            />
          )}
          {view === "history" && <HistoryView history={history} activeResv={activeResv} />}
          {view === "wallet" && <WalletView user={{ ...user, balance }} debt={debt} history={history} onPayDebt={payDebt} pushToast={pushToast} />}
          {view === "settings" && (
            <SettingsView
              user={user} theme={theme} toggleTheme={toggleTheme}
              profile={profile} onSaveProfile={(f) => { setProfile(f); window.SP.user.firstName = f.firstName; window.SP.user.lastName = f.lastName; window.SP.user.email = f.email; }}
              pushToast={pushToast} onDisconnect={disconnect}
            />
          )}
        </div>
      </div>

      {/* overlays */}
      <ToastStack toasts={toasts} />
      {showProfile && <ProfileModal onComplete={completeProfile} />}
      {payingSpot && <PaymentModal spot={payingSpot} debt={debt} onClose={() => setPayingSpot(null)} onConfirmed={onConfirmed} />}

      {/* hide overlay panels via tweak */}
      {!t.showOverlay && <style>{`.legend-card, .avail-card { display:none !important; }`}</style>}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Disposition" />
        <TweakRadio label="Barre latérale" value={t.compactNav ? "rail" : t.sidebar}
          options={[{ value: "expanded", label: "Étendue" }, { value: "rail", label: "Rail" }, { value: "floating", label: "Flottante" }]}
          onChange={(v) => { setTweak("sidebar", v); setTweak("compactNav", false); }} />
        <TweakToggle label="Panneaux sur la carte" value={t.showOverlay} onChange={(v) => setTweak("showOverlay", v)} />
        <TweakSection label="Style" />
        <TweakSlider label="Arrondi des coins" value={t.radius} min={8} max={24} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
