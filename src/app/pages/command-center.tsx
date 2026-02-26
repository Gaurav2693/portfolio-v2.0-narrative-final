import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { getSlideContent } from '@/app/components/case-study-slides';
import { SlideRenderer } from '@/app/components/slide-renderer';
import { useSound } from '@/app/context/sound-context';
const LazyCpqCaseStudy = lazy(() => import('@/app/pages/cpq-case-study'));
const LazyPlotSyncCaseStudy = lazy(() => import('@/app/pages/plotsync-case-study'));
const LazyExiroCaseStudy = lazy(() => import('@/app/pages/exiro-case-study'));
const LazyInteractiveRoomBg = lazy(() => import('@/app/components/interactive-room-bg'));
const LazyInteractiveGarageBg = lazy(() => import('@/app/components/interactive-garage-bg'));
const LazyInteractiveThinkingBg = lazy(() => import('@/app/components/interactive-thinking-bg'));
const LazyInteractivePrototypeBg = lazy(() => import('@/app/components/interactive-prototype-bg'));
const LazyLivingRoomPiece = lazy(() => import('@/imports/LivingRoomPiece-15281-1786'));
const LazyGarrageRoomPiece = lazy(() => import('@/imports/GarrageRoomPiece'));
const LazyThinkingRoomPiece = lazy(() => import('@/imports/LivingRoomPiece'));
const LazyPrototypeRoomPiece = lazy(() => import('@/imports/PrototypeRoom'));
const LazyAccordionOverlay = lazy(() => import('@/app/components/accordion-overlay'));
const LazyNarrativeOverlay = lazy(() => import('@/app/components/narrative-overlay'));
const LazyHeroSection = lazy(() => import('@/app/components/hero-section'));
const LazyOutroSection = lazy(() => import('@/app/components/outro-section'));
import { setCursorRoom } from '@/app/components/cursor-system';
import RoomDock from '@/app/components/room-dock';
import type { NarrativeType } from '../components/narrative-overlay';
import { useParadeNavigation } from '../hooks/use-parade-navigation';
import RoomAssemblyView from '../components/room-assembly-view';
import { getAmbientSoundscape } from '../components/ambient-soundscape';

/* ═══════════════════════════════════════════════════════════════════════
   COMMAND CENTER  —  v9 (Linear Scroll Journey · No Parade)
   ──────────────────────────────────────────────────────────
   One continuous scroll journey. Each wheel hit = ±1 step.
   Spring physics drive ALL layer transforms. Reverse scroll =
   reverse animation. Every transition produces 2 simultaneous
   animations (exiting + entering).

     Step 0 — Hero (Act 1)
     Step 1 — Studio  (full room + accordion + dock)   ┐
     Step 2 — Garage  (full room + accordion + dock)   │ Act 2–3
     Step 3 — Thinking (full room + accordion + dock)  │
     Step 4 — Prototype Lab (full room + accordion + dock) ┘
     Step 5 — Outro / Contact CTA (Act 4)

   Room-to-room transitions: spring-driven crossfade with directional
   slide. The departing room slides out, the arriving room slides in.
   Room identity is derived from the animated float at midpoint
   boundaries.
   ═══════════════════════════════════════════════════════════════════════ */

const GLASS_CARD = 'linear-gradient(to bottom, rgba(0,48,44,0.9) 0%, rgba(4,4,4,0.94) 28%)';

const CASE_STUDIES = [
  {
    id: 'pqe', title: 'Price Quotation Engine',
    fullTitle: 'Price Quotation Engine Transformation story',
    domain: 'ENTERPRISE CPQ', domainColor: '#00A87C', duration: '6 months',
    role: 'UX Designer / Product Designer', industry: 'IT/B2B',
    about: 'I designed a Price Quotation Engine used to configure complex offers, pricing rules, and approval flows. The core challenge was reducing pricing errors while maintaining speed and flexibility for enterprise users.',
    focusAreas: ['Decision density & pricing logic', 'Risk mitigation & guardrails', 'Performance under operational constraints'],
    outcomes: [{ text: 'Pricing errors reduced by ~', bold: '81%' }, { text: 'Quote completion time improved by ~', bold: '42%' }],
    metrics: [{ label: 'Pricing errors reduced ', value: '81%' }, { label: 'Quote completion time ', value: '42%' }],
    accent: '#00A87C', available: true, slideCount: 12,
    prototypeLink: 'https://cpq-dashboard-v2.vercel.app/', showPrototype: true,
    caseStudyRoute: '/cpq-case-study',
  },
  {
    id: 'plotsync', title: 'PlotSync Platform',
    fullTitle: 'PlotSync Decision Platform',
    domain: 'REAL ESTATE', domainColor: '#FF6B35', duration: '4 months',
    role: 'UX Designer / Product Designer', industry: 'Real Estate',
    about: 'A platform to help users evaluate, verify, and compare land parcels across multiple parameters such as location, ownership, zoning, and feasibility.',
    focusAreas: ['Spatial decision-making', 'Trust, verification, data clarity', 'Multi-criteria evaluation'],
    outcomes: [{ text: 'Decision time reduced by ~', bold: '45%' }, { text: 'Fewer abandoned evaluations', bold: '' }],
    metrics: [{ label: 'Decision time reduced ', value: '45%' }],
    accent: '#FF6B35', available: true, slideCount: 12,
    prototypeLink: '#', showPrototype: false,
    caseStudyRoute: '/plotsync-case-study',
  },
  {
    id: 'exiro', title: 'Exiro AI Platform',
    fullTitle: 'Exiro AI Platform',
    domain: 'AI AUTOMATION', domainColor: '#7C3AED', duration: '4 months',
    role: 'UX Designer / Product Designer', industry: 'AI/Automation',
    about: 'Exiro AI is an automation system where AI assists operational decisions while humans retain control. My work focused on making AI behavior transparent, predictable, and safe to act upon.',
    focusAreas: ['Trust & explainability workflows', 'Failure handling & fallback states', 'Cognitive load during automation'],
    outcomes: [{ text: 'Operator intervention by ~', bold: '40%' }, { text: 'Manual handling time by ~', bold: '35%' }],
    metrics: [{ label: 'Operator intervention ', value: '40%' }, { label: 'Manual handling time ', value: '35%' }],
    accent: '#7C3AED', available: true, slideCount: 11,
    prototypeLink: 'https://exiro.ai', showPrototype: true,
    caseStudyRoute: '/exiro-case-study',
  },
];

const EMAIL = 'imgaurav2693@gmail.com';

const ROOM_ORDER: ('studio' | 'garage' | 'room3' | 'room4')[] = ['studio', 'garage', 'room3', 'room4'];
const ROOM_BG: Record<string, string> = {
  studio: '#08080E', garage: '#08080E', room3: '#08080E', room4: '#08080E',
};

const JOURNEY_STEPS = 6; // 0=hero, 1-4=rooms, 5=outro

/* ══════════════════════════════════════════════════════════════════ */

export default function CommandCenter() {
  const { playClick } = useSound();

  // Ensure ambient soundscape is running (covers boot-skip scenario)
  useEffect(() => {
    const ambient = getAmbientSoundscape();
    if (!ambient.isRunning) ambient.start();
  }, []);

  const [emailCopied, setEmailCopied] = useState(false);
  const [activeStudy, setActiveStudy] = useState<typeof CASE_STUDIES[0] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ── Narrative overlay ── */
  const [activeNarrative, setActiveNarrative] = useState<NarrativeType>(null);
  const openNarrative = useCallback((id: 'my-personal' | 'prototyping') => { playClick(); setActiveNarrative(id); }, [playClick]);
  const closeNarrative = useCallback(() => { playClick(); setActiveNarrative(null); }, [playClick]);

  /* ── Current room (derived from journey step at midpoints) ── */
  const [currentRoom, setCurrentRoom] = useState<'studio' | 'garage' | 'room3' | 'room4'>('studio');
  const currentRoomIdxRef = useRef(0);
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(() => new Set(['studio']));

  /* ── Room 3 exit animation ── */
  const [exitingRoom3, setExitingRoom3] = useState(false);
  const pendingRoom = useRef<'studio' | 'garage' | 'room3' | 'room4' | null>(null);

  /* ── Room transition direction (for slide animation) ── */
  const [roomTransitionDir, setRoomTransitionDir] = useState<'up' | 'down'>('down');

  /* ── Studio assembly state ── */
  const studioAssemblyProgressRef = useRef(0);
  const [studioPhase, setStudioPhase] = useState<'assembling' | 'active' | 'disassembling' | 'hidden'>('assembling');
  const studioPhaseRef = useRef<'assembling' | 'active' | 'disassembling' | 'hidden'>('assembling');

  const onStudioAssembled = useCallback(() => {
    studioPhaseRef.current = 'active';
    setStudioPhase('active');
  }, []);

  const onStudioDisassembled = useCallback(() => {
    studioPhaseRef.current = 'hidden';
    setStudioPhase('hidden');
  }, []);

  /* ── Garage assembly state ── */
  const garageAssemblyProgressRef = useRef(0);
  const [garagePhase, setGaragePhase] = useState<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');
  const garagePhaseRef = useRef<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');

  const onGarageAssembled = useCallback(() => {
    garagePhaseRef.current = 'active';
    setGaragePhase('active');
  }, []);

  const onGarageDisassembled = useCallback(() => {
    garagePhaseRef.current = 'hidden';
    setGaragePhase('hidden');
  }, []);

  /* ── Thinking assembly state ── */
  const thinkingAssemblyProgressRef = useRef(0);
  const [thinkingPhase, setThinkingPhase] = useState<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');
  const thinkingPhaseRef = useRef<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');

  const onThinkingAssembled = useCallback(() => {
    thinkingPhaseRef.current = 'active';
    setThinkingPhase('active');
  }, []);

  const onThinkingDisassembled = useCallback(() => {
    thinkingPhaseRef.current = 'hidden';
    setThinkingPhase('hidden');
  }, []);

  /* ── Prototype assembly state ── */
  const prototypeAssemblyProgressRef = useRef(0);
  const [prototypePhase, setPrototypePhase] = useState<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');
  const prototypePhaseRef = useRef<'assembling' | 'active' | 'disassembling' | 'hidden'>('hidden');

  const onPrototypeAssembled = useCallback(() => {
    prototypePhaseRef.current = 'active';
    setPrototypePhase('active');
  }, []);

  const onPrototypeDisassembled = useCallback(() => {
    prototypePhaseRef.current = 'hidden';
    setPrototypePhase('hidden');
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SCROLL JOURNEY  —  Unified spring across all 6 steps
     ═══════════════════════════════════════════════════════════════════ */

  const journey = useParadeNavigation({
    count: JOURNEY_STEPS,
    initialIndex: 0,
    stiffness: 0.038,
    damping: 0.73,
    wheelCooldown: 850,
    wheelThreshold: 25,
  });

  // Reset assembly when scrolling back to hero
  useEffect(() => {
    if (journey.activeIndex === 0 && studioPhaseRef.current === 'active') {
      onStudioDisassembled();
    }
  }, [journey.activeIndex]);

  /* ── Ambient soundscape duck/unduck based on journey position ── */
  useEffect(() => {
    const ambient = getAmbientSoundscape();
    if (journey.targetIndex >= 1 && journey.targetIndex <= 4) {
      // In rooms — duck the ambient
      ambient.duck();
    } else {
      // Hero or outro — restore ambient
      ambient.unduck();
    }
  }, [journey.targetIndex]);

  /* ── DOM refs ── */
  const journeyContainerRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const cardLayerRef = useRef<HTMLDivElement>(null);
  const outroLayerRef = useRef<HTMLDivElement>(null);

  /* ── Blocking refs ── */
  const activeStudyRef = useRef(activeStudy);
  activeStudyRef.current = activeStudy;
  const activeNarrativeRef = useRef(activeNarrative);
  activeNarrativeRef.current = activeNarrative;

  /* ── Journey frame callback — direct DOM transforms ── */
  useEffect(() => {
    journey.onFrame((step: number) => {
      const hero = heroLayerRef.current;
      const card = cardLayerRef.current;
      const outro = outroLayerRef.current;

      // ── Hero (step 0 → 1): exits upward, fades ──
      if (hero) {
        const p = Math.max(0, Math.min(step, 1));
        hero.style.opacity = String(1 - p);
        hero.style.transform = `translateY(${-p * 80}px) scale(${1 - p * 0.06})`;
        hero.style.pointerEvents = p > 0.5 ? 'none' : 'auto';
      }

      // ── Card wrapper (step 0→1 entrance, step 4→5 exit) ──
      if (card) {
        const studioAnimating = studioPhaseRef.current !== 'active' && studioPhaseRef.current !== 'hidden';
        const garageAnimating = garagePhaseRef.current !== 'active' && garagePhaseRef.current !== 'hidden';
        const thinkingAnimating = thinkingPhaseRef.current !== 'active' && thinkingPhaseRef.current !== 'hidden';
        const protoAnimating = prototypePhaseRef.current !== 'active' && prototypePhaseRef.current !== 'hidden';
        const anyAssemblyActive =
          (studioAnimating && step < 2.5) ||
          (garageAnimating && step >= 1 && step < 3.5) ||
          (thinkingAnimating && step >= 2 && step < 4.5) ||
          (protoAnimating && step >= 3 && step < 5.5);
        if (anyAssemblyActive) {
          // Assembly/disassembly mode — card layer fully visible immediately
          const show = step > 0.02;
          card.style.opacity = show ? '1' : '0';
          card.style.transform = 'translateY(0)';
          card.style.pointerEvents = show ? 'auto' : 'none';
        } else {
          // Normal mode — fade/slide entrance + exit
          const enterP = Math.max(0, Math.min(step, 1));
          const exitP = Math.max(0, Math.min(step - 4, 1));
          const vis = enterP * (1 - exitP);
          const yEnter = (1 - enterP) * 60;
          const yExit = exitP * -60;
          card.style.opacity = String(vis);
          card.style.transform = `translateY(${yEnter + yExit}px)`;
          card.style.pointerEvents = (vis > 0.5) ? 'auto' : 'none';
        }
      }

      // ── Outro (step 4 → 5): enters from below ──
      if (outro) {
        const p = Math.max(0, Math.min(step - 4, 1));
        outro.style.opacity = String(p);
        outro.style.transform = `translateY(${(1 - p) * 80}px) scale(${0.92 + p * 0.08})`;
        outro.style.pointerEvents = p > 0.5 ? 'auto' : 'none';
      }

      // ── Studio assembly progress: entry (step 0→1) + exit (step 1→2) ──
      if (step <= 1) {
        studioAssemblyProgressRef.current = Math.max(0, step);
      } else {
        studioAssemblyProgressRef.current = Math.max(0, 2 - step);
      }

      // ── Studio phase transitions (rAF-safe, via refs) ──
      const sp = studioPhaseRef.current;
      const at = studioAssemblyProgressRef.current; // assembly target
      if (sp === 'hidden' && step > 0.02 && step < 2) {
        studioPhaseRef.current = 'assembling';
        queueMicrotask(() => setStudioPhase('assembling'));
      }
      if (sp === 'active' && at < 0.92) {
        studioPhaseRef.current = 'disassembling';
        queueMicrotask(() => setStudioPhase('disassembling'));
      }
      if (sp === 'disassembling' && at > 0.95) {
        // Cancel exit — user scrolled back, re-enter active
        studioPhaseRef.current = 'active';
        queueMicrotask(() => setStudioPhase('active'));
      }
      // Safety net: if step has moved well beyond studio's range,
      // force-hide to prevent ghost rendering
      if ((sp === 'assembling' || sp === 'disassembling') && (step >= 2.5 || step < -0.1)) {
        studioPhaseRef.current = 'hidden';
        queueMicrotask(() => setStudioPhase('hidden'));
      }

      // ── Garage assembly progress: entry (step 1→2) + exit (step 2→3) ──
      if (step <= 2) {
        garageAssemblyProgressRef.current = Math.max(0, step - 1);
      } else {
        garageAssemblyProgressRef.current = Math.max(0, 3 - step);
      }

      // ── Garage phase transitions ──
      const gp = garagePhaseRef.current;
      const gat = garageAssemblyProgressRef.current;
      if (gp === 'hidden' && gat > 0.02 && step < 3) {
        garagePhaseRef.current = 'assembling';
        queueMicrotask(() => setGaragePhase('assembling'));
      }
      if (gp === 'active' && gat < 0.92) {
        garagePhaseRef.current = 'disassembling';
        queueMicrotask(() => setGaragePhase('disassembling'));
      }
      if (gp === 'disassembling' && gat > 0.95) {
        garagePhaseRef.current = 'active';
        queueMicrotask(() => setGaragePhase('active'));
      }
      // Safety net: force-hide garage if step is well beyond its range
      if ((gp === 'assembling' || gp === 'disassembling') && (step >= 3.5 || step < 0.5)) {
        garagePhaseRef.current = 'hidden';
        queueMicrotask(() => setGaragePhase('hidden'));
      }

      // ── Thinking assembly progress: entry (step 2→3) + exit (step 3→4) ──
      if (step <= 3) {
        thinkingAssemblyProgressRef.current = Math.max(0, step - 2);
      } else {
        thinkingAssemblyProgressRef.current = Math.max(0, 4 - step);
      }

      // ── Thinking phase transitions ──
      const tp = thinkingPhaseRef.current;
      const tat = thinkingAssemblyProgressRef.current;
      if (tp === 'hidden' && tat > 0.02 && step < 4) {
        thinkingPhaseRef.current = 'assembling';
        queueMicrotask(() => setThinkingPhase('assembling'));
      }
      if (tp === 'active' && tat < 0.92) {
        thinkingPhaseRef.current = 'disassembling';
        queueMicrotask(() => setThinkingPhase('disassembling'));
      }
      if (tp === 'disassembling' && tat > 0.95) {
        thinkingPhaseRef.current = 'active';
        queueMicrotask(() => setThinkingPhase('active'));
      }
      // Safety net: force-hide thinking if step is well beyond its range
      if ((tp === 'assembling' || tp === 'disassembling') && (step >= 4.5 || step < 1.5)) {
        thinkingPhaseRef.current = 'hidden';
        queueMicrotask(() => setThinkingPhase('hidden'));
      }

      // ── Prototype assembly progress: entry (step 3→4) + exit (step 4→5) ──
      if (step <= 4) {
        prototypeAssemblyProgressRef.current = Math.max(0, step - 3);
      } else {
        prototypeAssemblyProgressRef.current = Math.max(0, 5 - step);
      }

      // ── Prototype phase transitions ──
      const pp = prototypePhaseRef.current;
      const pat = prototypeAssemblyProgressRef.current;
      if (pp === 'hidden' && pat > 0.02 && step < 5) {
        prototypePhaseRef.current = 'assembling';
        queueMicrotask(() => setPrototypePhase('assembling'));
      }
      if (pp === 'active' && pat < 0.92) {
        prototypePhaseRef.current = 'disassembling';
        queueMicrotask(() => setPrototypePhase('disassembling'));
      }
      if (pp === 'disassembling' && pat > 0.95) {
        prototypePhaseRef.current = 'active';
        queueMicrotask(() => setPrototypePhase('active'));
      }
      // Safety net: force-hide prototype if step is well beyond its range
      if ((pp === 'assembling' || pp === 'disassembling') && (step >= 5.5 || step < 2.5)) {
        prototypePhaseRef.current = 'hidden';
        queueMicrotask(() => setPrototypePhase('hidden'));
      }

      // ── Derive current room from animated step (at midpoints) ──
      // step 1.0-1.49 → room 0, step 1.50-2.49 → room 1, etc.
      const roomFloat = Math.max(0, Math.min(3, step - 1));
      const roomIdx = Math.round(roomFloat);
      const clampedIdx = Math.max(0, Math.min(3, roomIdx));

      if (clampedIdx !== currentRoomIdxRef.current) {
        const dir = clampedIdx > currentRoomIdxRef.current ? 'down' : 'up';
        currentRoomIdxRef.current = clampedIdx;
        // Schedule React update (batched, doesn't block rAF)
        queueMicrotask(() => {
          setCurrentRoom(ROOM_ORDER[clampedIdx]);
          setRoomTransitionDir(dir);
          setVisitedRooms(prev => {
            const room = ROOM_ORDER[clampedIdx];
            if (prev.has(room)) return prev;
            const next = new Set(prev);
            next.add(room);
            return next;
          });
        });
      }
    });
  }, [journey.onFrame]);

  /* ── Initial frame position (step 0 = hero visible) ── */
  useEffect(() => {
    const hero = heroLayerRef.current;
    const card = cardLayerRef.current;
    const outro = outroLayerRef.current;
    if (hero) { hero.style.opacity = '1'; hero.style.transform = 'translateY(0) scale(1)'; hero.style.pointerEvents = 'auto'; }
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateY(60px)'; card.style.pointerEvents = 'none'; }
    if (outro) { outro.style.opacity = '0'; outro.style.transform = 'translateY(80px) scale(0.92)'; outro.style.pointerEvents = 'none'; }
  }, []);

  /* ── Attach journey wheel handler ── */
  useEffect(() => {
    const el = journeyContainerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (activeStudyRef.current) return;
      if (activeNarrativeRef.current) return;
      journey.handleWheel(e);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [journey.handleWheel]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeStudyRef.current) return;
      if (activeNarrativeRef.current) return;
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); journey.goNext(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); journey.goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [journey.goNext, journey.goPrev]);

  /* ── Touch support ── */
  useEffect(() => {
    const el = journeyContainerRef.current;
    if (!el) return;
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      if (activeStudyRef.current) return;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;
      if (dy > 0) journey.goNext(); else journey.goPrev();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); };
  }, [journey.goNext, journey.goPrev]);

  /* ── Hero CTA → jump to Room 1 ── */
  const onHeroEnterRooms = useCallback(() => {
    journey.goTo(1);
  }, [journey.goTo]);

  /* ── Room Dock switching → drive journey ── */
  const switchRoom = useCallback((room: 'studio' | 'garage' | 'room3' | 'room4') => {
    const idx = ROOM_ORDER.indexOf(room);
    if (idx >= 0) journey.goTo(idx + 1);
  }, [journey.goTo]);

  /* ── Room 3 exit animation callback ── */
  const onRoom3ExitComplete = useCallback(() => {
    setExitingRoom3(false);
    const next = pendingRoom.current;
    if (next) {
      const idx = ROOM_ORDER.indexOf(next);
      if (idx >= 0) journey.goTo(idx + 1);
      pendingRoom.current = null;
    }
  }, [journey.goTo]);

  /* ── Sync cursor system ── */
  useEffect(() => { setCursorRoom(currentRoom); return () => { setCursorRoom('default'); }; }, [currentRoom]);

  /* ── Accordion overlay delayed entrance ── */
  const [overlayVisible, setOverlayVisible] = useState(false);
  useEffect(() => {
    const isReturn = sessionStorage.getItem('cc_visited') === '1';
    const delay = isReturn ? 1200 : 5500;
    const t = setTimeout(() => { setOverlayVisible(true); sessionStorage.setItem('cc_visited', '1'); }, delay);
    return () => clearTimeout(t);
  }, []);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL); setEmailCopied(true); playClick();
    setTimeout(() => setEmailCopied(false), 2000);
  }, [playClick]);

  const openStudyById = useCallback((studyId: string) => {
    const study = CASE_STUDIES.find(s => s.id === studyId);
    if (!study || !study.available) return;
    playClick(); setActiveStudy(study); setCurrentSlide(0);
  }, [playClick]);

  const closeStudy = useCallback(() => { playClick(); setActiveStudy(null); }, [playClick]);
  const prevSlide = useCallback(() => { if (currentSlide > 0) { playClick(); setCurrentSlide(n => n - 1); } }, [currentSlide, playClick]);
  const nextSlide = useCallback(() => { if (activeStudy && currentSlide < activeStudy.slideCount - 1) { playClick(); setCurrentSlide(n => n + 1); } }, [currentSlide, activeStudy, playClick]);

  useEffect(() => {
    if (!activeStudy) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closeStudy(); if (e.key === 'ArrowLeft') prevSlide(); if (e.key === 'ArrowRight') nextSlide(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [activeStudy, closeStudy, prevSlide, nextSlide]);

  useEffect(() => {
    if (!activeNarrative) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNarrative(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [activeNarrative, closeNarrative]);

  /* ── Is the card currently visible? (for conditional rendering) ── */
  const cardVisible = journey.targetIndex >= 1 && journey.targetIndex <= 4;

  /* ── Assembly gating — hide overlays during any room assembly ── */
  const studioAssembling = currentRoom === 'studio' && studioPhase !== 'active';
  const garageAssembling = currentRoom === 'garage' && garagePhase !== 'active';
  const thinkingAssembling = currentRoom === 'room3' && thinkingPhase !== 'active';
  const prototypeAssembling = currentRoom === 'room4' && prototypePhase !== 'active';
  const anyRoomAssembling = studioAssembling || garageAssembling || thinkingAssembling || prototypeAssembling;
  const needsOverflow =
    studioPhase === 'assembling' || studioPhase === 'disassembling' ||
    garagePhase === 'assembling' || garagePhase === 'disassembling' ||
    thinkingPhase === 'assembling' || thinkingPhase === 'disassembling' ||
    prototypePhase === 'assembling' || prototypePhase === 'disassembling';

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════════��═════ */

  return (
    <div
      ref={journeyContainerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: '#08080E' }}
    >
      {/* ═══ HERO LAYER (Act 1) ═══════════════════════════════════════ */}
      <div
        ref={heroLayerRef}
        className="absolute inset-0 z-30"
        style={{ willChange: 'transform, opacity' }}
      >
        <Suspense fallback={null}>
          <LazyHeroSection onEnterRooms={onHeroEnterRooms} />
        </Suspense>
      </div>

      {/* ═══ CARD LAYER (Acts 2–3 · Full rooms) ════════════════════════ */}
      <div
        ref={cardLayerRef}
        className="absolute inset-0 z-20"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className={`relative w-full h-full ${needsOverflow ? 'overflow-visible' : 'overflow-hidden'}`}
          style={{
            backgroundColor: ROOM_BG[currentRoom] ?? '#0a0a0f',
            transition: 'background-color 0.6s ease',
          }}
        >
          {/* ── Room background ── */}

          {/* ── Studio: dedicated layer outside AnimatePresence ──
               Assembly view is ALWAYS mounted when phase !== 'hidden'.
               InteractiveRoomBg layers ON TOP with crossfade opacity.
               This eliminates the hard swap flash. ── */}
          {studioPhase !== 'hidden' && (
            <div className="absolute inset-0" style={{ overflow: 'visible' }}>
              <RoomAssemblyView
                RoomComponent={LazyLivingRoomPiece}
                roomWidth={805}
                roomHeight={609}
                progressRef={studioAssemblyProgressRef}
                onAssembled={onStudioAssembled}
                onDisassembled={onStudioDisassembled}
              />
              {/* Interactive overlay — fades in when assembled, dissolves on exit */}
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{
                  opacity: studioPhase === 'active' ? 1 : 0,
                  pointerEvents: studioPhase === 'active' ? 'auto' : 'none',
                }}
              >
                {(studioPhase === 'active' || studioPhase === 'disassembling') && (
                  <Suspense fallback={null}>
                    <LazyInteractiveRoomBg skipEntrance />
                  </Suspense>
                )}
              </div>
            </div>
          )}

          {/* ── Garage: dedicated layer outside AnimatePresence ── */}
          {garagePhase !== 'hidden' && (
            <div className="absolute inset-0" style={{ overflow: 'visible' }}>
              <RoomAssemblyView
                RoomComponent={LazyGarrageRoomPiece}
                roomWidth={805}
                roomHeight={609}
                zoom={1.75}
                progressRef={garageAssemblyProgressRef}
                onAssembled={onGarageAssembled}
                onDisassembled={onGarageDisassembled}
              />
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{
                  opacity: garagePhase === 'active' ? 1 : 0,
                  pointerEvents: garagePhase === 'active' ? 'auto' : 'none',
                }}
              >
                {(garagePhase === 'active' || garagePhase === 'disassembling') && (
                  <Suspense fallback={null}>
                    <LazyInteractiveGarageBg skipEntrance />
                  </Suspense>
                )}
              </div>
            </div>
          )}

          {/* ── Thinking: dedicated layer outside AnimatePresence ── */}
          {thinkingPhase !== 'hidden' && (
            <div className="absolute inset-0" style={{ overflow: 'visible' }}>
              <RoomAssemblyView
                RoomComponent={LazyThinkingRoomPiece}
                roomWidth={805}
                roomHeight={609}
                zoom={1.75}
                progressRef={thinkingAssemblyProgressRef}
                onAssembled={onThinkingAssembled}
                onDisassembled={onThinkingDisassembled}
              />
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{
                  opacity: thinkingPhase === 'active' ? 1 : 0,
                  pointerEvents: thinkingPhase === 'active' ? 'auto' : 'none',
                }}
              >
                {(thinkingPhase === 'active' || thinkingPhase === 'disassembling') && (
                  <Suspense fallback={null}>
                    <LazyInteractiveThinkingBg skipEntrance />
                  </Suspense>
                )}
              </div>
            </div>
          )}

          {/* ── Prototype Lab: dedicated layer outside AnimatePresence ── */}
          {prototypePhase !== 'hidden' && (
            <div className="absolute inset-0" style={{ overflow: 'visible' }}>
              <RoomAssemblyView
                RoomComponent={LazyPrototypeRoomPiece}
                roomWidth={805}
                roomHeight={609}
                zoom={1.75}
                progressRef={prototypeAssemblyProgressRef}
                onAssembled={onPrototypeAssembled}
                onDisassembled={onPrototypeDisassembled}
              />
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{
                  opacity: prototypePhase === 'active' ? 1 : 0,
                  pointerEvents: prototypePhase === 'active' ? 'auto' : 'none',
                }}
              >
                {(prototypePhase === 'active' || prototypePhase === 'disassembling') && (
                  <Suspense fallback={null}>
                    <LazyInteractivePrototypeBg skipEntrance />
                  </Suspense>
                )}
              </div>
            </div>
          )}

          {/* ── Accordion Overlay ── */}
          <Suspense fallback={null}>
            <LazyAccordionOverlay
              currentRoom={currentRoom}
              onOpenStudy={openStudyById}
              emailCopied={emailCopied}
              onCopyEmail={copyEmail}
              playClick={playClick}
              visible={overlayVisible && !activeStudy}
              dimmed={anyRoomAssembling}
              visitedRooms={visitedRooms}
              onOpenNarrative={openNarrative}
            />
          </Suspense>

          {/* ── Room Dock (right-edge switcher) ── */}
          {!activeStudy && (
            <RoomDock
              currentRoom={currentRoom}
              onSwitchRoom={switchRoom}
            />
          )}

          {/* ── Case Study Deep Dive ── */}
          <AnimatePresence>
            {activeStudy && activeStudy.caseStudyRoute && (
              <motion.div
                key={`${activeStudy.id}-fullscreen`}
                className="absolute inset-0 z-30 rounded-[31px] overflow-hidden"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(165deg, rgba(12,16,24,0.92) 0%, rgba(8,12,20,0.95) 40%, rgba(10,14,22,0.93) 100%)', backdropFilter: 'blur(24px)' }} />
                <div className="relative w-full h-full">
                  <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,14,22,0.95)' }}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-[28px] h-[28px] rounded-full" style={{ border: '2px solid rgba(255,255,255,0.08)', borderTopColor: activeStudy.accent, animation: 'spin 0.8s linear infinite' }} />
                        <span className="font-['Cambay',sans-serif] text-[12px] text-white/30">Loading case study…</span>
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                      </div>
                    </div>
                  }>
                    {activeStudy.id === 'pqe' && <LazyCpqCaseStudy embedded onClose={closeStudy} />}
                    {activeStudy.id === 'plotsync' && <LazyPlotSyncCaseStudy embedded onClose={closeStudy} />}
                    {activeStudy.id === 'exiro' && <LazyExiroCaseStudy embedded onClose={closeStudy} />}
                  </Suspense>
                </div>
              </motion.div>
            )}

            {activeStudy && !activeStudy.caseStudyRoute && (
              <>
                <motion.div
                  key="left-panel"
                  className="absolute z-30 rounded-[24px]"
                  style={{ left: 20, top: 20, width: 370, height: 853, background: GLASS_CARD, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(2px)' }}
                  initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="h-full flex flex-col px-[26px] pt-[24px] pb-[20px] overflow-hidden">
                    <div className="flex items-center gap-[8px] mb-[16px]">
                      <div className="w-[8px] h-[8px] bg-[#27c840] rounded-full" />
                      <span className="font-['Cambay',sans-serif] text-[13px] text-white/40">Gaurav Mishra</span>
                    </div>
                    <h2 className="font-['Bebas_Neue',sans-serif] text-[28px] leading-[30px] tracking-[0.5px] text-white mb-[12px]">{activeStudy.fullTitle}</h2>
                    <div className="flex flex-wrap gap-[8px] mb-[14px]">
                      {[activeStudy.role, activeStudy.duration, activeStudy.industry].map((tag, i) => (
                        <span key={i} className="font-['Cambay',sans-serif] text-[11px] px-[8px] py-[3px] rounded-[5px] text-white/55" style={{ background: 'rgba(255,255,255,0.06)' }}>{tag}</span>
                      ))}
                    </div>
                    <p className="font-['Cambay',sans-serif] text-[13px] leading-[20px] text-white/45 mb-[16px]">{activeStudy.about}</p>
                    <div className="mb-[14px]">
                      <p className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[2.5px] text-white/25 uppercase mb-[6px]">Focus Areas</p>
                      {activeStudy.focusAreas.map((a, i) => (
                        <p key={i} className="font-['Cambay',sans-serif] text-[12px] leading-[18px] text-white/40 mb-[2px]"><span className="text-white/20 mr-[6px]">&#8226;</span>{a}</p>
                      ))}
                    </div>
                    <div className="mb-[18px]">
                      <p className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[2.5px] text-white/25 uppercase mb-[6px]">Outcomes</p>
                      {activeStudy.outcomes.map((o, i) => (
                        <p key={i} className="font-['Cambay',sans-serif] text-[12px] leading-[18px] text-white/40 mb-[2px]"><span className="text-white/20 mr-[6px]">&#8226;</span>{o.text}{o.bold && <span className="text-white/72 font-bold">{o.bold}</span>}</p>
                      ))}
                    </div>
                    <div className="flex flex-col gap-[8px] mt-auto">
                      {activeStudy.showPrototype && (
                        <a href={activeStudy.prototypeLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-[7px] py-[9px] rounded-[9px] cursor-pointer transition-all hover:brightness-110"
                          style={{ background: activeStudy.accent }} onClick={() => playClick()}>
                          <ExternalLink className="size-[13px] text-white" strokeWidth={2} />
                          <span className="font-['Cambay',sans-serif] text-[13px] text-white font-bold">View Live Prototype</span>
                        </a>
                      )}
                      <button onClick={closeStudy} className="flex items-center justify-center gap-[6px] py-[8px] rounded-[9px] cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ChevronLeft className="size-[12px] text-white/38" strokeWidth={2} />
                        <span className="font-['Cambay',sans-serif] text-[13px] text-white/50">Back to Overview</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  key="right-panel"
                  className="absolute z-30 rounded-[24px] overflow-hidden"
                  style={{ left: 406, top: 20, width: 889, height: 853, background: GLASS_CARD, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(2px)' }}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-[26px] pt-[18px] pb-[10px] shrink-0">
                      <div className="flex items-center gap-[10px]">
                        <p className="font-['Bebas_Neue',sans-serif] text-[15px] tracking-[2.5px] text-white/38 uppercase">Case Study Slides</p>
                        <span className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[1.5px] px-[6px] py-[1px] rounded-[4px]" style={{ color: activeStudy.accent, background: `${activeStudy.accent}18` }}>{currentSlide + 1}/{activeStudy.slideCount}</span>
                      </div>
                      <button onClick={closeStudy} className="flex items-center justify-center size-[28px] rounded-full cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <X className="size-[14px] text-white/45" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden px-[12px] pb-[4px]">
                      <div className="w-full h-full rounded-[16px] overflow-y-auto overflow-x-hidden scrollbar-custom" style={{ background: 'rgba(25,25,25,0.45)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <AnimatePresence mode="wait">
                          <motion.div key={`s-${currentSlide}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}
                            className={`w-full min-h-full ${currentSlide === 0 ? 'flex items-center justify-center' : 'p-[32px]'}`}>
                            {currentSlide !== 0 && <h2 className="font-['Cambay',sans-serif] font-bold text-[24px] text-white tracking-[0.24px] mb-[24px]">{getSlideContent(activeStudy.id, currentSlide).title}</h2>}
                            <div className="text-white"><SlideRenderer content={getSlideContent(activeStudy.id, currentSlide).content} /></div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-[22px] py-[10px] shrink-0">
                      <button onClick={prevSlide} disabled={currentSlide === 0} className="flex items-center justify-center size-[32px] rounded-full cursor-pointer disabled:opacity-20" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <ChevronLeft className="size-[16px] text-white/65" strokeWidth={2} />
                      </button>
                      <div className="flex items-center gap-[4px]">
                        {Array.from({ length: activeStudy.slideCount }).map((_, i) => (
                          <button key={i} onClick={() => { playClick(); setCurrentSlide(i); }} className="cursor-pointer">
                            <div className="h-[4px] rounded-full transition-all duration-300" style={{ width: currentSlide === i ? 22 : 4, backgroundColor: currentSlide === i ? activeStudy.accent : 'rgba(255,255,255,0.1)' }} />
                          </button>
                        ))}
                      </div>
                      <button onClick={nextSlide} disabled={currentSlide === activeStudy.slideCount - 1} className="flex items-center justify-center size-[32px] rounded-full cursor-pointer disabled:opacity-20" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <ChevronRight className="size-[16px] text-white/65" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Narrative Overlay ── */}
          <AnimatePresence>
            {activeNarrative && (
              <Suspense fallback={null}>
                <LazyNarrativeOverlay activeNarrative={activeNarrative} onClose={closeNarrative} />
              </Suspense>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ OUTRO LAYER (Act 4) ══════════════════════════════════════ */}
      <div
        ref={outroLayerRef}
        className="absolute inset-0 z-10"
        style={{ willChange: 'transform, opacity' }}
      >
        <Suspense fallback={null}>
          <LazyOutroSection />
        </Suspense>
      </div>
    </div>
  );
}
