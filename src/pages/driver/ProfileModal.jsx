import { useState } from 'react';
import DashboardIcon from './DashboardIcon';

export default function ProfileModal({ onComplete }) {
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '' });
  const [touched, setTouched] = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  const errors = {
    firstName: form.firstName.trim().length < 2 ? 'Au moins 2 caractères.' : '',
    lastName:  form.lastName.trim().length  < 2 ? 'Au moins 2 caractères.' : '',
    email:     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Adresse e-mail invalide.' : '',
  };
  const valid = !errors.firstName && !errors.lastName && !errors.email;

  function set(k, v)  { setForm((f) => ({ ...f, [k]: v })); }
  function blur(k)    { setTouched((t) => ({ ...t, [k]: true })); }

  async function submit(e) {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true });
    if (!valid || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await onComplete({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
      });
    } catch (err) {
      const msg = err?.response?.data?.message
        || (err?.response?.data?.errors && Object.values(err.response.data.errors).flat().join(', '))
        || err?.message
        || 'Erreur lors de l\'enregistrement. Réessayez.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-pad">
          <span className="modal-eyebrow">
            <DashboardIcon name="user" size={14} /> Bienvenue sur ParkChain
          </span>
          <h3>Complétez votre profil</h3>
          <p className="modal-sub">
            Votre portefeuille est connecté. Avant de réserver une place, dites-nous qui vous êtes —
            ces informations restent privées et ne sont jamais publiées on-chain.
          </p>

          <form onSubmit={submit} noValidate>
            <div className="field-row">
              <div className="field">
                <label>Prénom <span className="req">*</span></label>
                <input
                  className={touched.firstName && errors.firstName ? 'invalid' : ''}
                  value={form.firstName}
                  placeholder="Camille"
                  onChange={(e) => set('firstName', e.target.value)}
                  onBlur={() => blur('firstName')}
                />
                <div className="err">{touched.firstName ? errors.firstName : ''}</div>
              </div>
              <div className="field">
                <label>Nom <span className="req">*</span></label>
                <input
                  className={touched.lastName && errors.lastName ? 'invalid' : ''}
                  value={form.lastName}
                  placeholder="Durand"
                  onChange={(e) => set('lastName', e.target.value)}
                  onBlur={() => blur('lastName')}
                />
                <div className="err">{touched.lastName ? errors.lastName : ''}</div>
              </div>
            </div>

            <div className="field">
              <label>Adresse e-mail <span className="req">*</span></label>
              <input
                type="email"
                className={touched.email && errors.email ? 'invalid' : ''}
                value={form.email}
                placeholder="camille.durand@email.com"
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => blur('email')}
              />
              <div className="err">{touched.email ? errors.email : ''}</div>
            </div>

            {saveError && (
              <p style={{ color: 'var(--neon-pink)', fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                {saveError}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-wallet btn-lg"
                disabled={!valid || saving}
                style={{ opacity: valid && !saving ? 1 : 0.55 }}
              >
                {saving ? (
                  <><DashboardIcon name="spinner" size={18} className="ts-spin" stroke={2.2} /> Enregistrement…</>
                ) : (
                  <><DashboardIcon name="check" size={18} stroke={2.4} /> Continuer vers le tableau de bord</>
                )}
              </button>
            </div>

            <p className="modal-note">
              Ce formulaire ne peut pas être fermé tant que votre profil n&apos;est pas complet —
              c&apos;est une exigence de sécurité du réseau.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
