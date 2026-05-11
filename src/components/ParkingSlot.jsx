import StatusTag from './ui/StatusTag';

export default function ParkingSlot({ spot, onClick }) {
  const isFree = spot.status === 'free';

  return (
    <div
      onClick={isFree ? () => onClick(spot.id) : undefined}
      className={`
        flex-shrink-0 w-32 rounded-xl p-3
        border transition-all duration-200
        ${isFree
          ? 'bg-[var(--surface2)] border-[var(--border)] hover:border-emerald-500/60 hover:bg-emerald-500/5 cursor-pointer glow-green'
          : 'bg-[var(--surface)]/50 border-[var(--border)]/50 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="font-mono font-bold text-xl text-white mb-1 tracking-wider">
        {spot.label}
      </div>
      <StatusTag status={spot.status} />
      <div className="mt-2 text-xs font-mono text-[var(--muted)]">
        {parseFloat(spot.price).toFixed(4)} ETH
      </div>
    </div>
  );
}
