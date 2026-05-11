import { useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useDebt } from '../hooks/useDebt';
import Button from './ui/Button';
import { toast } from './ui/Toast';

export default function DebtBanner() {
  const { debt, payDebt } = useDebt();
  const [paying, setPaying] = useState(false);

  if (debt <= 0) return null;

  async function handlePay() {
    setPaying(true);
    try {
      await payDebt();
    } catch (err) {
      toast('Erreur lors du paiement : ' + (err.message || 'Échec'), 'error');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="w-full bg-red-500/10 border-b border-red-500/30 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0 blink" />
        <span className="text-sm text-red-300 font-mono">
          DETTE EN COURS :{' '}
          <span className="font-bold text-red-200">{debt.toFixed(6)} ETH</span>
          <span className="text-red-400 ml-2 hidden sm:inline">
            — Veuillez régler avant de faire une nouvelle réservation
          </span>
        </span>
      </div>
      <Button
        variant="danger"
        size="sm"
        loading={paying}
        onClick={handlePay}
      >
        PAYER <ArrowRight size={12} />
      </Button>
    </div>
  );
}
