import { createBrowserRouter } from "react-router";

/* ═══════════════════════════════════════════════════════════════════════
   ROUTE-LEVEL CODE SPLITTING  —  v4 (production-ready)
   ────────────────────────────────────────────────────
   All loading is handled by the boot sequence in root-layout.
   Routes only define lazy imports and error boundaries.
   Test/dev routes are grouped under /test with auth gate.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Minimal hydration fallback (blank dark screen, no loaders) ────── */
function HydrateFallback() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#08080E", zIndex: 9999 }} />
  );
}

/* ── Per-route error boundary ──────────────────────────────────────── */
function RouteError() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        color: "#ccc",
        fontFamily: "system-ui",
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#9888;</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Page failed to load</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          This page&apos;s module couldn&apos;t be fetched. Try refreshing, or go back.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 20px",
            background: "#00A87C",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            marginRight: 8,
          }}
        >
          Refresh
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "8px 20px",
            background: "#222",
            color: "#ccc",
            border: "1px solid #333",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROUTE MAP — The Building
   ────────────────────────
   /                     → Command Center (5-room hub)
   /cpq-case-study       → CPQ Case Study (standalone FAANG narrative)
   /plotsync-case-study   → PlotSync AI Case Study
   /exiro-case-study      → Exiro AI UX Audit
   /prototypes            → Engineering & Prototyping Showcase
   /how-i-build           → How I Build Things Now
   /game/*                → INERTIA side-scroller
   /test/*                → Auth-gated dev/test tools (passcode: 2693)
   ═══════════════════════════════════════════════════════════════════════ */

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: () => import("@/app/layouts/root-layout").then(m => ({ Component: m.default })),
    HydrateFallback,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: () => import("@/app/pages/command-center").then(m => ({ Component: m.default })),
      },
      {
        path: "cpq-case-study",
        lazy: () => import("@/app/pages/cpq-case-study").then(m => ({ Component: m.default })),
      },
      {
        path: "plotsync-case-study",
        lazy: () => import("@/app/pages/plotsync-case-study").then(m => ({ Component: m.default })),
      },
      {
        path: "exiro-case-study",
        lazy: () => import("@/app/pages/exiro-case-study").then(m => ({ Component: m.default })),
      },
      {
        path: "prototypes",
        lazy: () => import("@/app/pages/prototypes").then(m => ({ Component: m.default })),
      },
      {
        path: "how-i-build",
        lazy: () => import("@/app/pages/how-i-build").then(m => ({ Component: m.default })),
      },
      {
        path: "lite",
        lazy: () => import("@/app/pages/lite/lite-home").then(m => ({ Component: m.default })),
      },

      /* ── Auth-gated test/dev routes ─────────────────────────────── */
      {
        path: "test",
        lazy: () => import("@/app/pages/test-routes").then(m => ({ Component: m.default })),
        children: [
          {
            path: "loading-animation",
            lazy: () => import("@/app/pages/loading-animation").then(m => ({ Component: m.default })),
          },
          {
            path: "sound-tuner",
            lazy: () => import("@/app/pages/chair-sound-tuner").then(m => ({ Component: m.default })),
          },
          {
            path: "studio-assembly",
            lazy: () => import("@/app/pages/studio-assembly-poc").then(m => ({ Component: m.default })),
          },
          {
            path: "rocket-playground",
            lazy: () => import("@/app/pages/rocket-playground").then(m => ({ Component: m.default })),
          },
          {
            path: "bike-playground",
            lazy: () => import("@/app/pages/bike-playground").then(m => ({ Component: m.default })),
          },
          {
            path: "access",
            lazy: () => import("@/app/pages/access-screen").then(m => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
  {
    path: "/game",
    lazy: () => import("@/app/layouts/game-layout").then(m => ({ Component: m.default })),
    HydrateFallback,
    errorElement: <RouteError />,
    children: [
      {
        path: "canvas",
        lazy: () => import("@/app/pages/game/game-canvas").then(m => ({ Component: m.default })),
      },
      {
        path: "environment-layers",
        lazy: () => import("@/app/pages/game/environment-layers").then(m => ({ Component: m.default })),
      },
      {
        path: "ui-hud",
        lazy: () => import("@/app/pages/game/ui-hud").then(m => ({ Component: m.default })),
      },
      {
        path: "character",
        lazy: () => import("@/app/pages/game/character").then(m => ({ Component: m.default })),
      },
      {
        path: "motion-states",
        lazy: () => import("@/app/pages/game/motion-states").then(m => ({ Component: m.default })),
      },
      {
        path: "color-signal-system",
        lazy: () => import("@/app/pages/game/color-signal-system").then(m => ({ Component: m.default })),
      },
      {
        path: "notes-rules",
        lazy: () => import("@/app/pages/game/notes-rules").then(m => ({ Component: m.default })),
      },
      {
        path: "play",
        lazy: () => import("@/app/pages/game/play").then(m => ({ Component: m.default })),
      },
    ],
  },
]);
