import { useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useDebt } from '../hooks/useDebt';
import { toast } from './ui/Toast';
export default function DebtBanner() {
  const { debt, payDebt } = useDebt();
  const [paying, setPaying] = useState(false);
  if (debt <= 0) return null;
  async function handlePay() {
    setPaying(true);
    try { await payDebt(); } catch(err) { toast('Erreur: '+(err.message||'Échec'),'error'); }
    finally { setPaying(false); }
  }
  return (
    <div style={{ background:'rgba(244,100,11,0.08)', borderBottom:'1px solid rgba(244,100,11,0.25)',
      padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <AlertTriangle size={15} style={{ color:'#F4640B', flexShrink:0, animation:'blink 1.8s ease-in-out infinite' }}/>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'rgba(244,100,11,0.9)', letterSpacing:'0.06em' }}>
          DETTE EN COURS : <strong style={{ color:'#F4640B' }}>{debt.toFixed(6)} ETH</strong>
          <span style={{ color:'rgba(244,100,11,0.6)', marginLeft:8 }}>— Réglez avant toute réservation</span>
        </span>
      </div>
      <button onClick={handlePay} disabled={paying} className="btn-metamask"
        style={{ padding:'7px 16px', borderRadius:8, fontSize:11, cursor:paying?'not-allowed':'pointer',
          display:'flex', alignItems:'center', gap:6, opacity:paying?0.7:1, flexShrink:0 }}>
        {paying?<span className="blink">●</span>:<><span>PAYER</span><ArrowRight size={11}/></>}
      </button>
    </div>
  );
}
