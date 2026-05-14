import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

let listeners = [];
function subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter(l=>l!==fn); }; }
function emit(t) { listeners.forEach(fn=>fn(t)); }
export function toast(message, type='info') { emit({ id:Date.now()+Math.random(), message, type }); }

const icons = {
  success: <CheckCircle size={15} style={{ color:'#63F8B5', flexShrink:0 }}/>,
  error:   <AlertCircle size={15} style={{ color:'#ef4444', flexShrink:0 }}/>,
  info:    <Info size={15} style={{ color:'#0BC1F4', flexShrink:0 }}/>,
};
const borders = { success:'rgba(99,248,181,0.35)', error:'rgba(239,68,68,0.35)', info:'rgba(11,193,244,0.35)' };

function ToastItem({ id, message, type, onRemove }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(()=>{ setExiting(true); setTimeout(()=>onRemove(id),300); }, 3500);
    return ()=>clearTimeout(t);
  }, [id, onRemove]);
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px',
      background:'var(--surface2)', border:`1px solid ${borders[type]||borders.info}`,
      borderRadius:10, boxShadow:'0 8px 30px rgba(0,0,0,0.2)', maxWidth:340, width:'100%',
      animation: exiting ? 'toastOut 0.25s ease-in forwards' : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      {icons[type]}
      <p style={{ fontSize:13, color:'var(--text)', flex:1, lineHeight:1.5 }}>{message}</p>
      <button onClick={()=>{setExiting(true);setTimeout(()=>onRemove(id),300);}}
        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:0, flexShrink:0 }}>
        <X size={13}/>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { const u=subscribe(t=>setToasts(p=>[...p,t])); return u; }, []);
  const remove = useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)), []);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t=><ToastItem key={t.id} {...t} onRemove={remove}/>)}
    </div>
  );
}
