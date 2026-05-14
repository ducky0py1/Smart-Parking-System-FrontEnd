import StatusTag from './ui/StatusTag';
export default function ParkingSlot({ spot, onClick }) {
  const isFree = spot.status === 'free';
  return (
    <div onClick={isFree ? ()=>onClick(spot.id) : undefined}
      style={{ flexShrink:0, width:128, borderRadius:12, padding:14,
        background: isFree ? 'var(--surface2)' : 'var(--surface)',
        border:`1px solid ${isFree?'var(--border-md)':'var(--border)'}`,
        opacity: isFree ? 1 : 0.55,
        cursor: isFree ? 'pointer' : 'not-allowed',
        transition:'all 0.2s',
      }}
      onMouseEnter={e=>{ if(isFree){ e.currentTarget.style.borderColor='rgba(11,193,244,0.5)'; e.currentTarget.style.boxShadow='0 0 20px rgba(11,193,244,0.1)'; }}}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=isFree?'var(--border-md)':'var(--border)'; e.currentTarget.style.boxShadow='none'; }}
    >
      <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:22, color:'var(--text)', marginBottom:8, letterSpacing:'0.05em' }}>{spot.label}</div>
      <StatusTag status={spot.status}/>
      <div style={{ marginTop:10, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>
        {parseFloat(spot.price).toFixed(4)} ETH
      </div>
    </div>
  );
}
