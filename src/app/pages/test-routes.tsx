import { useState, useCallback, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useSound } from '@/app/context/sound-context';

/* ═══════════════════════════════════════════════════════════════════════
   TEST ROUTES — Auth-gated dev/test tool hub
   ──────────────────────────────────────────
   Passcode: 2693
   Protects all nested /test/* routes. Once authenticated in the session,
   shows a dashboard with links to each test tool, or renders the
   nested <Outlet /> if a sub-route is active.
   ═══════════════════════════════════════════════════════════════════════ */

const PASSCODE = '2693';
const SESSION_KEY = 'test_routes_auth';
const BG = '#08080E';
const MINT = '#40F0AA';
const CYAN = '#00EAFF';
const MUTED = '#7A7A90';

const TEST_LINKS = [
  { path: '/test/loading-animation', label: 'Loading Animation', desc: 'SVG morph sequence test bench — all 5 shapes + bar + reactor sound' },
  { path: '/test/sound-tuner', label: 'Chair Sound Tuner', desc: 'Room 03 chair roll sound parameter tuning' },
  { path: '/test/studio-assembly', label: 'Studio Assembly POC', desc: 'Room assembly/disassembly isometric animation proof of concept' },
  { path: '/test/rocket-playground', label: 'Rocket Playground', desc: 'Three.js rocket prototype' },
  { path: '/test/bike-playground', label: 'Bike Playground', desc: 'SVG bike interaction prototype' },
  { path: '/test/access', label: 'Access Screen', desc: 'Original PIN gate UI (code: 5467)' },
];

/* ═══════════════════════════════════════════════════════════════════════ */

export default function TestRoutes() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const { playClick } = useSound();
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Focus input on mount
  useEffect(() => {
    if (!authed && inputRef.current) inputRef.current.focus();
  }, [authed]);

  const submit = useCallback(() => {
    if (code === PASSCODE) {
      playClick();
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setError(false); }, 600);
      setCode('');
    }
  }, [code, playClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  }, [submit]);

  /* ── Auth gate ─────────────────────────────────────────────────────── */
  if (!authed) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: BG,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(64,240,170,0.012) 2px,rgba(64,240,170,0.012) 4px)`,
        }} />

        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: shake ? 'testShake 0.4s ease' : undefined,
        }}>
          {/* Lock icon */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: `1px solid ${error ? '#FF4060' : 'rgba(64,240,170,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, transition: 'border-color 0.3s',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={error ? '#FF4060' : MINT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div style={{
            fontSize: 9, letterSpacing: '0.3em', color: CYAN, textTransform: 'uppercase',
            marginBottom: 8, opacity: 0.6,
          }}>
            Test Routes
          </div>

          <div style={{
            fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', marginBottom: 28,
          }}>
            Enter access code
          </div>

          <input
            ref={inputRef}
            type="password"
            maxLength={4}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            style={{
              width: 160, height: 44, textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${error ? '#FF4060' : 'rgba(64,240,170,0.15)'}`,
              borderRadius: 8, color: '#fff', fontSize: 20, letterSpacing: '0.5em',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none', transition: 'border-color 0.3s',
              caretColor: MINT,
            }}
            placeholder="····"
          />

          <button
            onClick={submit}
            style={{
              marginTop: 20, padding: '10px 32px',
              background: 'transparent',
              border: `1px solid rgba(64,240,170,0.2)`,
              borderRadius: 6, color: MINT, fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(64,240,170,0.5)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(64,240,170,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(64,240,170,0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Authenticate
          </button>

          {error && (
            <div style={{
              marginTop: 16, fontSize: 9, letterSpacing: '0.15em',
              color: '#FF4060', textTransform: 'uppercase',
            }}>
              Invalid code
            </div>
          )}
        </div>

        <style>{`
          @keyframes testShake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Check if we're on a nested sub-route ─────────────────────────── */
  const isIndexRoute = location.pathname === '/test' || location.pathname === '/test/';

  if (!isIndexRoute) {
    return <Outlet />;
  }

  /* ── Dashboard ─────────────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0, background: BG, overflow: 'auto',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(64,240,170,0.012) 2px,rgba(64,240,170,0.012) 4px)`,
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <Link to="/" style={{
            fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase', textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = MINT; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
          >
            &larr; Back to Portfolio
          </Link>
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3,
          color: MINT, marginBottom: 4,
        }}>
          Test Routes
        </h1>

        <p style={{
          fontSize: 10, letterSpacing: '0.1em', color: MUTED, marginBottom: 48,
        }}>
          Development tools, test benches, and prototyping playgrounds.
        </p>

        {/* Route cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TEST_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'block', padding: '20px 24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(64,240,170,0.04)';
                e.currentTarget.style.borderColor = 'rgba(64,240,170,0.15)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                fontSize: 13, letterSpacing: '0.08em', color: '#fff', marginBottom: 6,
              }}>
                {link.label}
              </div>
              <div style={{
                fontSize: 10, letterSpacing: '0.04em', color: MUTED, lineHeight: 1.5,
              }}>
                {link.desc}
              </div>
              <div style={{
                fontSize: 9, letterSpacing: '0.1em', color: 'rgba(0,234,255,0.3)',
                marginTop: 8,
              }}>
                {link.path}
              </div>
            </Link>
          ))}
        </div>

        {/* Session note */}
        <div style={{
          marginTop: 48, fontSize: 9, letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.12)', textAlign: 'center',
        }}>
          Session authenticated. Close tab to require re-auth.
        </div>
      </div>
    </div>
  );
}
