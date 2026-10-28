import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/home';
import CaseStudyPage from '@/pages/case-study';
import { coa } from '@/lib/coa';
import { cpq } from '@/lib/cpq';
import Build from '@/pages/build';

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
        <Route path="/work/cost-of-attention" element={<CaseStudyPage study={coa} />} />
        <Route path="/work/cpq" element={<CaseStudyPage study={cpq} />} />
        <Route path="/builds/:slug" element={<Build />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
