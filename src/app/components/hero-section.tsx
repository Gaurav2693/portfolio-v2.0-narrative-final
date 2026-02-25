import { useRef, useEffect, useCallback, useState } from 'react';
import { animate } from 'animejs';
import HeroScreenBase from '@/imports/HeroScreen';
import HeroParticles from './hero-particles';
import HeroDataTicker from './hero-data-ticker';
import HeroRadarPulse from './hero-radar-pulse';
import { downloadResumePdf } from './resume-download';

/* ═══════════════════════════════════════════════════════════════════════
   HERO SECTION — Cyberpunk Cityscape with Figma Skyline
   ──────────────────────────────────────────────────────
   Renders the Figma HeroScreen as the visual base, then layers on:
   
   1. Entry sequence: skyline rises → windows cascade on → content
      EMERGES FROM BEHIND the cityscape (z-layered parallax rise)
   2. Ambient window flicker via CSS transitions (not Anime.js — more
      reliable for SVG fill-opacity cycling)
   3. Mouse-reactive micro-parallax (diorama effect)
   4. Scroll indicator pulse loop
   5. Subtle title glitch on interval
   6. CTA glow breathe
   7. Description typewriter effect (repeats every 10s)
   
   All animation is DOM-direct (zero React re-renders).
   ══════════════════════════════════════════════════════════════════════ */

interface HeroSectionProps {
  onEnterRooms?: () => void;
}

export default function HeroSection({ onEnterRooms }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const flickerTimerRef = useRef<ReturnType<typeof setInterval>>();
  const glitchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const typewriterRef = useRef<ReturnType<typeof setInterval>>();
  const animatedRef = useRef(false);
  const [scale, setScale] = useState(1);

  const DESIGN_W = 1728;
  const DESIGN_H = 1117;

  /* ── Viewport-responsive scaling ─────────────────────────────────── */
  useEffect(() => {
    const update = () => {
      setScale(Math.max(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ── Wire CTA clicks ──────────────────────────────────────────────── */
  const wireButtons = useCallback((el: HTMLElement) => {
    const btn = el.querySelector('[data-name="Button"]') as HTMLElement | null;
    if (btn) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => onEnterRooms?.());
      btn.addEventListener('mouseenter', () => {
        btn.style.boxShadow = '0 0 30px rgba(64,240,170,0.5), 0 0 80px rgba(64,240,170,0.2)';
        btn.style.transform = 'translateY(-2px)';
        btn.style.backgroundColor = '#5AFFC0';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = '0px 0px 20px 0px rgba(64,240,170,0.3),0px 0px 60px 0px rgba(64,240,170,0.1)';
        btn.style.transform = '';
        btn.style.backgroundColor = '#40f0aa';
      });
    }
    const link = el.querySelector('[data-name="Link"]') as HTMLElement | null;
    if (link) {
      link.style.cursor = 'pointer';
      link.addEventListener('click', () => downloadResumePdf());
      link.addEventListener('mouseenter', () => {
        link.style.borderColor = 'rgba(0,234,255,0.4)';
        link.style.transform = 'translateY(-2px)';
        link.style.boxShadow = '0 0 20px rgba(0,234,255,0.12)';
      });
      link.addEventListener('mouseleave', () => {
        link.style.borderColor = 'rgba(255,255,255,0.1)';
        link.style.transform = '';
        link.style.boxShadow = 'none';
      });
    }
  }, [onEnterRooms]);

  /* ═════════════════════════════════════════════════════════════════
     MAIN ANIMATION SETUP
     ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const root = containerRef.current;
    if (!root || animatedRef.current) return;
    animatedRef.current = true;

    const heroScreen = root.querySelector('[data-name="Hero Screen"]') as HTMLElement;
    if (!heroScreen) return;
    heroScreen.style.backgroundColor = '#08080E';

    /* ── Query skyline layer ────────────────────────────────────────── */
    const layerEl = heroScreen.querySelector('[data-name="Layer_1"]') as HTMLElement;

    /* ── Collect ALL window paths (#40F0AA) and building paths ──────── */
    const windowPaths: SVGPathElement[] = [];
    const buildingPaths: SVGPathElement[] = [];
    if (layerEl) {
      layerEl.querySelectorAll('path').forEach(p => {
        const fill = (p.getAttribute('fill') || '').toUpperCase();
        if (fill.includes('#40F0AA')) {
          windowPaths.push(p as SVGPathElement);
        } else if (fill.includes('#151515')) {
          buildingPaths.push(p as SVGPathElement);
        }
      });
    }

    /* ── Find parallax skyline containers ───────────────────────────── */
    const skylines: HTMLElement[] = [];
    if (layerEl) {
      layerEl.querySelectorAll<HTMLElement>('div[data-name="Group"]').forEach(d => {
        if (d.className.includes('mask-') || d.style.maskImage) {
          skylines.push(d);
        }
      });
    }
    const backSkyline = skylines[0] || null;
    const frontSkyline = skylines[1] || null;

    /* ── Query content elements ─────────────────────────────────────── */
    const children = Array.from(heroScreen.children);
    const logoEl = children.find(c => (c as HTMLElement).dataset?.name === 'Group') as HTMLElement | undefined;
    const pTags = children.filter(c => c.tagName === 'P') as HTMLElement[];
    const nameEl = pTags[0];
    const subtitleEl = pTags[1];
    const descEl = pTags[2];
    const btnEl = heroScreen.querySelector('[data-name="Button"]') as HTMLElement;
    const linkEl = heroScreen.querySelector('[data-name="Link"]') as HTMLElement;
    const containers = heroScreen.querySelectorAll(':scope > [data-name="Container"]');
    const scrollEl = containers[containers.length - 1] as HTMLElement | undefined;

    const contentEls = [logoEl, nameEl, subtitleEl, descEl, btnEl, linkEl, scrollEl].filter(Boolean) as HTMLElement[];

    wireButtons(heroScreen);

    /* ═══════════════════════════════════════════════════════════════
       INITIAL STATE — everything hidden
       ═══════════════════════════════════════════════════════════════ */

    // Skyline: starts below + invisible
    if (layerEl) {
      layerEl.style.transition = 'none';
      layerEl.style.transform = 'translateY(120px)';
      layerEl.style.opacity = '0';
      // Skyline gets HIGH z-index so content emerges from behind it
      layerEl.style.position = 'absolute';
      layerEl.style.zIndex = '10';
    }

    // Window paths: start invisible (use fill-opacity for SVG reliability)
    windowPaths.forEach(p => {
      p.setAttribute('fill-opacity', '0');
    });

    // Content: starts BELOW the skyline and invisible
    // Large translateY pushes content behind the cityscape; low z-index keeps it occluded
    contentEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(250px)';
      el.style.zIndex = '2'; // below skyline z:10
      el.style.transition = 'none';
    });

    const DELAY = 200;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    /* ═══════════════════════════════════════════════════════════════
       PHASE 1a — SKYLINE RISES (buildings emerge from below)
       ═══════════════════════════════════════════════════════════════ */
    timeouts.push(setTimeout(() => {
      if (!layerEl) return;
      animate(layerEl, {
        translateY: [120, 0],
        opacity: [0, 1],
        duration: 900,
        ease: 'out(3)',
      });
    }, DELAY));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 1b — WINDOW POWER-ON CASCADE
       Use CSS transition for reliable SVG fill-opacity animation
       ═══════════════════════════════════════════════════════════════ */
    timeouts.push(setTimeout(() => {
      if (windowPaths.length === 0) return;

      // Stagger by index (rough left-to-right already from DOM order)
      windowPaths.forEach((p, i) => {
        const delay = i * 2; // 2ms per path for ~900 paths = ~1.8s total sweep
        setTimeout(() => {
          p.style.transition = `fill-opacity 400ms ease-out`;
          p.setAttribute('fill-opacity', '1');
        }, delay);
      });
    }, DELAY + 500));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 1c — CONTENT EMERGES FROM BEHIND THE CITYSCAPE
       Content rises up from behind the buildings. The skyline's higher
       z-index occludes the content as it ascends. Once it clears the
       building tops, it becomes visible — the classic "rising through
       the city" parallax reveal.
       ═══════════════════════════════════════════════════════════════ */

    // Logo rises first (emerges from behind buildings)
    timeouts.push(setTimeout(() => {
      if (!logoEl) return;
      animate(logoEl, {
        opacity: [0, 1],
        translateY: [250, 0],
        scale: [0.6, 1],
        rotate: ['-10deg', '0deg'],
        duration: 1200,
        ease: 'out(4)',
      });
    }, DELAY + 1000));

    // Name rises with glitch
    timeouts.push(setTimeout(() => {
      if (!nameEl) return;

      // Animate rise
      animate(nameEl, {
        opacity: [0, 1],
        translateY: [250, 0],
        duration: 1100,
        ease: 'out(4)',
      });

      // Glitch overlay after rise completes
      setTimeout(() => {
        if (!nameEl) return;
        nameEl.style.textShadow = '3px 0 #00EAFF, -3px 0 #40F0AA';
        setTimeout(() => {
          nameEl.style.textShadow = '-2px 0 #40F0AA, 2px 0 #00EAFF';
          nameEl.style.transform = `translateX(3px) skewX(1deg)`;
        }, 50);
        setTimeout(() => {
          nameEl.style.textShadow = '0 0 40px rgba(64,240,170,0.15)';
          nameEl.style.transform = 'translateX(0) skewX(0)';
        }, 130);
      }, 900);
    }, DELAY + 1100));

    // Subtitle + description rise
    timeouts.push(setTimeout(() => {
      [subtitleEl, descEl].filter(Boolean).forEach((el, i) => {
        if (!el) return;
        animate(el, {
          opacity: [0, 1],
          translateY: [250, 0],
          duration: 1000,
          delay: i * 100,
          ease: 'out(4)',
        });
      });
    }, DELAY + 1300));

    // CTAs rise
    timeouts.push(setTimeout(() => {
      [btnEl, linkEl].filter(Boolean).forEach((el, i) => {
        if (!el) return;
        animate(el, {
          opacity: [0, 1],
          translateY: [250, 0],
          duration: 900,
          delay: i * 80,
          ease: 'out(4)',
        });
      });
    }, DELAY + 1600));

    // Scroll indicator fades in last
    timeouts.push(setTimeout(() => {
      if (!scrollEl) return;
      animate(scrollEl, {
        opacity: [0, 1],
        translateY: [100, 0],
        duration: 800,
        ease: 'out(3)',
      });
    }, DELAY + 2000));

    // After content emerges, elevate z-index so it sits ON TOP of skyline
    timeouts.push(setTimeout(() => {
      contentEls.forEach(el => {
        el.style.zIndex = '20';
      });
    }, DELAY + 2800));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 2 — AMBIENT WINDOW FLICKER
       Direct CSS transitions on fill-opacity (not Anime.js) for
       reliable SVG animation.
       ═══════════════════════════════════════════════════════════════ */
    timeouts.push(setTimeout(() => {
      if (windowPaths.length === 0) return;

      flickerTimerRef.current = setInterval(() => {
        const count = Math.floor(windowPaths.length * (0.08 + Math.random() * 0.07));
        for (let n = 0; n < count; n++) {
          const idx = Math.floor(Math.random() * windowPaths.length);
          const path = windowPaths[idx];
          const target = 0.15 + Math.random() * 0.85; // 0.15 → 1.0
          const dur = 600 + Math.random() * 2200;

          path.style.transition = `fill-opacity ${dur}ms ease-in-out`;
          path.setAttribute('fill-opacity', String(target));
        }
      }, 2000);
    }, DELAY + 3200));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 3 — MOUSE PARALLAX (rAF loop)
       ═══════════════════════════════════════════════════════════════ */
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    timeouts.push(setTimeout(() => {
      const loop = () => {
        if (!containerRef.current) return;
        const mx = (mouseRef.current.x - 0.5) * 2;
        const my = (mouseRef.current.y - 0.5) * 2;

        if (backSkyline) {
          backSkyline.style.transform = `translate(${mx * -4}px, ${my * -3}px)`;
        }
        if (frontSkyline) {
          frontSkyline.style.transform = `translate(${mx * -10}px, ${my * -6}px)`;
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }, DELAY + 1500));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 4 — TITLE GLITCH (every 6-10s)
       ═══════════════════════════════════════════════════════════════ */
    timeouts.push(setTimeout(() => {
      const fire = () => {
        if (!nameEl) return;
        nameEl.style.textShadow = '3px 0 #00EAFF, -3px 0 #FF0040';
        nameEl.style.transform = `translateX(${(Math.random() - 0.5) * 6}px) skewX(${(Math.random() - 0.5) * 2}deg)`;

        setTimeout(() => {
          nameEl.style.textShadow = '-2px 0 #40F0AA, 2px 0 #00EAFF';
          nameEl.style.transform = `translateX(${(Math.random() - 0.5) * 3}px)`;
        }, 60);
        setTimeout(() => {
          nameEl.style.textShadow = '0 0 40px rgba(64,240,170,0.15)';
          nameEl.style.transform = 'translateX(0) skewX(0)';
        }, 140);

        glitchTimerRef.current = setTimeout(fire, 6000 + Math.random() * 5000);
      };
      glitchTimerRef.current = setTimeout(fire, 5000 + Math.random() * 3000);
    }, DELAY + 3000));

    /* ═══════════════════════════════════════════════════════════════
       PHASE 5 — SCROLL INDICATOR BOB + CTA GLOW BREATHE
       ═══════════════════════════════════════════════════════════════ */
    if (scrollEl) {
      timeouts.push(setTimeout(() => {
        const bob = () => {
          animate(scrollEl!, {
            translateY: [0, 6, 0],
            duration: 2000,
            ease: 'inOut(2)',
            onComplete: bob,
          });
        };
        bob();
      }, DELAY + 2600));
    }

    if (btnEl) {
      timeouts.push(setTimeout(() => {
        const breathe = () => {
          animate(btnEl, {
            boxShadow: [
              '0px 0px 20px 0px rgba(64,240,170,0.3), 0px 0px 60px 0px rgba(64,240,170,0.1)',
              '0px 0px 30px 0px rgba(64,240,170,0.5), 0px 0px 80px 0px rgba(64,240,170,0.18)',
              '0px 0px 20px 0px rgba(64,240,170,0.3), 0px 0px 60px 0px rgba(64,240,170,0.1)',
            ],
            duration: 3000,
            ease: 'inOut(2)',
            onComplete: breathe,
          });
        };
        breathe();
      }, DELAY + 2600));
    }

    /* ═══════════════════════════════════════════════════════════════
       PHASE 6 — DESCRIPTION TYPEWRITER EFFECT (repeats every 10s)
       ═══════════════════════════════════════════════════════════════ */
    if (descEl) {
      const fullText = descEl.textContent || '';
      // Clear text initially (rise animation handles opacity)
      descEl.textContent = '';
      // Add a blinking cursor pseudo-element via a wrapper span
      descEl.style.borderRight = '2px solid rgba(64,240,170,0.7)';
      descEl.style.paddingRight = '2px';

      const typeText = () => {
        descEl.textContent = '';
        descEl.style.borderRight = '2px solid rgba(64,240,170,0.7)';
        let idx = 0;
        const charInterval = setInterval(() => {
          if (idx < fullText.length) {
            descEl.textContent += fullText.charAt(idx);
            idx++;
          } else {
            clearInterval(charInterval);
            // Remove cursor after typing completes
            setTimeout(() => {
              descEl.style.borderRight = '2px solid transparent';
            }, 600);
          }
        }, 35);
      };

      // First type starts after content emerges
      timeouts.push(setTimeout(typeText, DELAY + 1800));

      // Repeat every 10s
      const repeatTimer = setInterval(typeText, 10000);
      timeouts.push(setTimeout(() => {
        // Store for cleanup
        typewriterRef.current = repeatTimer;
      }, 0));
    }

    /* ── Cleanup ────────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(flickerTimerRef.current);
      clearTimeout(glitchTimerRef.current);
      clearInterval(typewriterRef.current);
      timeouts.forEach(clearTimeout);
    };
  }, [wireButtons]);

  /* ═════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div
      ref={containerRef}
      className="hero-section-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#08080E',
      }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(64,240,170,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64,240,170,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 60%, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 60%, black 10%, transparent 70%)',
        opacity: 0.5,
      }} />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 30% at 50% 35%, rgba(64,240,170,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 50% 80%, rgba(64,240,170,0.06) 0%, transparent 60%)
        `,
      }} />

      {/* Particle constellation network */}
      <HeroParticles />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-50" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        mixBlendMode: 'multiply',
      }} />

      {/* ═══ Figma HeroScreen — scaled to viewport ═══════════════════ */}
      <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: `${DESIGN_W}px`,
          height: `${DESIGN_H}px`,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}>
          <HeroScreenBase />
          {/* Radar pulse rings — inside scaled container for pixel-perfect logo alignment */}
          <HeroRadarPulse />
        </div>
      </div>

      {/* HUD Corners */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <svg className="absolute" style={{ top: 24, left: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 14V2C0 0.9 0.9 0 2 0H14" stroke="#40F0AA" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="2" cy="2" r="1.5" fill="#40F0AA" fillOpacity="0.4" />
        </svg>
        <svg className="absolute" style={{ top: 24, right: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 14V2C40 0.9 39.1 0 38 0H26" stroke="#00EAFF" strokeWidth="1" strokeOpacity="0.2" />
          <circle cx="38" cy="2" r="1.5" fill="#00EAFF" fillOpacity="0.3" />
        </svg>
        <svg className="absolute" style={{ bottom: 24, left: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 26V38C0 39.1 0.9 40 2 40H14" stroke="#00EAFF" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
        <svg className="absolute" style={{ bottom: 24, right: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 26V38C40 39.1 39.1 40 38 40H26" stroke="#40F0AA" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* SYS.ONLINE */}
      <div className="absolute z-40 pointer-events-none" style={{ top: 38, left: 42 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', backgroundColor: '#40F0AA',
            boxShadow: '0 0 8px rgba(64,240,170,0.8)',
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em',
            color: 'rgba(64,240,170,0.5)', textTransform: 'uppercase',
          }}>SYS.ONLINE</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            color: 'rgba(255,255,255,0.15)',
          }}>//</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.22)',
          }}>PORTFOLIO.v7</span>
        </div>
      </div>

      {/* Coordinates */}
      <div className="absolute z-40 pointer-events-none" style={{ top: 38, right: 42 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.1em',
          color: 'rgba(0,234,255,0.3)',
        }}>28.6139°N 77.2090°E</span>
      </div>

      {/* Side accent lines */}
      <div className="absolute pointer-events-none z-40" style={{
        left: 24, top: '20%', bottom: '20%', width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(64,240,170,0.08) 30%, rgba(64,240,170,0.08) 70%, transparent)',
      }} />
      <div className="absolute pointer-events-none z-40" style={{
        right: 24, top: '20%', bottom: '20%', width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(0,234,255,0.06) 30%, rgba(0,234,255,0.06) 70%, transparent)',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-30" style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(8,8,14,0.5) 100%)',
      }} />

      {/* Scrolling data ticker */}
      <HeroDataTicker />
    </div>
  );
}