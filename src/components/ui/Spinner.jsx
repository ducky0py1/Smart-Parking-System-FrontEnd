const sz = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-14 h-14' };
const bw = { sm:'border-2', md:'border-2', lg:'border-[3px]' };
export default function Spinner({ size='md', className='' }) {
  return <div style={{
    width: size==='sm'?16:size==='md'?32:56,
    height: size==='sm'?16:size==='md'?32:56,
    borderRadius:'50%',
    border: `${size==='lg'?3:2}px solid rgba(11,193,244,0.2)`,
    borderTopColor:'var(--cyan)',
    animation:'spin 0.8s linear infinite',
    flexShrink:0,
  }} className={className}>
    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
  </div>;
}
