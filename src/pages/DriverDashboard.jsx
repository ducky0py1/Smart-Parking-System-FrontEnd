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

  // Called by ParkingScene when user clicks a spot in the 3D model
  function handleSpotClick(label) {
    const spot = spots.find(s => s.label === label);
    if (!spot) return;
    if (spot.status !== 'free') {
      toast(`La place ${label} n'est pas disponible.`, 'error');
      return;
    }
    selectSpot(spot.id);
  }

  const freeCount     = spots.filter(s => s.status === 'free').length;
  const reservedCount = spots.filter(s => s.status === 'reserved').length;
  const occupiedCount = spots.filter(s => s.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Navbar />
      <DebtBanner />

      <main className="flex-1 flex flex-col pt-16">
        {/* Stats bar */}
        <div className="flex items-center gap-6 px-6 py-3 bg-[var(--surface)]/80 border-b border-[var(--border)] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 blink" />
            <span className="font-mono text-xs text-emerald-400">{freeCount} LIBRE{freeCount !== 1 ? 'S' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="font-mono text-xs text-yellow-400">{reservedCount} RÉSERVÉE{reservedCount !== 1 ? 'S' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="font-mono text-xs text-red-400">{occupiedCount} OCCUPÉE{occupiedCount !== 1 ? 'S' : ''}</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={refreshSpots}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-emerald-400 transition-colors"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              ACTUALISER
            </button>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="w-full bg-[var(--bg)] border-b border-[var(--border)]">
          <ParkingScene spots={spots} onSpotClick={handleSpotClick} />
        </div>

        {/* 2D slot grid / horizontal scroll */}
        <div className="px-6 py-4">
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-3">
            TOUTES LES PLACES — Cliquez pour réserver
          </p>
          {isLoading && spots.length === 0 ? (
            <div className="flex items-center gap-3 py-6">
              <Spinner size="sm" />
              <span className="font-mono text-xs text-[var(--muted)]">Chargement des places…</span>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-3">
              {spots.map(s => (
                <ParkingSlot
                  key={s.id}
                  spot={s}
                  onClick={(id) => {
                    const spot = spots.find(sp => sp.id === id);
                    if (spot?.status !== 'free') return;
                    selectSpot(id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reservation modal */}
      {selectedSpot && (
        <ReservationModal
          spot={selectedSpot}
          onClose={() => selectSpot(null)}
        />
      )}
    </div>
  );
}
