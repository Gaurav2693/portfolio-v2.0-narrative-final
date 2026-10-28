import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Lock } from 'lucide-react';

// Minimal access gate for the client case studies. One code, remembered for the session.
// The code is shared on request and in applications; this is a courtesy to the client, not security.
const CODE = '2693';
const KEY = 'cs-gate';

export function useGate() {
  const [open, setOpen] = useState(() => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } });
  const unlock = () => { try { sessionStorage.setItem(KEY, '1'); } catch {} setOpen(true); };
  return { open, unlock };
}

export function Gate({ title, onUnlock }: { title: string; onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim() === CODE) { onUnlock(); return; }
    setShake(true); setCode(''); setTimeout(() => setShake(false), 500);
  };

  return (
    <section className="grid min-h-[70vh] content-center py-14">
      <div className="grid max-w-[520px] gap-6">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-ink-2"><Lock size={12} /> Client work · access code</p>
        <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-.04em] sm:text-[44px]">{title}</h1>
        <p className="max-w-[46ch] text-[15px] leading-7 text-ink-2">This case study shows a client's product. It is behind a code as a courtesy to them. The code is in my applications and on request: <a className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink" href="mailto:imgaurav2693@gmail.com">imgaurav2693@gmail.com</a>.</p>
        <form onSubmit={submit} className="flex items-center gap-3">
          <input
            ref={input} value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="off" placeholder="Access code" aria-label="Access code"
            className={`h-12 w-44 rounded-md border bg-paper px-4 text-base tracking-[.2em] outline-none transition-colors placeholder:tracking-normal placeholder:text-ink-3 focus:border-ink ${shake ? 'border-red-500 motion-safe:animate-[gate-shake_.4s]' : 'border-line'}`}
          />
          <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-paper hover:bg-ink-2">Open <ArrowRight size={15} /></button>
        </form>
        {shake && <p className="text-sm text-red-600 dark:text-red-400">That code did not match.</p>}
      </div>
    </section>
  );
}
