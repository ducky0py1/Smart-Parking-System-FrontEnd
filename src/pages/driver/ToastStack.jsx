import DashboardIcon from './DashboardIcon';

export default function ToastStack({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast show ${t.kind || 'pending'}`}>
          <div className="ts-ico">
            {t.kind === 'success' ? (
              <DashboardIcon name="check" size={18} stroke={2.4} />
            ) : t.kind === 'error' ? (
              <DashboardIcon name="alert" size={18} />
            ) : (
              <DashboardIcon name="spinner" size={18} className="ts-spin" stroke={2.2} />
            )}
          </div>
          <div>
            <div>{t.title}</div>
            {t.sub && <small>{t.sub}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}
