import { useState, useEffect } from 'react';
import DashboardIcon from './DashboardIcon';
import { shortAddr } from './utils';

function Switch({ on, onClick }) {
  return (
    <button
      className={'switch' + (on ? ' on' : '')}
      onClick={onClick}
      aria-pressed={on}
    />
  );
}

export default function SettingsView({
  user, theme, toggleTheme, profile,
  onSaveProfile, pushToast, onDisconnect,
}) {
  const [tab,  setTab]  = useState('profile');
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName:  profile.lastName  || '',
    email:     profile.email     || '',
  });
  const [notif, setNotif] = useState({ tx: true, reminders: true, marketing: false });

  useEffect(() => {
    setForm({
      firstName: profile.firstName || '',
      lastName:  profile.lastName  || '',
      email:     profile.email     || '',
    });
  }, [profile]);

  function save() {
    onSaveProfile(form);
    pushToast({ kind: 'success', title: 'Profil mis à jour', sub: 'Vos informations ont été enregistrées', ttl: 2600 });
  }

  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Paramètres</h2>
        <p>Gérez votre profil, l'apparence du tableau de bord et vos préférences.</p>
      </div>

      <div className="settings-grid">
        <nav className="settings-nav">
          {[
            ['profile',       'Profil'],
            ['appearance',    'Apparence'],
            ['notifications', 'Notifications'],
            ['network',       'Réseau & wallet'],
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </nav>

        <div className="card set-block">
          {tab === 'profile' && (
            <>
              <h3>Profil</h3>
              <p className="sb-sub">Ces informations restent privées et ne sont jamais publiées on-chain.</p>
              <div className="field-row">
                <div className="field">
                  <label>Prénom</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Nom</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Adresse du portefeuille</label>
                <input
                  value={user.address}
                  disabled
                  style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, opacity: 0.7 }}
                />
              </div>
              <div style={{ marginTop: 18 }}>
                <button className="btn btn-wallet btn-sm" onClick={save}>
                  <DashboardIcon name="check" size={16} stroke={2.4} /> Enregistrer
                </button>
              </div>
            </>
          )}

          {tab === 'appearance' && (
            <>
              <h3>Apparence</h3>
              <p className="sb-sub">
                Basculez entre les thèmes clair et sombre. La carte 3D s'adapte automatiquement.
              </p>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Thème {theme === 'dark' ? 'sombre' : 'clair'}</h4>
                  <p>Le mode sombre met en valeur les accents néon et la scène 3D.</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
                  <span className="icon-sun"><DashboardIcon name="sun" size={16} /></span>
                  <span className="icon-moon"><DashboardIcon name="moon" size={16} /></span>
                  Basculer
                </button>
              </div>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Réductions de mouvement</h4>
                  <p>Respecte le réglage système « prefers-reduced-motion ».</p>
                </div>
                <span style={{ fontSize: 13, color: 'var(--faint)' }}>Automatique</span>
              </div>
            </>
          )}

          {tab === 'notifications' && (
            <>
              <h3>Notifications</h3>
              <p className="sb-sub">Choisissez les alertes que vous souhaitez recevoir.</p>
              <div className="set-row">
                <div className="sr-text">
                  <h4>État des transactions</h4>
                  <p>Signature, confirmation et vérification de vos paiements.</p>
                </div>
                <Switch on={notif.tx} onClick={() => setNotif({ ...notif, tx: !notif.tx })} />
              </div>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Rappels de session</h4>
                  <p>Soyez prévenu avant l'expiration de votre stationnement.</p>
                </div>
                <Switch
                  on={notif.reminders}
                  onClick={() => setNotif({ ...notif, reminders: !notif.reminders })}
                />
              </div>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Actualités ParkChain</h4>
                  <p>Nouvelles villes, fonctionnalités et offres du réseau.</p>
                </div>
                <Switch
                  on={notif.marketing}
                  onClick={() => setNotif({ ...notif, marketing: !notif.marketing })}
                />
              </div>
            </>
          )}

          {tab === 'network' && (
            <>
              <h3>Réseau &amp; wallet</h3>
              <p className="sb-sub">Connexion blockchain actuelle.</p>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Réseau</h4>
                  <p>Vous êtes connecté au réseau de développement.</p>
                </div>
                <span className="tb-pill">
                  <span className="net-dot" /> {user.network}
                </span>
              </div>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Portefeuille connecté</h4>
                  <p style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                    {shortAddr(user.address)}
                  </p>
                </div>
                <span className="mm-badge"><span className="fox" /> MetaMask</span>
              </div>
              <div className="set-row">
                <div className="sr-text">
                  <h4>Déconnexion</h4>
                  <p>Vous reviendrez à l'écran de connexion du portefeuille.</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={onDisconnect}>
                  <DashboardIcon name="logout" size={16} /> Déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
