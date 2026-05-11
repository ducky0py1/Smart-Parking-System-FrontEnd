import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Module-level listeners so toast() can be called from anywhere
let listeners = [];

function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function emit(toast) {
  listeners.forEach(fn => fn(toast));
}

// Public API — import and call from services/hooks/pages
export function toast(message, type = 'info') {
  emit({ id: Date.now() + Math.random(), message, type });
}

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />,
  error:   <AlertCircle size={16} className="text-red-400 flex-shrink-0" />,
  info:    <Info size={16} className="text-blue-400 flex-shrink-0" />,
};

const borders = {
  success: 'border-emerald-500/40',
  error:   'border-red-500/40',
  info:    'border-blue-500/40',
};

function ToastItem({ id, message, type, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`
      flex items-start gap-3 px-4 py-3
      bg-[var(--surface2)] border ${borders[type]}
      rounded-lg shadow-xl max-w-sm w-full
      ${exiting ? 'toast-exit' : 'toast-enter'}
    `}>
      {icons[type]}
      <p className="text-sm text-[var(--text)] flex-1 leading-relaxed">{message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(id), 300); }}
        className="text-[var(--muted)] hover:text-[var(--text)] transition-colors ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribe(t => setToasts(prev => [...prev, t]));
    return unsub;
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={remove} />
      ))}
    </div>
  );
}
