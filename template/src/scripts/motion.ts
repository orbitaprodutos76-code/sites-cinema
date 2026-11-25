import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scroll suave (desligado com reduced motion) ----
if (!reduz) {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Hero: linhas sobem da máscara
  gsap.from('[data-hero-line] > span', {
    yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.2,
  });
  gsap.from('[data-hero-fade]', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.9, stagger: 0.1 });

  // Revelar ao entrar na tela
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 60, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Parallax
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const forca = Number(el.dataset.parallax || 15);
    gsap.fromTo(el, { yPercent: -forca }, {
      yPercent: forca, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
});

// Scroll horizontal fixado: só em telas largas
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll<HTMLElement>('[data-horizontal]').forEach((sec) => {
    const trilho = sec.querySelector<HTMLElement>('[data-track]');
    if (!trilho) return;
    gsap.to(trilho, {
      x: () => -(trilho.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: sec, pin: true, scrub: 1, invalidateOnRefresh: true,
        end: () => `+=${trilho.scrollWidth - window.innerWidth}`,
      },
    });
  });
});
