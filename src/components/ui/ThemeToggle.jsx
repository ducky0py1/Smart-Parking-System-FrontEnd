import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      style={{
        position: 'relative',
        width: 48,
        height: 26,
        borderRadius: 13,
        border: isDark
          ? '1px solid rgba(39,101,245,0.4)'
          : '1px solid rgba(11,193,244,0.5)',
        background: isDark
          ? 'rgba(39,101,245,0.12)'
          : 'rgba(11,193,244,0.10)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flexShrink: 0,
        boxShadow: isDark
          ? '0 0 10px rgba(39,101,245,0.2)'
          : '0 0 10px rgba(11,193,244,0.2)',
      }}
      className={className}
    >
      {/* Track fill */}
      <span style={{
        position: 'absolute',
        inset: 2,
        borderRadius: 11,
        background: isDark
          ? 'linear-gradient(135deg, rgba(39,101,245,0.3), rgba(11,193,244,0.2))'
          : 'linear-gradient(135deg, rgba(11,193,244,0.35), rgba(99,248,181,0.25))',
        transition: 'all 0.3s ease',
      }} />

      {/* Sliding knob */}
      <span style={{
        position: 'absolute',
        top: 3,
        left: isDark ? 3 : 23,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg, #2765F5, #0BC1F4)'
          : 'linear-gradient(135deg, #0BC1F4, #63F8B5)',
        boxShadow: isDark
          ? '0 0 8px rgba(39,101,245,0.6)'
          : '0 0 8px rgba(11,193,244,0.6)',
        transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
      }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
