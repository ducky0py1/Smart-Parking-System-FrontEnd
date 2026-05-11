import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, UserCircle, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

export default function Login() {
  const { connectWallet, updateProfile, token, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('connect'); // connect | profile
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  // If already connected, decide where to go
  useEffect(() => {
    if (!token) return;
    if (user?.first_name) navigate('/dashboard', { replace: true });
    else setStep('profile');
  }, [token, user, navigate]);

  async function handleConnect() {
    await connectWallet();
    // navigation handled by useEffect above
  }

  async function handleProfile(e) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast('Le prénom et le nom sont requis.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile(form);
      navigate('/dashboard', { replace: true });
    } catch {
      /* toast shown by context */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] hex-bg flex items-center justify-center p-6">
      {/* Background rings */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[var(--border)] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[var(--border)] opacity-20" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-mono font-bold text-lg tracking-widest">
            PARK<span className="text-emerald-400">CHAIN</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl">
          {/* Step indicator */}
          <div className="flex border-b border-[var(--border)]">
            {['CONNEXION', 'PROFIL'].map((label, i) => (
              <div
                key={label}
                className={`flex-1 py-3 text-center font-mono text-xs tracking-widest transition-colors ${
                  (i === 0 && step === 'connect') || (i === 1 && step === 'profile')
                    ? 'text-emerald-400 bg-emerald-500/5 border-b-2 border-emerald-500'
                    : 'text-[var(--muted2)]'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="p-8">
            {/* ─── STEP: CONNECT ─── */}
            {step === 'connect' && (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[var(--surface3)] border border-[var(--border)] flex items-center justify-center">
                  <Wallet size={32} className="text-emerald-400" />
                </div>

                <div>
                  <h1 className="font-display font-bold text-2xl text-white mb-2">
                    Connectez votre portefeuille
                  </h1>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    Utilisez MetaMask pour vous authentifier de manière sécurisée via votre adresse Ethereum.
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <Button fullWidth size="lg" loading={loading} onClick={handleConnect}>
                    <Wallet size={16} />
                    CONNECTER AVEC METAMASK
                  </Button>

                  <p className="text-xs text-[var(--muted)] text-center">
                    Aucune donnée personnelle n'est requise pour la connexion
                  </p>
                </div>
              </div>
            )}

            {/* ─── STEP: PROFILE ─── */}
            {step === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface3)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                    <UserCircle size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-xl text-white">Complétez votre profil</h1>
                    <p className="text-xs text-[var(--muted)]">Requis pour la première connexion</p>
                  </div>
                </div>

                <form onSubmit={handleProfile} className="space-y-4">
                  {[
                    { key: 'first_name', label: 'PRÉNOM', placeholder: 'Jean' },
                    { key: 'last_name',  label: 'NOM',    placeholder: 'Dupont' },
                    { key: 'email',      label: 'EMAIL',  placeholder: 'jean@exemple.com', type: 'email' },
                  ].map(({ key, label, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="block font-mono text-xs text-[var(--muted)] tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface3)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted2)] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  ))}

                  <Button fullWidth size="lg" loading={submitting} type="submit">
                    ENREGISTRER <ArrowRight size={14} />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
