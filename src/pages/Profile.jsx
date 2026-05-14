import { useState, useEffect, useContext } from 'react';
import { User, ExternalLink, Mail } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusTag from '../components/ui/StatusTag';
import Spinner from '../components/ui/Spinner';
import { useWallet } from '../hooks/useWallet';
import api from '../services/api';

function Field({ icon, label, type='text', value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:8 }}>{label}</label>
      <div style={{ position:'relative', display:'flex', alignItems:'center', borderRadius:10,
        background:'var(--input-bg)', border:`1px solid ${focused?'var(--input-focus)':'var(--input-border)'}`,
        boxShadow: focused?'0 0 16px rgba(11,193,244,0.1)':'none', transition:'all 0.2s' }}>
        <span style={{ position:'absolute', left:12, color:focused?'var(--cyan)':'var(--muted)', transition:'color 0.2s' }}>{icon}</span>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ width:'100%', paddingLeft:40, paddingRight:14, paddingTop:12, paddingBottom:12,
            background:'transparent', border:'none', outline:'none',
            fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', borderRadius:10 }} />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const { shortAddress } = useWallet();
  const [form, setForm] = useState({ first_name:user?.first_name||'', last_name:user?.last_name||'', email:user?.email||'' });
  const [saving, setSaving] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);

  useEffect(() => {
    api.get('/reservations')
      .then(({ data }) => setReservations(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => setReservations([]))
      .finally(() => setLoadingRes(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try { await updateProfile(form); } catch {} finally { setSaving(false); }
  }

  function shortTx(hash) { if(!hash) return '—'; return `${hash.slice(0,8)}…${hash.slice(-6)}`; }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Navbar />
      <main style={{ paddingTop:80, padding:'80px 24px 48px', maxWidth:740, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--teal)', letterSpacing:'0.15em' }}>COMPTE</span>
          <h1 className="font-display" style={{ fontSize:32, fontWeight:800, color:'var(--text)', marginTop:6, letterSpacing:'-0.01em' }}>Mon Profil</h1>
        </div>

        {/* Profile card */}
        <div style={{ borderRadius:16, background:'var(--surface2)', border:'1px solid var(--border)', padding:28, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,rgba(99,248,181,0.15),rgba(11,193,244,0.1))',
              border:'1px solid rgba(11,193,244,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <User size={24} color="var(--teal)" />
            </div>
            <div>
              <p className="font-display" style={{ fontWeight:700, fontSize:18, color:'var(--text)' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Profil incomplet'}
              </p>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)', marginTop:3 }}>{shortAddress}</p>
            </div>
          </div>
          <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Field icon={<User size={14}/>} label="PRÉNOM" value={form.first_name} onChange={v=>setForm(p=>({...p,first_name:v}))} />
              <Field icon={<User size={14}/>} label="NOM"    value={form.last_name}  onChange={v=>setForm(p=>({...p,last_name:v}))} />
            </div>
            <Field icon={<Mail size={14}/>} label="EMAIL" type="email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} />
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button type="submit" disabled={saving} className="btn-primary"
                style={{ padding:'12px 28px', borderRadius:10, border:'none', fontSize:12, cursor:saving?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', gap:8, opacity:saving?0.7:1 }}>
                {saving ? <><span className="blink">●</span>ENREGISTREMENT…</> : 'ENREGISTRER LES MODIFICATIONS'}
              </button>
            </div>
          </form>
        </div>

        {/* Reservation history */}
        <div style={{ borderRadius:16, background:'var(--surface2)', border:'1px solid var(--border)', overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
            <h2 style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, letterSpacing:'0.1em', color:'var(--text)' }}>HISTORIQUE DES RÉSERVATIONS</h2>
          </div>
          {loadingRes ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:32 }}>
              <Spinner size="sm"/><span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)' }}>Chargement…</span>
            </div>
          ) : reservations.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--muted)' }}>Aucune réservation pour l'instant</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['PLACE','DÉBUT','FIN','TRANSACTION','STATUT'].map(h=>(
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r=>(
                    <tr key={r.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--surface3)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'10px 16px', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--text)' }}>{r.spot?.label||r.spot_id}</td>
                      <td style={{ padding:'10px 16px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', whiteSpace:'nowrap' }}>{r.start_time?new Date(r.start_time).toLocaleString('fr-FR'):'—'}</td>
                      <td style={{ padding:'10px 16px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', whiteSpace:'nowrap' }}>{r.end_time?new Date(r.end_time).toLocaleString('fr-FR'):'—'}</td>
                      <td style={{ padding:'10px 16px' }}>
                        {r.transaction_hash ? (
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:4 }}>
                            {shortTx(r.transaction_hash)}<ExternalLink size={10} style={{ opacity:0.5 }}/>
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding:'10px 16px' }}><StatusTag status={r.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
