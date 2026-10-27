import { CpqCaseStudy } from '@/components/cpq-case-study';
import { site } from '@/lib/site';

export default function Cpq() {
  if (typeof document !== 'undefined') document.title = `Brightquote CPQ — ${site.name}`;
  return <CpqCaseStudy />;
}
