import { useState, useEffect, useContext } from 'react';
import { User, ExternalLink } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import StatusTag from '../components/ui/StatusTag';
import Spinner from '../components/ui/Spinner';
import { useWallet } from '../hooks/useWallet';
import api from '../services/api';

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const { shortAddress } = useWallet();
  const [form, setForm]       = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '' });
  const [saving, setSaving]   = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes]     = useState(true);

  useEffect(() => {
    api.get('/reservations')
      .then(({ data }) => setReservations(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => setReservations([]))
      .finally(() => setLoadingRes(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try { await updateProfile(form); } catch { /* toast shown */ }
    finally { setSaving(false); }
  }

  function shortTx(hash) {
    if (!hash) return '—';
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main className="pt-20 px-6 pb-12 max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="font-mono text-xs text-emerald-400 tracking-widest">COMPTE</span>
          <h1 className="font-display font-bold text-3xl text-white mt-1">Mon Profil</h1>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl bg-[var(--surface2)] border border-[var(--border)] p-6 mb-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <User size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-display font-semibold text-white">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Profil incomplet'}
              </p>
              <p className="font-mono text-xs text-[var(--muted)] mt-0.5">{shortAddress}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'first_name', label: 'PRÉNOM' },
                { key: 'last_name',  label: 'NOM'    },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block font-mono text-xs text-[var(--muted)] tracking-wider mb-1.5">{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface3)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-emerald-500/60 transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted)] tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface3)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>
                ENREGISTRER LES MODIFICATIONS
              </Button>
            </div>
          </form>
        </div>

        {/* Reservation history */}
        <div className="rounded-2xl bg-[var(--surface2)] border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-mono font-bold text-sm tracking-wider">HISTORIQUE DES RÉSERVATIONS</h2>
          </div>

          {loadingRes ? (
            <div className="flex items-center gap-3 p-8">
              <Spinner size="sm" />
              <span className="font-mono text-xs text-[var(--muted)]">Chargement…</span>
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center font-mono text-sm text-[var(--muted)]">
              Aucune réservation pour l'instant
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['PLACE', 'DÉBUT', 'FIN', 'TRANSACTION', 'STATUT'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-mono text-xs text-[var(--muted)] tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface3)]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white">{r.spot?.label || r.spot_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)] whitespace-nowrap">
                        {r.start_time ? new Date(r.start_time).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)] whitespace-nowrap">
                        {r.end_time ? new Date(r.end_time).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.transaction_hash ? (
                          <span className="font-mono text-xs text-[var(--muted)] flex items-center gap-1">
                            {shortTx(r.transaction_hash)}
                            <ExternalLink size={10} className="opacity-50" />
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusTag status={r.status} />
                      </td>
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
