import Badge from './Badge';
const MAP = { free:{color:'green',label:'LIBRE',dot:'●'}, reserved:{color:'amber',label:'RÉSERVÉ',dot:'◐'}, occupied:{color:'red',label:'OCCUPÉ',dot:'●'} };
export default function StatusTag({ status }) {
  const c = MAP[status] || MAP.free;
  return <Badge color={c.color}><span style={{ animation:'blink 1.8s ease-in-out infinite' }}>{c.dot}</span>{c.label}</Badge>;
}
