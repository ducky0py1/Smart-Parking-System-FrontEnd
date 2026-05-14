import { useState } from 'react';
import { X, Copy, Check, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useReservation } from '../hooks/useReservation';
import { useAuth } from '../context/AuthContext';
import { toast } from './ui/Toast';

export default function ReservationModal({ spot, onClose }) {
  const { user } = useAuth();
  const { reserve } = useReservation();
  const [step, setStep] = useState('review');
  const [endTime, setEndTime] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);
  const debt = parseFloat(user?.debt)||0;
  const price = parseFloat(spot?.price)||0;
  const total = price+debt;
  const minDT = new Date(Date.now()+15*60*1000).toISOString().slice(0,16);

  async function handleConfirm() {
    if(!endTime){toast('Veuillez sélectionner une heure de fin.','error');return;}
    setError(null); setStep('paying');
    try { const h=await reserve(spot,endTime); setTxHash(h); setStep('confirmed'); }
    catch(err) { setError(err.message||'Transaction annulée.'); setStep('review'); toast('Transaction échouée: '+(err.message||'Erreur'),'error'); }
  }
  function copyHash() { navigator.clipboard.writeText(txHash); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}
      className="sm:items-center">
      <div onClick={step==='paying'?undefined:onClose}
        style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)' }}/>
      <div style={{ position:'relative', width:'100%', maxWidth:440,
        background:'var(--surface2)', border:'1px solid var(--border-md)',
        borderRadius:20, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.4)',
        animation:'fadeUp 0.35s ease-out both' }}>
        {/* Top accent */}
        <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:2,
          background:'linear-gradient(90deg,transparent,var(--cyan),transparent)', borderRadius:'0 0 4px 4px' }}/>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'20px 24px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:20,
              background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'0.05em' }}>
              {spot?.label}
            </span>
            <span style={{ color:'var(--muted)', fontSize:13 }}>/ Réservation</span>
          </div>
          {step!=='paying' && (
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:4, borderRadius:6, transition:'color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
              <X size={17}/>
            </button>
          )}
        </div>

        {/* REVIEW */}
        {step==='review'&&(
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
            {error&&(
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:12, borderRadius:10,
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle size={14} style={{ color:'#ef4444', marginTop:1, flexShrink:0 }}/>
                <p style={{ fontSize:12, color:'#ef4444' }}>{error}</p>
              </div>
            )}
            {/* Price table */}
            <div style={{ borderRadius:12, background:'var(--surface3)', border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.08em' }}>PRIX PLACE</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text)' }}>{price.toFixed(6)} ETH</span>
              </div>
              {debt>0&&(
                <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#ef4444', display:'flex', alignItems:'center', gap:4 }}>
                    <AlertCircle size={10}/> DETTE
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'#ef4444' }}>{debt.toFixed(6)} ETH</span>
                </div>
              )}
              <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center',
                background:'rgba(99,248,181,0.04)' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#63F8B5', fontWeight:700, letterSpacing:'0.08em' }}>TOTAL</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:16, color:'#63F8B5', fontWeight:700 }}>{total.toFixed(6)} ETH</span>
              </div>
            </div>
            {/* End time */}
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:8 }}>
                HEURE DE FIN PRÉVUE
              </label>
              <div style={{ position:'relative', borderRadius:10,
                background:'var(--input-bg)', border:`1px solid ${focused?'var(--input-focus)':'var(--input-border)'}`,
                boxShadow:focused?'0 0 16px rgba(11,193,244,0.1)':'none', transition:'all 0.2s', display:'flex', alignItems:'center' }}>
                <Clock size={14} style={{ position:'absolute', left:12, color:focused?'var(--cyan)':'var(--muted)', transition:'color 0.2s', pointerEvents:'none' }}/>
                <input type="datetime-local" min={minDT} value={endTime} onChange={e=>setEndTime(e.target.value)}
                  onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                  style={{ width:'100%', paddingLeft:38, paddingRight:14, paddingTop:12, paddingBottom:12,
                    background:'transparent', border:'none', outline:'none',
                    fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)', borderRadius:10 }}/>
              </div>
            </div>
            <button onClick={handleConfirm} className="btn-primary"
              style={{ width:'100%', padding:'15px', borderRadius:12, border:'none', fontSize:13, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              ⚡ CONFIRMER ET PAYER
            </button>
          </div>
        )}

        {/* PAYING */}
        {step==='paying'&&(
          <div style={{ padding:'56px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center' }}>
            <div style={{ width:80, height:80, borderRadius:'50%',
              background:'rgba(11,193,244,0.08)', border:'1px solid rgba(11,193,244,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Loader2 size={30} style={{ color:'var(--cyan)', animation:'spin 1s linear infinite' }}/>
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--text)', fontSize:14, marginBottom:6 }}>EN ATTENTE METAMASK…</p>
              <p style={{ fontSize:12, color:'var(--muted)' }}>Confirmez la transaction dans votre portefeuille</p>
            </div>
            <div style={{ padding:'12px 20px', borderRadius:10, background:'var(--surface3)', border:'1px solid var(--border)' }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)' }}>
                Montant : <span style={{ color:'#63F8B5' }}>{total.toFixed(6)} ETH</span>
              </p>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* CONFIRMED */}
        {step==='confirmed'&&(
          <div style={{ padding:28, display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%',
              background:'rgba(99,248,181,0.12)', border:'1px solid rgba(99,248,181,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={28} style={{ color:'#63F8B5' }}/>
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--text)', marginBottom:6 }}>PLACE RÉSERVÉE !</p>
              <p style={{ fontSize:13, color:'var(--muted)' }}>La place <span style={{ color:'#63F8B5' }}>{spot?.label}</span> vous appartient</p>
            </div>
            <div style={{ width:'100%', textAlign:'left' }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', marginBottom:8, letterSpacing:'0.08em' }}>HASH DE TRANSACTION</p>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:12, borderRadius:10,
                background:'var(--surface3)', border:'1px solid var(--border)' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{txHash}</span>
                <button onClick={copyHash} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', flexShrink:0, transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--cyan)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
                  {copied?<Check size={13} style={{ color:'#63F8B5' }}/>:<Copy size={13}/>}
                </button>
              </div>
            </div>
            <button onClick={onClose} className="btn-primary"
              style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', fontSize:12, cursor:'pointer' }}>
              RETOUR AU TABLEAU DE BORD
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
