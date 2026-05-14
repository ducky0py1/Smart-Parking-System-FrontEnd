import { useContext } from 'react';
import { TrendingUp, Car, Clock, CheckCircle } from 'lucide-react';
import { ParkingContext } from '../context/ParkingContext';
import Navbar from '../components/Navbar';
import StatusTag from '../components/ui/StatusTag';
import Spinner from '../components/ui/Spinner';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ padding:24, borderRadius:16, background:'var(--surface2)', border:'1px solid var(--border)',
      display:'flex', flexDirection:'column', gap:16, transition:'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-hi)';e.currentTarget.style.boxShadow='0 4px 30px rgba(11,193,244,0.06)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ width:42, height:42, borderRadius:11, background:'var(--surface3)', border:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:40, color: color||'var(--text)', lineHeight:1 }}>{value}</span>
      </div>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.1em' }}>{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { spots, isLoading } = useContext(ParkingContext);
  const free=spots.filter(s=>s.status==='free').length;
  const reserved=spots.filter(s=>s.status==='reserved').length;
  const occupied=spots.filter(s=>s.status==='occupied').length;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Navbar />
      <main style={{ paddingTop:80, padding:'80px 24px 48px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--teal)', letterSpacing:'0.15em' }}>ADMINISTRATION</span>
          <h1 className="font-display" style={{ fontSize:32, fontWeight:800, color:'var(--text)', marginTop:6, letterSpacing:'-0.01em' }}>Tableau de bord</h1>
        </div>
        {isLoading && spots.length===0 ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'48px 0' }}>
            <Spinner size="md"/><span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--muted)' }}>Chargement…</span>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
              <StatCard icon={<TrendingUp size={18} color="var(--text)"/>} label="TOTAL PLACES" value={spots.length} />
              <StatCard icon={<CheckCircle size={18} color="#63F8B5"/>} label="LIBRES" value={free} color="#63F8B5" />
              <StatCard icon={<Clock size={18} color="#facc15"/>} label="RÉSERVÉES" value={reserved} color="#facc15" />
              <StatCard icon={<Car size={18} color="#ef4444"/>} label="OCCUPÉES" value={occupied} color="#ef4444" />
            </div>
            <div style={{ borderRadius:16, background:'var(--surface2)', border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
                <h2 style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, letterSpacing:'0.1em', color:'var(--text)' }}>GESTION DES PLACES</h2>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['PLACE','STATUT','PRIX (ETH)','CAPTEUR ID'].map(h=>(
                        <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spots.map((spot,i)=>(
                      <tr key={spot.id} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'transparent':'var(--surface)',
                        transition:'background 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--surface3)'}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':'var(--surface)'}
                      >
                        <td style={{ padding:'12px 20px', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--text)', letterSpacing:'0.08em' }}>{spot.label}</td>
                        <td style={{ padding:'12px 20px' }}><StatusTag status={spot.status}/></td>
                        <td style={{ padding:'12px 20px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--muted)' }}>{parseFloat(spot.price).toFixed(6)}</td>
                        <td style={{ padding:'12px 20px', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted2)' }}>{spot.sensor_id||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {spots.length===0 && <div style={{ padding:48, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--muted)' }}>Aucune place enregistrée</div>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
