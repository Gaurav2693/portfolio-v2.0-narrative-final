import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import App from '@/App';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import './index.css';

// VITE_ROUTER=hash is only for static previews where the host can't rewrite routes.
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

// Vercel Web Analytics + Speed Insights; no-ops outside Vercel (static previews, localhost).
if (import.meta.env.PROD && import.meta.env.VITE_ROUTER !== 'hash') { inject(); injectSpeedInsights(); }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </StrictMode>,
);
