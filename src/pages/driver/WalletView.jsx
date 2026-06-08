import DashboardIcon from './DashboardIcon';
import { fmtEth, ethToMad, shortAddr, shortHash, GANACHE_EXPLORER } from './utils';

export default function WalletView({ user, debt, history, onPayDebt, pushToast }) {
  const spent = history.reduce((a, r) => a + r.amountEth, 0);

  function copyAddr() {
    navigator.clipboard?.writeText(user.address);
    pushToast({ kind: 'success', title: 'Adresse copiée', sub: shortAddr(user.address), ttl: 2600 });
  }

  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Portefeuille</h2>
        <p>Votre solde, votre dette et votre activité récente sur le réseau ParkChain.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.3fr 1fr', marginBottom: 22 }}>
        <div className="wallet-hero glass-panel">
          <div className="wh-top">
            <span className="wh-label">Solde du portefeuille</span>
            <span className="mm-badge"><span className="fox" /> MetaMask</span>
          </div>
          <div className="wh-bal">
            {fmtEth(user.balance)} <span className="eth">ETH</span>
          </div>
          <div className="wh-fiat">≈ {ethToMad(user.balance)} MAD · {user.network}</div>
          <div className="wh-addr">
            {shortAddr(user.address)}
            <button onClick={copyAddr} title="Copier l'adresse">
              <DashboardIcon name="copy" size={15} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card metric pink" style={{ flex: 1 }}>
            <div className="m-top">
              <span>Dette en cours</span>
              <span className="m-ico"><DashboardIcon name="alert" size={19} /></span>
            </div>
            <div className="m-val">
              {fmtEth(debt)}<span style={{ fontSize: 18, color: 'var(--muted)' }}> ETH</span>
            </div>
            <div className="m-sub">
              {debt > 0 ? 'Ajoutée à votre prochain paiement' : 'Aucune dette — tout est réglé'}
            </div>
          </div>
          <div className="card metric cyan" style={{ flex: 1 }}>
            <div className="m-top">
              <span>Dépense totale</span>
              <span className="m-ico"><DashboardIcon name="trend" size={19} /></span>
            </div>
            <div className="m-val">
              {fmtEth(spent)}<span style={{ fontSize: 18, color: 'var(--muted)' }}> ETH</span>
            </div>
            <div className="m-sub">sur {history.length} réservations</div>
          </div>
        </div>
      </div>

      {debt > 0 && (
        <div className="debt-banner" style={{ marginBottom: 22 }}>
          <div className="db-ico"><DashboardIcon name="alert" size={22} /></div>
          <div className="db-text">
            <h4>Vous avez une dette impayée</h4>
            <p>Elle sera automatiquement ajoutée à votre prochaine réservation, ou réglez-la maintenant.</p>
          </div>
          <div className="db-amt">{fmtEth(debt)} ETH</div>
          <button className="btn btn-wallet btn-sm" onClick={onPayDebt} style={{ marginLeft: 8 }}>
            <DashboardIcon name="wallet" size={16} /> Régler
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Activité récente</h3>
          <span style={{ fontSize: 13, color: 'var(--faint)' }}>{user.network}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {history.slice(0, 4).map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}
            >
              <span className="sq" style={{
                width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                border: '1px solid var(--border-2)', background: 'var(--surface-2)',
              }}>
                {r.label}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Stationnement · Place {r.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--faint)' }}>{r.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="amt" style={{ color: 'var(--neon-pink)' }}>
                  − {fmtEth(r.amountEth)} ETH
                </div>
                <a
                  className="tx-link"
                  style={{ fontSize: 12 }}
                  href={GANACHE_EXPLORER + r.txHash}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortHash(r.txHash)} <DashboardIcon name="external" size={12} />
                </a>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--faint)' }}>
              Aucune activité on-chain pour ce portefeuille.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
