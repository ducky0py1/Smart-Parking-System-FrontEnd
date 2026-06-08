// ParkChain Dashboard — shared helpers
// Pricing model (source from backend/contract when available)
export const TARIF = {
  day:   { rate: 0.0009, label: 'Jour',  window: '06h – 20h', from: 6,  to: 20 },
  night: { rate: 0.0006, label: 'Nuit',  window: '20h – 06h', from: 20, to: 6  },
};

export const ETH_MAD = 28000; // 1 ETH ≈ 28 000 MAD
export const GANACHE_EXPLORER = import.meta.env.VITE_EXPLORER_URL || 'http://localhost:8545/tx/';
export const NETWORK_NAME     = import.meta.env.VITE_NETWORK_NAME || 'Ganache · 1337';

export function currentPeriod() {
  const h = new Date().getHours();
  return h >= TARIF.day.from && h < TARIF.day.to ? 'day' : 'night';
}

export function computePrice(durationMin, period) {
  const rate = (TARIF[period] || TARIF.day).rate;
  return +(rate * (durationMin / 60)).toFixed(4);
}

export function durLabel(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h && m) return `${h} h ${m}`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export function fmtEth(e) {
  return Number(e).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
}

export function ethToMad(e) {
  return (e * ETH_MAD).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

export function shortAddr(a) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export function shortHash(h) {
  return h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '';
}

export function normaliseUser(user) {
  if (!user) return null;
  return {
    address:   user.wallet_address || user.address || '',
    firstName: user.first_name     || user.firstName || null,
    lastName:  user.last_name      || user.lastName  || null,
    email:     user.email          || null,
    debt:      parseFloat(user.debt)    || 0,
    balance:   parseFloat(user.balance) || 0,
    role:      user.role           || 'driver',
    network:   NETWORK_NAME,
  };
}

export function normaliseSpot(s) {
  return {
    id:     s.id,
    label:  s.label || s.spot_label || `S${s.id}`,
    status: s.status || 'free',
    level:  s.level || s.floor || 'Niveau 1',
  };
}

export function normaliseReservation(r) {
  // Backend returns reservations with('spot') eager-load — label is at r.spot.label
  const label = r.spot?.label || r.spot_label || r.label || '?';
  // Format created_at ISO string to a readable local date
  const rawDate = r.created_at || r.date || '';
  const date = rawDate
    ? new Date(rawDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Inconnu';
  return {
    id:          String(r.id),
    label,
    date,
    durationMin: parseInt(r.duration_min) || 60,
    amountEth:   parseFloat(r.amount) || parseFloat(r.spot?.price) || 0,
    status:      r.status === 'active' ? 'active' : 'completed',
    txHash:      r.transaction_hash || r.txHash || '',
  };
}
