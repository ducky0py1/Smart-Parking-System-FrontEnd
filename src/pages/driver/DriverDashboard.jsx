import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useAuth }    from '../../context/AuthContext';
import { useParking } from '../../context/ParkingContext';
import { useTheme }   from '../../context/ThemeContext';
import { payDebt as blockchainPayDebt } from '../../services/blockchainService';
import api from '../../services/api';

import Sidebar       from './Sidebar';
import Topbar        from './Topbar';
import ToastStack    from './ToastStack';
import MapView       from './MapView';
import HistoryView   from './HistoryView';
import WalletView    from './WalletView';
import SettingsView  from './SettingsView';
import ProfileModal  from './ProfileModal';
import PaymentModal  from './PaymentModal';

import {
  normaliseUser, normaliseSpot, normaliseReservation,
  fmtEth, durLabel,
} from './utils';

import './dashboard.css';

export default function DriverDashboard() {
  const { user, updateProfile, logout } = useAuth();
  const { spots: rawSpots, refreshSpots }  = useParking();
  const { theme, toggleTheme }             = useTheme();
  const navigate = useNavigate();

  const [view,        setView]        = useState('map');
  const [navOpen,     setNavOpen]     = useState(false);
  const [payingSpot,  setPayingSpot]  = useState(null);
  const [activeResv,  setActiveResv]  = useState(null);
  const [history,     setHistory]     = useState([]);
  const [balance,     setBalance]     = useState(0);
  const [localDebt,   setLocalDebt]   = useState(null); // null = use user.debt
  const [toasts,      setToasts]      = useState([]);
  const [profileDone, setProfileDone] = useState(false); // explicit close flag

  const normUser  = normaliseUser(user);
  const normSpots = rawSpots.map(normaliseSpot);
  const debt      = localDebt !== null ? localDebt : (normUser?.debt || 0);
  const profile   = { firstName: normUser?.firstName, lastName: normUser?.lastName, email: normUser?.email };
  // Never show profile modal again for a wallet that completed it once —
  // survives page refreshes via localStorage, keyed per wallet address.
  const profileStorageKey = normUser?.address ? `pc_profile_done_${normUser.address}` : null;
  const profilePersisted  = !!(profileStorageKey && localStorage.getItem(profileStorageKey));
  const showProfile = !profileDone && !profilePersisted && (!user?.first_name || !user?.email);

  // Lock body background for full-screen dashboard, restore on unmount
  useEffect(() => {
    document.body.classList.add('pc-bg');
    return () => document.body.classList.remove('pc-bg');
  }, []);

  // Fetch live wallet balance from MetaMask provider
  useEffect(() => {
    if (!normUser?.address || !window.ethereum) return;
    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const raw = await provider.getBalance(normUser.address);
        setBalance(parseFloat(ethers.formatEther(raw)));
      } catch (_) {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normUser?.address]);

  // Fetch reservation history on mount
  useEffect(() => {
    api.get('/reservations/history')
      .then(({ data }) => {
        const raw = Array.isArray(data) ? data : (data.data ?? []);
        setHistory(raw.map(normaliseReservation));
      })
      .catch(() => {});
  }, []);

  /* ---- toast helpers ------------------------------------------------- */
  const pushToast = useCallback((toast) => {
    const id = `t${Date.now()}${Math.random()}`;
    setToasts((arr) => [...arr, { id, ...toast }]);
    if (toast.ttl) setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), toast.ttl);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((arr) => arr.filter((x) => x.id !== id));
  }, []);

  const updateToast = useCallback((id, patch) => {
    setToasts((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  /* ---- profile completion -------------------------------------------- */
  async function completeProfile({ firstName, lastName, email }) {
    // Let any API error bubble up to ProfileModal so it shows inline
    await updateProfile({ first_name: firstName, last_name: lastName, email });
    // Persist the flag so this wallet never sees the popup again, even after refresh.
    if (profileStorageKey) localStorage.setItem(profileStorageKey, '1');
    setProfileDone(true);
    pushToast({ kind: 'success', title: 'Profil complété', sub: `Bienvenue, ${firstName} !`, ttl: 3200 });
  }

  /* ---- spot selection / payment -------------------------------------- */
  function selectSpot(spot) {
    if (spot.status !== 'free') return;
    setPayingSpot(spot);
  }

  function onConfirmed({ spot, txHash, total, subtotal, durationMin }) {
    setActiveResv({
      id:          `r-${Date.now()}`,
      label:       spot.label,
      durationMin,
      startTime:   Date.now(),
      price:       subtotal,
      txHash,
    });
    setLocalDebt(0);
    setBalance((b) => +(b - total).toFixed(4));
    setHistory((h) => [{
      id:          `r-${Date.now()}`,
      label:       spot.label,
      date:        'À l\'instant',
      durationMin,
      amountEth:   total,
      status:      'active',
      txHash,
    }, ...h]);
    setPayingSpot(null);
    refreshSpots();
    pushToast({ kind: 'success', title: 'Réservation vérifiée', sub: `Place ${spot.label} · ${durLabel(durationMin)}`, ttl: 4200 });
  }

  /* ---- session management -------------------------------------------- */
  async function endSession() {
    if (!activeResv) return;
    const lbl  = activeResv.label;
    const spot = normSpots.find((s) => s.label === lbl);

    // Immediately update local UI so the user gets instant feedback
    setHistory((h) => h.map((r) => (r.status === 'active' ? { ...r, status: 'completed', date: 'À l\'instant' } : r)));
    setActiveResv(null);
    pushToast({ kind: 'success', title: 'Session terminée', sub: `Place ${lbl} libérée`, ttl: 3200 });

    // Tell the backend to free the spot and close the reservation
    if (spot) {
      try {
        const { data } = await api.post('/reservations/end', { spot_id: spot.id });
        // Sync any overtime debt the backend may have calculated
        if (typeof data.debt === 'number') setLocalDebt(data.debt);
      } catch (_) {
        // Silent fail — the 3-second poll will eventually sync the real status
      }
    }
    refreshSpots();
  }

  function extendSession() {
    if (!activeResv) return;
    setActiveResv((r) => ({ ...r, durationMin: r.durationMin + 30 }));
    pushToast({ kind: 'success', title: 'Session prolongée', sub: '+30 minutes ajoutées', ttl: 2600 });
  }

  /* ---- debt payment -------------------------------------------------- */
  async function payDebtHandler() {
    if (debt <= 0) return;
    const amount = debt;
    const id = pushToast({ kind: 'pending', title: 'Connexion à MetaMask…', sub: 'Règlement de la dette' });
    try {
      updateToast(id, { title: 'Confirmation sur la blockchain…', sub: 'En attente du reçu réseau' });
      await blockchainPayDebt(amount.toString());
      removeToast(id);
      setLocalDebt(0);
      setBalance((b) => +(b - amount).toFixed(4));
      pushToast({ kind: 'success', title: 'Dette réglée', sub: `${fmtEth(amount)} ETH payés`, ttl: 3600 });
    } catch (e) {
      removeToast(id);
      pushToast({ kind: 'error', title: 'Erreur de paiement', sub: (e.message || '').slice(0, 80), ttl: 4000 });
    }
  }

  /* ---- profile save (settings tab) ----------------------------------- */
  async function saveProfile(form) {
    await updateProfile({ first_name: form.firstName, last_name: form.lastName, email: form.email });
    pushToast({ kind: 'success', title: 'Profil mis à jour', sub: 'Vos informations ont été enregistrées', ttl: 2600 });
  }

  /* ---- disconnect ---------------------------------------------------- */
  function disconnect() {
    pushToast({ kind: 'pending', title: 'Déconnexion…', sub: 'Retour à l\'écran de connexion', ttl: 2200 });
    setTimeout(() => { logout(); navigate('/login'); }, 600);
  }

  const freeCount = normSpots.filter((s) => s.status === 'free').length;

  return (
    <div
      className={'pc-dashboard app' + (navOpen ? ' nav-open' : '')}
      data-sidebar="expanded"
      data-theme={theme}
    >
      <Sidebar
        view={view}
        setView={(v) => { setView(v); setNavOpen(false); }}
        freeCount={freeCount}
        debt={debt}
        profile={profile}
        walletAddress={normUser?.address || ''}
      />

      <div className="main">
        <Topbar
          view={view}
          theme={theme}
          toggleTheme={toggleTheme}
          walletAddress={normUser?.address || ''}
          network={normUser?.network || 'Ganache · 1337'}
          debt={debt}
          onBurger={() => setNavOpen((x) => !x)}
          onBell={() => pushToast({ kind: 'success', title: 'Vous êtes à jour', sub: 'Aucune nouvelle notification', ttl: 2600 })}
          notifCount={debt > 0 ? 1 : 0}
        />

        <div className="content">
          {view === 'map' && (
            <MapView
              spots={normSpots}
              theme={theme}
              onSelectSpot={selectSpot}
              activeResv={activeResv}
              onEndSession={endSession}
              onExtend={extendSession}
            />
          )}
          {view === 'history' && (
            <HistoryView history={history} activeResv={activeResv} />
          )}
          {view === 'wallet' && (
            <WalletView
              user={{ ...normUser, balance }}
              debt={debt}
              history={history}
              onPayDebt={payDebtHandler}
              pushToast={pushToast}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              user={{ ...normUser, balance }}
              theme={theme}
              toggleTheme={toggleTheme}
              profile={profile}
              onSaveProfile={saveProfile}
              pushToast={pushToast}
              onDisconnect={disconnect}
            />
          )}
        </div>
      </div>

      <ToastStack toasts={toasts} />

      {showProfile && (
        <ProfileModal onComplete={completeProfile} />
      )}

      {payingSpot && (
        <PaymentModal
          spot={payingSpot}
          debt={debt}
          onClose={() => setPayingSpot(null)}
          onConfirmed={onConfirmed}
          pushToast={pushToast}
        />
      )}
    </div>
  );
}
