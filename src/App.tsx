import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/home';
import CostOfAttention from '@/pages/cost-of-attention';
import Cpq from '@/pages/cpq';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/cost-of-attention" element={<CostOfAttention />} />
        <Route path="/work/cpq" element={<Cpq />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
