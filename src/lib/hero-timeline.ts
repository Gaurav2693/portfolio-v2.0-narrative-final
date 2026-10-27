import { gsap } from 'gsap';

export function createHeroTimeline(root: HTMLElement, onComplete: () => void) {
  const find = (name: string) => root.querySelector<HTMLElement>(`[data-hero="${name}"]`);
  const actor = find('actor');
  const poses = Array.from(root.querySelectorAll<HTMLElement>('[data-hero="pose"]'));
  const thought = find('thought');
  const mess = find('mess');
  const order = find('order');
  const box = find('box');
  const impact = find('impact');
  const question = find('question');
  const caption = find('caption');
  const outline = find('outline');
  const timeline = gsap.timeline({ paused: true });
  const frame = (index: number, at: number) => {
    timeline.set(poses, { opacity: 0 }, at).set(poses[index], { opacity: 1 }, at);
  };
  const say = (text: string, at: number) => timeline.set(caption, { textContent: text }, at);

  timeline.set([thought, box, impact, question, order], { autoAlpha: 0, x: 0, y: 0, rotation: 0, scale: 1 }, 0)
    .set(actor, { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 90%' }, 0)
    .set(mess, { autoAlpha: 1 }, 0)
    .set(outline, { strokeDasharray: 1, strokeDashoffset: 1 }, 0);
  timeline.to(outline, { strokeDashoffset: 0, duration: 0.65, ease: 'steps(8)' }, 1.05);
  frame(0, 0);
  say('Take a moment. Have a look around.', 0);
  timeline.to(actor, { y: -2, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.25);
  frame(1, 0.45);
  frame(2, 0.58);
  frame(0, 0.78);
  frame(3, 1.0);
  timeline.fromTo(thought, { y: 18, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.6)' }, 1.05);
  timeline.to(question, { autoAlpha: 1, rotation: -12, duration: 0.15 }, 1.35);
  say('Okay… who connected all of this?', 1.35);
  frame(3, 1.85);
  frame(4, 1.95);
  frame(3, 2.15);
  frame(4, 2.25);
  timeline.to(question, { autoAlpha: 0, duration: 0.1 }, 2.1)
    .to(thought, { rotation: 3, duration: 0.12, yoyo: true, repeat: 3, ease: 'steps(1)' }, 2.3)
    .set(box, { autoAlpha: 1, left: '57%', top: '22%', x: 0, y: 0, rotation: 8 }, 3.05)
    .to(box, { x: -56, y: 42, rotation: -28, duration: 0.4, ease: 'power2.in' }, 3.05);
  frame(5, 3.45);
  timeline.to(actor, { rotation: -4, duration: 0.09, yoyo: true, repeat: 1 }, 3.45)
    .to(box, { x: 84, y: 123, rotation: 20, duration: 0.35, ease: 'power1.out' }, 3.5);
  say('Right. We’re doing this my way.', 3.7);
  frame(6, 4.15);
  frame(7, 4.4);
  frame(8, 4.52);
  timeline.to(actor, { x: -10, y: 4, rotation: -7, duration: 0.25, ease: 'steps(3)' }, 4.25);
  frame(9, 4.62);
  timeline.to(actor, { x: 14, y: -9, rotation: 4, duration: 0.14, ease: 'steps(2)' }, 4.6)
    .set(impact, { autoAlpha: 1, scale: 0.6, rotation: -14 }, 4.7)
    .to(impact, { scale: 1.15, rotation: 8, duration: 0.2, ease: 'steps(3)' }, 4.7)
    .to(box, { x: 160, y: 28, rotation: 190, autoAlpha: 0, duration: 0.22 }, 4.7)
    .to(mess, { autoAlpha: 0, duration: 0.08 }, 4.72)
    .fromTo(order, { scale: 0.9 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2)' }, 4.8)
    .to(thought, { rotation: 0, duration: 0.15 }, 4.8)
    .to(impact, { autoAlpha: 0, duration: 0.1 }, 5.05);
  frame(8, 4.84);
  frame(7, 4.94);
  frame(10, 5.05);
  timeline.to(actor, { x: 0, y: 5, rotation: 0, duration: 0.2 }, 5.05);
  say('A little chaos. A lot more clarity.', 5.3);
  frame(11, 5.5);
  frame(2, 5.85);
  timeline.to(actor, { y: 0, duration: 0.25 }, 5.8);
  timeline.to(thought, { autoAlpha: 0, y: -5, duration: 0.4 }, 6.0);
  frame(12, 6.2);
  say('Just one little thing…', 6.2);
  timeline.set(box, { autoAlpha: 1, left: '88%', top: '43%', x: 0, y: 0, rotation: -12 }, 6.2);
  frame(13, 6.75);
  frame(14, 7.0);
  timeline.to(box, { x: 8, rotation: 0, duration: 0.25, ease: 'steps(3)' }, 7.1);
  frame(13, 7.35);
  frame(12, 7.65);
  frame(0, 7.95);
  say('There. That feels better.', 7.7);
  timeline.to(box, { autoAlpha: 0, duration: 0.5 }, 8.4);
  say('Two case studies below. Start there.', 8.85);
  timeline.call(onComplete, [], 9.2);
  const idle = gsap.timeline({ repeat: -1 });
  const idleFrame = (index: number, at: number) => idle.set(poses, { opacity: 0 }, at).set(poses[index], { opacity: 1 }, at);
  idleFrame(0, 0);
  idleFrame(2, 0.32);
  idleFrame(0, 0.64);
  idleFrame(2, 1.0);
  idleFrame(0, 1.3);
  idleFrame(1, 3.7);
  idleFrame(2, 3.84);
  idleFrame(0, 4.05);
  idle.to({}, { duration: 1.95 });
  timeline.add(idle, 9.2);
  timeline.shiftChildren(2.8);
  frame(0, 0);
  say('Take a moment. Have a look around.', 0);
  frame(1, 1.4);
  frame(2, 1.54);
  frame(0, 1.8);
  return timeline;
}
