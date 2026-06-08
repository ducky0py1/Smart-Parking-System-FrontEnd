import { useState } from 'react';
import DashboardIcon from './DashboardIcon';
import { fmtEth, ethToMad, shortHash, GANACHE_EXPLORER } from './utils';

export default function HistoryView({ history, activeResv }) {
  const [filter, setFilter] = useState('all');
  const [q,      setQ]      = useState('');

  let rows = [...history];
  if (activeResv && !rows.find((r) => r.id === activeResv.id)) {
    rows = [{
      id:          activeResv.id,
      label:       activeResv.label,
      date:        'À l\'instant',
      durationMin: activeResv.durationMin,
      amountEth:   activeResv.price,
      status:      'active',
      txHash:      activeResv.txHash,
    }, ...rows];
  }
  rows = rows.filter((r) =>
    filter === 'all'       ? true :
    filter === 'active'    ? r.status === 'active' :
                             r.status === 'completed'
  );
  if (q.trim()) {
    rows = rows.filter((r) => r.label.toLowerCase().includes(q.trim().toLowerCase()));
  }

  const totalSpent = history.reduce((a, r) => a + r.amountEth, 0);
  const avgDur     = history.length
    ? Math.round(history.reduce((a, r) => a + r.durationMin, 0) / history.length)
    : 0;

  return (
    <div className="content-pad">
      <div className="view-head">
        <h2>Mes réservations</h2>
        <p>Chaque paiement est gravé on-chain. Cliquez une transaction pour l'ouvrir dans l'explorateur Ganache.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 22 }}>
        <div className="card metric green glow-green">
          <div className="m-top">
            <span>Total stationné</span>
            <span className="m-ico"><DashboardIcon name="receipt" size={19} /></span>
          </div>
          <div className="m-val">{history.length + (activeResv ? 1 : 0)}</div>
          <div className="m-sub">réservations au total</div>
        </div>
        <div className="card metric cyan glow-cyan">
          <div className="m-top">
            <span>Dépense cumulée</span>
            <span className="m-ico"><DashboardIcon name="wallet" size={19} /></span>
          </div>
          <div className="m-val">
            {fmtEth(totalSpent)}<span style={{ fontSize: 18, color: 'var(--muted)' }}> ETH</span>
          </div>
          <div className="m-sub">≈ {ethToMad(totalSpent)} MAD</div>
        </div>
        <div className="card metric orange glow-orange">
          <div className="m-top">
            <span>Durée moyenne</span>
            <span className="m-ico"><DashboardIcon name="clock" size={19} /></span>
          </div>
          <div className="m-val">
            {avgDur}<span style={{ fontSize: 18, color: 'var(--muted)' }}> min</span>
          </div>
          <div className="m-sub">par session de stationnement</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-tools">
          <div className="seg">
            {[['all', 'Toutes'], ['active', 'Actives'], ['completed', 'Terminées']].map(([k, l]) => (
              <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
                {l}
              </button>
            ))}
          </div>
          <div className="search-box">
            <DashboardIcon name="search" size={16} />
            <input
              placeholder="Rechercher une place…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="history">
            <thead>
              <tr>
                <th>Place</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="spot-tag">
                      <span className="sq">{r.label}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{r.date}</td>
                  <td>{r.durationMin} min</td>
                  <td><span className="amt">{fmtEth(r.amountEth)} ETH</span></td>
                  <td>
                    <span className={'status-pill ' + (r.status === 'active' ? 'active' : 'done')}>
                      {r.status === 'active' ? (
                        <><span className="dot-free" /> Active</>
                      ) : (
                        <><DashboardIcon name="check" size={13} stroke={2.6} /> Terminée</>
                      )}
                    </span>
                  </td>
                  <td>
                    <a
                      className="tx-link"
                      href={GANACHE_EXPLORER + r.txHash}
                      target="_blank"
                      rel="noreferrer"
                      title={r.txHash}
                    >
                      {shortHash(r.txHash)} <DashboardIcon name="external" size={14} />
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', color: 'var(--faint)', padding: '40px 0' }}
                  >
                    Aucune réservation pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
