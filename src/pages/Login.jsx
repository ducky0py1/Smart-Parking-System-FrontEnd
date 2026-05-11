import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Mail, ChevronRight, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';

/* ── MetaMask fox icon ── */
function FoxIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 35 33" fill="none">
      <path d="M32.958 1L19.4 10.93l2.52-5.928L32.958 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.03 1l13.448 10.02-2.396-6.017L2.03 1zM28.13 23.533l-3.61 5.53 7.73 2.128 2.22-7.537-6.34-.121zM.555 23.654l2.206 7.537 7.716-2.128-3.596-5.53-6.326.121z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.076 14.454l-2.16 3.267 7.686.342-.27-8.268-5.256 4.66zM24.907 14.454l-5.324-4.75-.175 8.36 7.672-.342-2.173-3.268zM10.477 29.063l4.62-2.249-3.986-3.104-.634 5.353zM19.886 26.814l4.633 2.249-.648-5.353-3.985 3.104z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24.519 29.063l-4.633-2.249.377 3.037-.04 1.26 4.296-2.048zM10.477 29.063l4.31 2.048-.027-1.26.35-3.037-4.633 2.249z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.854 21.99l-3.84-1.13 2.71-1.24 1.13 2.37zM20.127 21.99l1.13-2.37 2.724 1.24-3.854 1.13z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.477 29.063l.661-5.53-4.257.121 3.596 5.41zM23.844 23.533l.675 5.53 3.611-5.41-4.286-.12zM27.265 17.721l-7.672.342.714 3.927 1.13-2.37 2.724 1.24 3.104-3.14zM11.014 20.86l2.71-1.24 1.116 2.37.728-3.927-7.686-.342 3.132 3.14z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.916 17.721l3.224 6.286-.108-3.146-3.116-3.14zM23.967 20.861l-.121 3.146 3.237-6.286-3.116 3.14zM15.582 18.063l-.728 3.927.916 4.726.202-6.232-.39-2.421zM19.393 18.063l-.377 2.408.175 6.245.929-4.726-.727-3.927z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.127 21.99l-.929 4.726.661.46 4.002-3.118.121-3.146-3.855 1.078zM11.014 20.861l.108 3.146 4.002 3.118.661-.46-.916-4.726-3.855-1.078z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.2 31.111l.04-1.26-.35-.3h-5.31l-.323.3.027 1.26-4.31-2.048 1.507 1.236 3.06 2.128h5.216l3.073-2.128 1.48-1.236-4.11 2.048z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.886 26.814l-.661-.46h-3.476l-.661.46-.35 3.037.323-.3h5.31l.35.3-.835-3.037z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33.518 11.394l1.1-5.326L32.958 1 19.886 10.574l4.98 4.217 7.044 2.061 1.56-1.815-.674-.487 1.075-.98-.83-.647 1.075-.82-.6-.714zM.38 6.068l1.1 5.326-.7.527 1.088.82-.817.647 1.075.98-.674.487 1.546 1.815 7.043-2.061 4.98-4.217L2.03 1 .38 6.068z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M31.91 16.852l-7.044-2.061 2.16 3.267-3.236 6.286 4.257-.12h6.34l-2.477-7.372zM10.076 14.79L3.032 16.852.555 24.224h6.326l4.244.121-3.224-6.286 2.175-3.268zM19.393 18.063l.444-7.489 2.034-5.502h-9.04l2.007 5.502.472 7.49.148 2.435.014 6.218h3.475l.027-6.218.419-2.436z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Step dot indicator ── */
function StepDots({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          transition: 'all 0.3s ease',
          width: current === i ? 24 : 8,
          height: 8,
          borderRadius: 4,
          background: current === i
            ? (i === 0 ? '#F4640B' : 'linear-gradient(90deg, #63F8B5, #0BC1F4)')
            : 'rgba(255,255,255,0.1)',
        }} />
      ))}
    </div>
  );
}

/* ── Animated background for login ── */
function LoginBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {/* Large orbs */}
      <div style={{ position: 'absolute', width: 700, height: 700, top: -200, right: -200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(39,101,245,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, bottom: -100, left: -100, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,193,244,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, top: '40%', left: '30%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,100,11,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.2,
        backgroundImage: 'radial-gradient(circle, rgba(39,101,245,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
    </div>
  );
}

/* ── Input field ── */
function Field({ icon, label, type = 'text', value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        borderRadius: 12,
        background: focused ? 'rgba(11,193,244,0.04)' : 'rgba(6,14,26,0.8)',
        border: `1px solid ${focused ? 'rgba(11,193,244,0.5)' : 'rgba(39,101,245,0.25)'}`,
        boxShadow: focused ? '0 0 20px rgba(11,193,244,0.1)' : 'none',
        transition: 'all 0.2s ease',
      }}>
        <span style={{ position: 'absolute', left: 14, color: focused ? 'var(--cyan)' : 'var(--muted)', transition: 'color 0.2s' }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)',
            borderRadius: 12,
          }}
        />
      </div>
    </div>
  );
}

/* ── Connect step ── */
function StepConnect({ onConnect, loading }) {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>
      {/* Big Fox icon with pulsing ring */}
      <div style={{ position: 'relative', marginBottom: 36 }}>
        {/* Pulse rings */}
        <div style={{
          position: 'absolute', inset: -16, borderRadius: '50%',
          border: '1px solid rgba(244,100,11,0.3)',
          animation: 'pulse-ring 2.5s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '1px solid rgba(244,100,11,0.2)',
          animation: 'pulse-ring 2.5s ease-out infinite',
          animationDelay: '0.6s',
        }} />
        {/* Icon container */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(244,100,11,0.15), rgba(244,100,11,0.05))',
          border: '2px solid rgba(244,100,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(244,100,11,0.2)',
        }}>
          <FoxIcon size={48} />
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.01em' }}>
        Connectez votre<br />portefeuille
      </h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 320, marginBottom: 40 }}>
        Authentifiez-vous via votre adresse Ethereum. Aucune inscription requise.
      </p>

      {/* MetaMask button */}
      <button
        onClick={onConnect}
        disabled={loading}
        className="btn-metamask"
        style={{
          width: '100%', padding: '18px 24px', borderRadius: 14,
          fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <span className="blink" style={{ fontSize: 18 }}>●</span>
            CONNEXION EN COURS…
          </>
        ) : (
          <>
            <FoxIcon size={24} />
            SE CONNECTER AVEC METAMASK
          </>
        )}
      </button>

      {/* MetaMask note */}
      <div style={{
        marginTop: 20, padding: '12px 16px', borderRadius: 10,
        background: 'rgba(244,100,11,0.06)', border: '1px solid rgba(244,100,11,0.2)',
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      }}>
        <FoxIcon size={16} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(244,100,11,0.9)', lineHeight: 1.5 }}>
          <span style={{ color: '#F4640B', fontWeight: 600 }}>MetaMask</span> doit être installé dans votre navigateur
        </span>
      </div>
    </div>
  );
}

/* ── Profile step ── */
function StepProfile({ form, setForm, onSubmit, loading }) {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(99,248,181,0.15), rgba(11,193,244,0.1))',
            border: '1px solid rgba(11,193,244,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={22} color="var(--teal)" />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
              Complétez votre profil
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 2 }}>
              PREMIÈRE CONNEXION REQUISE
            </p>
          </div>
        </div>

        {/* Connected badge */}
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(39,245,200,0.06)', border: '1px solid rgba(39,245,200,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} className="blink" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', letterSpacing: '0.08em' }}>
            PORTEFEUILLE CONNECTÉ
          </span>
          <Check size={13} color="var(--teal)" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field
            icon={<User size={15} />}
            label="PRÉNOM"
            value={form.first_name}
            onChange={v => setForm(p => ({ ...p, first_name: v }))}
            placeholder="Jean"
            required
          />
          <Field
            icon={<User size={15} />}
            label="NOM"
            value={form.last_name}
            onChange={v => setForm(p => ({ ...p, last_name: v }))}
            placeholder="Dupont"
            required
          />
        </div>
        <Field
          icon={<Mail size={15} />}
          label="ADRESSE EMAIL"
          type="email"
          value={form.email}
          onChange={v => setForm(p => ({ ...p, email: v }))}
          placeholder="jean@exemple.com"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%', padding: '17px 24px', borderRadius: 14, border: 'none',
            fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: loading ? 0.7 : 1, marginTop: 8,
          }}
        >
          {loading ? (
            <><span className="blink">●</span> ENREGISTREMENT…</>
          ) : (
            <>ACCÉDER AU TABLEAU DE BORD <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}

/* ── Page ── */
export default function Login() {
  const { connectWallet, updateProfile, token, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('connect');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (user?.first_name) navigate('/dashboard', { replace: true });
    else setStep('profile');
  }, [token, user, navigate]);

  async function handleConnect() {
    await connectWallet();
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
    } catch {}
    finally { setSubmitting(false); }
  }

  const isConnect = step === 'connect';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'stretch', position: 'relative' }}>
      <LoginBg />

      {/* ── Left panel (branding) — hidden on mobile ── */}
      <div style={{
        display: 'none',
        width: '45%', position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(39,101,245,0.12) 0%, rgba(3,8,15,0.98) 100%)',
        borderRight: '1px solid var(--border)',
        padding: '48px 48px',
        flexDirection: 'column', justifyContent: 'space-between',
      }} id="left-panel"
        // show on md+
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0BC1F4 0%, #2765F5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(11,193,244,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: 1 }}>
            PARK<span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHAIN</span>
          </span>
        </Link>

        {/* Center content */}
        <div>
          <p className="font-display" style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
            Le parking<br />
            <span className="grad-text">de demain.</span><br />
            Aujourd'hui.
          </p>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 320 }}>
            Réservez votre place de parking via la blockchain. Sécurisé, transparent, décentralisé.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { color: 'var(--spring)', text: 'Vue 3D temps réel des places' },
              { color: '#F4640B',       text: 'Paiement via MetaMask' },
              { color: 'var(--cyan)',   text: 'Transactions vérifiables on-chain' },
            ].map(({ color, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0,
                  boxShadow: `0 0 8px ${color}` }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom link */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted2)',
          textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s' }}>
          <ArrowLeft size={13} /> RETOUR À L'ACCUEIL
        </Link>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #0BC1F4 0%, #2765F5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span className="font-display" style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: 1 }}>
                PARK<span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHAIN</span>
              </span>
            </Link>
            <StepDots current={isConnect ? 0 : 1} />
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(8,21,37,0.7)',
            backdropFilter: 'blur(24px)',
            border: isConnect
              ? '1px solid rgba(244,100,11,0.25)'
              : '1px solid rgba(11,193,244,0.25)',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: isConnect
              ? '0 0 60px rgba(244,100,11,0.07), 0 24px 80px rgba(0,0,0,0.4)'
              : '0 0 60px rgba(11,193,244,0.05), 0 24px 80px rgba(0,0,0,0.4)',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          }}>
            {/* Top accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, borderRadius: '0 0 4px 4px',
              background: isConnect
                ? 'linear-gradient(90deg, transparent, #F4640B, transparent)'
                : 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
              transition: 'background 0.4s ease',
            }} />

            {isConnect
              ? <StepConnect onConnect={handleConnect} loading={loading} />
              : <StepProfile form={form} setForm={setForm} onSubmit={handleProfile} loading={submitting} />
            }
          </div>

          {/* Back to home */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted2)',
              textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ArrowLeft size={12} /> RETOUR À L'ACCUEIL
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for pulse-ring */}
      <style>{`
        @keyframes pulse-ring {
          0%  { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100%{ transform: scale(0.95); opacity: 0; }
        }
        @media (min-width: 900px) {
          #left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
