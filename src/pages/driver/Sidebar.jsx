import DashboardIcon from './DashboardIcon';
import { shortAddr } from './utils';

const NAV = [
  { group: 'Conduire' },
  { id: 'map',      label: 'Carte 3D',        icon: 'map' },
  { id: 'history',  label: 'Mes réservations', icon: 'history' },
  { group: 'Compte' },
  { id: 'wallet',   label: 'Portefeuille',     icon: 'wallet' },
  { id: 'settings', label: 'Paramètres',       icon: 'settings' },
];

export default function Sidebar({ view, setView, freeCount, debt, profile, walletAddress }) {
  const initials = profile?.firstName
    ? ((profile.firstName[0] || '') + (profile.lastName ? profile.lastName[0] : '')).toUpperCase()
    : '•';
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : 'Conducteur';

  return (
    <aside className="sidebar">
      <a
        className="side-brand"
        href="#"
        onClick={(e) => { e.preventDefault(); setView('map'); }}
      >
        <span className="brand-mark">
          <DashboardIcon name="P" size={21} />
        </span>
        <span className="bt">
          ParkChain
          <small>Conducteur</small>
        </span>
      </a>

      <nav className="nav-list">
        {NAV.map((item, i) =>
          item.group ? (
            <div className="side-section-label" key={'g' + i}>{item.group}</div>
          ) : (
            <button
              key={item.id}
              className={
                'nav-item' +
                (view === item.id ? ' active' : '') +
                (item.id === 'wallet' && debt > 0 ? ' alert' : '')
              }
              onClick={() => setView(item.id)}
            >
              <span className="ni-ico"><DashboardIcon name={item.icon} size={21} /></span>
              <span className="ni-label">{item.label}</span>
              {item.id === 'map'    && freeCount != null && <span className="ni-badge">{freeCount}</span>}
              {item.id === 'wallet' && debt > 0           && <span className="ni-badge">dette</span>}
            </button>
          )
        )}
      </nav>

      <div className="side-spacer" />

      <button className="side-foot" onClick={() => setView('settings')}>
        <span className="sf-av">{initials}</span>
        <span className="sf-text">
          <b>{fullName}</b>
          <span>{shortAddr(walletAddress)}</span>
        </span>
      </button>
    </aside>
  );
}
