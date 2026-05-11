import { useState } from 'react';
import { X, Copy, Check, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useReservation } from '../hooks/useReservation';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { toast } from './ui/Toast';

export default function ReservationModal({ spot, onClose }) {
  const { user } = useAuth();
  const { reserve } = useReservation();
  const [step, setStep] = useState('review');   // review | paying | confirmed
  const [endTime, setEndTime] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const debt      = parseFloat(user?.debt) || 0;
  const price     = parseFloat(spot?.price) || 0;
  const total     = price + debt;

  // Min datetime = now + 15 min
  const minDateTime = new Date(Date.now() + 15 * 60 * 1000)
    .toISOString().slice(0, 16);

  async function handleConfirm() {
    if (!endTime) {
      toast('Veuillez sélectionner une heure de fin.', 'error');
      return;
    }
    setError(null);
    setStep('paying');
    try {
      const hash = await reserve(spot, endTime);
      setTxHash(hash);
      setStep('confirmed');
    } catch (err) {
      setError(err.message || 'Transaction annulée ou échouée.');
      setStep('review');
      toast('Transaction échouée : ' + (err.message || 'Erreur'), 'error');
    }
  }

  function copyHash() {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === 'paying' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--surface2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400 text-lg tracking-wider">
              {spot?.label}
            </span>
            <span className="text-[var(--muted)] text-sm">/ Réservation</span>
          </div>
          {step !== 'paying' && (
            <button onClick={onClose} className="text-[var(--muted)] hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* STEP: REVIEW */}
        {step === 'review' && (
          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {/* Price breakdown */}
            <div className="rounded-xl bg-[var(--surface3)] border border-[var(--border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between">
                <span className="text-xs font-mono text-[var(--muted)]">PRIX PLACE</span>
                <span className="text-sm font-mono text-white">{price.toFixed(6)} ETH</span>
              </div>
              {debt > 0 && (
                <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between">
                  <span className="text-xs font-mono text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> DETTE
                  </span>
                  <span className="text-sm font-mono text-red-300">{debt.toFixed(6)} ETH</span>
                </div>
              )}
              <div className="px-4 py-3 flex justify-between bg-emerald-500/5">
                <span className="text-xs font-mono text-emerald-400 font-bold">TOTAL</span>
                <span className="text-base font-mono text-emerald-300 font-bold">{total.toFixed(6)} ETH</span>
              </div>
            </div>

            {/* End time */}
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-2 tracking-wider">
                HEURE DE FIN PRÉVUE
              </label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--surface3)] border border-[var(--border)] text-[var(--text)] font-mono text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
            </div>

            <Button fullWidth onClick={handleConfirm}>
              ⚡ CONFIRMER ET PAYER
            </Button>
          </div>
        )}

        {/* STEP: PAYING */}
        {step === 'paying' && (
          <div className="p-12 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Loader2 size={32} className="text-emerald-400 animate-spin" />
              </div>
            </div>
            <div>
              <p className="font-mono font-bold text-white mb-1">EN ATTENTE METAMASK…</p>
              <p className="text-xs text-[var(--muted)]">Veuillez confirmer la transaction dans votre portefeuille</p>
            </div>
            <div className="w-full px-4 py-3 rounded-lg bg-[var(--surface3)] border border-[var(--border)]">
              <p className="text-xs font-mono text-[var(--muted)] text-center">
                Montant : <span className="text-emerald-300">{total.toFixed(6)} ETH</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP: CONFIRMED */}
        {step === 'confirmed' && (
          <div className="p-6 space-y-5 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-mono font-bold text-xl text-white">PLACE RÉSERVÉE !</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  La place <span className="text-emerald-400">{spot?.label}</span> vous appartient
                </p>
              </div>
            </div>

            {/* TX Hash */}
            <div className="text-left">
              <p className="text-xs font-mono text-[var(--muted)] mb-2">HASH DE TRANSACTION</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--surface3)] border border-[var(--border)]">
                <span className="font-mono text-xs text-[var(--muted)] flex-1 truncate">
                  {txHash}
                </span>
                <button
                  onClick={copyHash}
                  className="flex-shrink-0 text-[var(--muted)] hover:text-emerald-400 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <Button fullWidth onClick={onClose}>
              RETOUR AU TABLEAU DE BORD
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
