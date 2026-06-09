import { useState } from 'react';
import { ethers } from 'ethers';
import DashboardIcon from './DashboardIcon';
import { TARIF, currentPeriod, computePrice, durLabel, fmtEth, ethToMad } from './utils';
import api from '../../services/api';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'spotId', type: 'uint256' }],
    name: 'payForSpot',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

const TX_STEPS = [
  { t: 'Signature de la transaction',    p: 'MetaMask s\'ouvre — validez le montant exact.' },
  { t: 'Confirmation sur la blockchain', p: 'Le smart contract attend le reçu du réseau.' },
  { t: 'Réservation vérifiée',           p: 'Le backend Laravel est notifié, la place est à vous.' },
];

export default function PaymentModal({ spot, debt, onClose, onConfirmed, pushToast }) {
  const [phase,   setPhase]   = useState('review'); // review | tx | done
  const [step,    setStep]    = useState(0);
  const [hours,   setHours]   = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [period,  setPeriod]  = useState(currentPeriod());
  const [err,     setErr]     = useState('');

  const durationMin = Math.max(15, hours * 60 + minutes);
  const tarif       = TARIF[period];
  const subtotal    = computePrice(durationMin, period);
  const total       = +(subtotal + debt).toFixed(4);

  function stepH(d) { setHours((h) => Math.max(0, Math.min(12, h + d))); }
  function stepM(d) {
    setMinutes((m) => {
      let v = m + d;
      if (v < 0) v = 45;
      if (v > 45) v = 0;
      return v;
    });
  }

  async function confirm() {
    setErr('');
    setPhase('tx');
    setStep(1); // Signing

    try {
      if (!window.ethereum) throw new Error('MetaMask non installé.');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const wei      = ethers.parseEther(String(total));

      // tx submission (MetaMask opens here — step 1)
      const tx      = await contract.payForSpot(spot.id, { value: wei });
      setStep(2); // Confirming on blockchain

      const receipt = await tx.wait();
      setStep(3); // Notifying Laravel

      const txHash = receipt.hash;
      await api.post('/reservations', {
        spot_id:          spot.id,
        transaction_hash: txHash,
        amount:           total,
        duration_min:     durationMin,
        period,
      });

      setPhase('done');
      setTimeout(
        () => onConfirmed({ spot, txHash, total, subtotal, durationMin, period }),
        1100
      );
    } catch (e) {
      const msg = e?.reason || e?.message || 'Erreur lors du paiement';
      setErr(msg);
      setPhase('review');
      if (pushToast) pushToast({ kind: 'error', title: 'Paiement échoué', sub: msg.slice(0, 80), ttl: 4000 });
    }
  }

  const busy   = phase === 'tx';
  const review = phase === 'review';

  return (
    <div
      className="modal-scrim"
      role="dialog"
      aria-modal="true"
      onClick={() => !busy && phase !== 'done' && onClose()}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {review && (
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <DashboardIcon name="x" size={16} />
          </button>
        )}

        <div className="modal-pad">
          <span className="modal-eyebrow">
            <DashboardIcon name="pin" size={14} /> Réservation de place
          </span>
          <h3>Confirmer &amp; payer</h3>

          {/* Spot preview */}
          <div className="spot-preview">
            <div className="sp-sq free">{spot.label}</div>
            <div className="sp-info">
              <h4>Place {spot.label} · {spot.level}</h4>
              <p>Disponible immédiatement · capteur vérifié</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#7aff3c', fontSize: 13, fontWeight: 600 }}>
                <span className="dot-free" /> Libre
              </div>
            </div>
          </div>

          {/* Review phase */}
          {review && (
            <>
              {/* Duration steppers */}
              <div className="field-label">Durée de stationnement</div>
              <div className="dur-grid">
                <div className="stepper">
                  <button className="st-btn" onClick={() => stepH(-1)} aria-label="Moins une heure">
                    <DashboardIcon name="minus" size={16} />
                  </button>
                  <div><span className="st-val">{hours}</span><span className="st-unit">h</span></div>
                  <button className="st-btn" onClick={() => stepH(1)} aria-label="Plus une heure">
                    <DashboardIcon name="plus" size={16} />
                  </button>
                </div>
                <div className="stepper">
                  <button className="st-btn" onClick={() => stepM(-15)} aria-label="Moins 15 minutes">
                    <DashboardIcon name="minus" size={16} />
                  </button>
                  <div>
                    <span className="st-val">{String(minutes).padStart(2, '0')}</span>
                    <span className="st-unit">min</span>
                  </div>
                  <button className="st-btn" onClick={() => stepM(15)} aria-label="Plus 15 minutes">
                    <DashboardIcon name="plus" size={16} />
                  </button>
                </div>
              </div>

              {/* Quick chips */}
              <div className="dur-chips">
                {[[0, 30], [1, 0], [2, 0], [4, 0]].map(([h, m]) => (
                  <button
                    key={`${h}-${m}`}
                    className={'dur-chip' + (hours === h && minutes === m ? ' on' : '')}
                    onClick={() => { setHours(h); setMinutes(m); }}
                  >
                    {durLabel(h * 60 + m)}
                  </button>
                ))}
              </div>

              {/* Day / Night tarif */}
              <div className="field-label">Tarif</div>
              <div className="tarif-seg">
                {['day', 'night'].map((p) => {
                  const tr = TARIF[p];
                  return (
                    <button
                      key={p}
                      className={'tarif-opt' + (period === p ? ' on' : '')}
                      onClick={() => setPeriod(p)}
                    >
                      <div className="to-top">
                        <DashboardIcon name={p === 'day' ? 'sun' : 'moon'} size={15} />
                        {tr.label}
                        {currentPeriod() === p && <span className="to-now">maintenant</span>}
                      </div>
                      <div className="to-rate">{fmtEth(tr.rate)} <small>ETH/h</small></div>
                      <div className="to-win">{tr.window}</div>
                    </button>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="pay-summary">
                <div className="pay-row">
                  <span>Tarif {tarif.label.toLowerCase()} · {fmtEth(tarif.rate)} × {durLabel(durationMin)}</span>
                  <span className="v">{fmtEth(subtotal)} ETH</span>
                </div>
                {debt > 0 && (
                  <div className="pay-row debt">
                    <span>Dette impayée</span>
                    <span className="v">+ {fmtEth(debt)} ETH</span>
                  </div>
                )}
                <hr className="pay-divider" />
                <div className="pay-total-row">
                  <span className="lbl">Total à régler</span>
                  <span className="v">{fmtEth(total)} <small>ETH</small></span>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--faint)', fontSize: 12.5, marginTop: 4 }}>
                  ≈ {ethToMad(total)} MAD
                </div>
              </div>

              {err && (
                <p style={{ color: 'var(--neon-pink)', fontSize: 13, marginTop: 10 }}>{err}</p>
              )}
            </>
          )}

          {/* Tx stepper */}
          {(phase === 'tx' || phase === 'done') && (
            <div className="tx-steps">
              {TX_STEPS.map((s, i) => {
                const n     = i + 1;
                const state = phase === 'done' || step > n ? 'done' : step === n ? 'active' : '';
                return (
                  <div key={i}>
                    <div className={`tx-step ${state}`}>
                      <span className="tx-n">
                        {state === 'done'   ? <DashboardIcon name="check"   size={16} stroke={2.6} /> :
                         state === 'active' ? <DashboardIcon name="spinner" size={16} className="tx-spin" stroke={2.2} /> :
                         n}
                      </span>
                      <div className="tx-body">
                        <h4>{s.t}</h4>
                        <p>{s.p}</p>
                      </div>
                    </div>
                    {i < TX_STEPS.length - 1 && <div className="tx-line" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="modal-actions">
            {review && (
              <button className="btn btn-wallet btn-lg" onClick={confirm}>
                <DashboardIcon name="wallet" size={18} />
                Payer {fmtEth(total)} ETH via MetaMask
              </button>
            )}
            {phase === 'tx' && (
              <button className="btn btn-wallet btn-lg" disabled style={{ opacity: 0.7 }}>
                <DashboardIcon name="spinner" size={18} className="ts-spin" stroke={2.2} />
                Transaction en cours…
              </button>
            )}
            {phase === 'done' && (
              <button
                className="btn btn-wallet btn-lg"
                disabled
                style={{ background: 'linear-gradient(135deg, oklch(0.76 0.18 150), oklch(0.66 0.2 160))', borderColor: 'transparent' }}
              >
                <DashboardIcon name="check" size={18} stroke={2.4} /> Réservation vérifiée
              </button>
            )}
          </div>

          {review && (
            <p className="modal-note">
              Prix = tarif {tarif.label.toLowerCase()} × durée, dette éventuelle incluse. Une seule signature.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
