import DashboardIcon from './DashboardIcon';
import { fmtEth, shortAddr } from './utils';

const VIEW_META = {
  map:      { title: 'Carte de stationnement',  sub: 'Sélectionnez une place libre pour réserver' },
  history:  { title: 'Mes réservations',         sub: 'Historique de vos stationnements' },
  wallet:   { title: 'Portefeuille',             sub: 'Solde, dette et activité on-chain' },
  settings: { title: 'Paramètres',               sub: 'Profil, thème et préférences' },
};

export default function Topbar({ view, theme, toggleTheme, walletAddress, network, debt, onBurger, onBell, notifCount }) {
  const meta = VIEW_META[view] || VIEW_META.map;

  return (
    <header className="topbar">
      <button className="tb-burger" onClick={onBurger} aria-label="Menu">
        <DashboardIcon name="menu" size={20} />
      </button>

      <div className="tb-title">
        <h1>{meta.title}</h1>
        <span>{meta.sub}</span>
      </div>

      <div className="tb-spacer" />

      <div className="tb-actions">
        <span className="tb-pill net" title="Réseau blockchain">
          <span className="net-dot" />
          {network}
        </span>

        {debt > 0 && (
          <span className="tb-pill debt" title="Dette impayée — ajoutée à votre prochain paiement">
            Dette&nbsp;<b>{fmtEth(debt)} ETH</b>
          </span>
        )}

        <span className="tb-pill wallet-pill" title={walletAddress}>
          <span
            className="net-dot"
            style={{ background: 'var(--metamask)', boxShadow: '0 0 10px var(--metamask)', animation: 'none' }}
          />
          <b>{shortAddr(walletAddress)}</b>
        </span>

        <button className="icon-btn" onClick={onBell} aria-label="Notifications">
          <DashboardIcon name="bell" size={19} />
          {notifCount > 0 && <span className="nd" />}
        </button>

        <button className="icon-btn theme" onClick={toggleTheme} aria-label="Thème clair / sombre">
          <span className="icon-sun"><DashboardIcon name="sun" size={19} /></span>
          <span className="icon-moon"><DashboardIcon name="moon" size={19} /></span>
        </button>
      </div>
    </header>
  );
}
