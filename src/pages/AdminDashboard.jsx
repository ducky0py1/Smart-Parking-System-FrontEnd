import { useContext } from 'react';
import { TrendingUp, Car, Clock, CheckCircle } from 'lucide-react';
import { ParkingContext } from '../context/ParkingContext';
import Navbar from '../components/Navbar';
import StatusTag from '../components/ui/StatusTag';
import Spinner from '../components/ui/Spinner';

function StatCard({ icon, label, value, color = 'text-white' }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface2)] border border-[var(--border)]">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-[var(--surface3)] border border-[var(--border)]">
          {icon}
        </div>
        <span className={`font-mono font-bold text-4xl ${color}`}>{value}</span>
      </div>
      <p className="font-mono text-xs text-[var(--muted)] tracking-widest">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { spots, isLoading } = useContext(ParkingContext);

  const free     = spots.filter(s => s.status === 'free').length;
  const reserved = spots.filter(s => s.status === 'reserved').length;
  const occupied = spots.filter(s => s.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main className="pt-20 px-6 pb-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="font-mono text-xs text-emerald-400 tracking-widest">ADMINISTRATION</span>
          <h1 className="font-display font-bold text-3xl text-white mt-1">Tableau de bord</h1>
        </div>

        {isLoading && spots.length === 0 ? (
          <div className="flex items-center gap-3 py-12">
            <Spinner size="md" />
            <span className="font-mono text-sm text-[var(--muted)]">Chargement…</span>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<TrendingUp size={18} className="text-white" />}
                label="TOTAL PLACES"
                value={spots.length}
              />
              <StatCard
                icon={<CheckCircle size={18} className="text-emerald-400" />}
                label="LIBRES"
                value={free}
                color="text-emerald-400"
              />
              <StatCard
                icon={<Clock size={18} className="text-yellow-400" />}
                label="RÉSERVÉES"
                value={reserved}
                color="text-yellow-400"
              />
              <StatCard
                icon={<Car size={18} className="text-red-400" />}
                label="OCCUPÉES"
                value={occupied}
                color="text-red-400"
              />
            </div>

            {/* Spots table */}
            <div className="rounded-2xl bg-[var(--surface2)] border border-[var(--border)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-mono font-bold text-sm tracking-wider text-[var(--text)]">
                  GESTION DES PLACES
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['PLACE', 'STATUT', 'PRIX (ETH)', 'CAPTEUR ID'].map(h => (
                        <th key={h} className="px-6 py-3 text-left font-mono text-xs text-[var(--muted)] tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spots.map((spot, i) => (
                      <tr
                        key={spot.id}
                        className={`border-b border-[var(--border)]/50 hover:bg-[var(--surface3)]/50 transition-colors ${i % 2 === 0 ? '' : 'bg-[var(--surface)]/30'}`}
                      >
                        <td className="px-6 py-3 font-mono font-bold text-white tracking-wider">
                          {spot.label}
                        </td>
                        <td className="px-6 py-3">
                          <StatusTag status={spot.status} />
                        </td>
                        <td className="px-6 py-3 font-mono text-sm text-[var(--muted)]">
                          {parseFloat(spot.price).toFixed(6)}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-[var(--muted2)]">
                          {spot.sensor_id || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {spots.length === 0 && (
                <div className="py-12 text-center font-mono text-sm text-[var(--muted)]">
                  Aucune place enregistrée
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
