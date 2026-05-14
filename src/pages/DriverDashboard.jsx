import { useContext } from 'react';
import { RefreshCw } from 'lucide-react';
import { ParkingContext } from '../context/ParkingContext';
import Navbar from '../components/Navbar';
import DebtBanner from '../components/DebtBanner';
import ParkingScene from '../components/three/ParkingScene';
import ParkingSlot from '../components/ParkingSlot';
import ReservationModal from '../components/ReservationModal';
import Spinner from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';

export default function DriverDashboard() {
  const { spots, selectedSpot, isLoading, selectSpot, refreshSpots } = useContext(ParkingContext);

  function handleSpotClick(label) {
    const spot = spots.find(s => s.label === label);
    if (!spot) return;
    if (spot.status !== 'free') { toast(`La place ${label} n'est pas disponible.`, 'error'); return; }
    selectSpot(spot.id);
  }

  const free     = spots.filter(s => s.status === 'free').length;
  const reserved = spots.filter(s => s.status === 'reserved').length;
  const occupied = spots.filter(s => s.status === 'occupied').length;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <DebtBanner />
      <main style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:64 }}>
        {/* Stats bar */}
        <div style={{ display:'flex', alignItems:'center', gap:24, padding:'10px 24px',
          background:'var(--surface)', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
          {[
            { dot:'#63F8B5', label:`${free} LIBRE${free!==1?'S':''}`, color:'#63F8B5', blink:true },
            { dot:'#facc15', label:`${reserved} RÉSERVÉE${reserved!==1?'S':''}`, color:'#facc15' },
            { dot:'#ef4444', label:`${occupied} OCCUPÉE${occupied!==1?'S':''}`, color:'#ef4444' },
          ].map(({ dot, label, color, blink }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:dot, animation: blink ? 'blink 1.8s ease-in-out infinite' : 'none' }} />
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color, letterSpacing:'0.08em' }}>{label}</span>
            </div>
          ))}
          <button onClick={refreshSpots} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
            fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', background:'none', border:'none', cursor:'pointer',
            letterSpacing:'0.08em', transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
          >
            <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            ACTUALISER
          </button>
        </div>

        {/* 3D scene */}
        <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
          <ParkingScene spots={spots} onSpotClick={handleSpotClick} />
        </div>

        {/* 2D slot strip */}
        <div style={{ padding:'20px 24px' }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.12em', marginBottom:14 }}>
            TOUTES LES PLACES — Cliquez pour réserver
          </p>
          {isLoading && spots.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'24px 0' }}>
              <Spinner size="sm" />
              <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)' }}>Chargement des places…</span>
            </div>
          ) : (
            <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:12 }}>
              {spots.map(s => (
                <ParkingSlot key={s.id} spot={s}
                  onClick={id => { const sp=spots.find(x=>x.id===id); if(sp?.status==='free') selectSpot(id); }} />
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedSpot && <ReservationModal spot={selectedSpot} onClose={() => selectSpot(null)} />}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
