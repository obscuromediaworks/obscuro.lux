// LUX — Shared content + small utilities for the three variations.
// LUX is a sub-brand of Obscuro. Scope: identidad + diseño digital.
// Tone: sobrio, frío, casi institucional. Pure typography, no imagery.

const LUX = {
  name: 'LUX',
  parent: 'Obscuro',
  parentNote: 'Una práctica de Obscuro',
  tagline: 'Identidad y diseño digital.',
  city: 'Buenos Aires',
  email: 'lux@obscuromediaworks.com.ar',
  year: 'MMXXVI',
  founded: 'MMXIX',
};

const LUX_SERVICES = [
  {
    num: '01',
    title: 'Identidad',
    desc: 'Sistemas visuales completos. Logotipo, paleta, tipografía, normas de uso y aplicaciones.',
    items: ['Identidad visual', 'Naming', 'Manual de marca', 'Aplicaciones', 'Editorial'],
  },
  {
    num: '02',
    title: 'Diseño digital',
    desc: 'Sitios web y productos digitales. Diseño de interfaz, sistemas de componentes e implementación.',
    items: ['Web', 'UI / UX', 'Sistemas', 'Implementación'],
  },
];

const LUX_METHOD = [
  { num: 'I', title: 'Investigación', desc: 'Lectura del cliente, su contexto, sus restricciones. No empezamos a dibujar antes.' },
  { num: 'II', title: 'Diseño', desc: 'Iteración cerrada en revisiones breves y frecuentes. Decisiones documentadas.' },
  { num: 'III', title: 'Documentación', desc: 'Entregamos sistemas, no archivos sueltos. Todo lo que hacemos queda explicado.' },
];

const LUX_PRINCIPLES = [
  'La precisión es una forma de respeto.',
  'Documentar es parte del oficio.',
  'Trabajamos despacio, en una pieza a la vez.',
  'Restringir el campo es la decisión más útil.',
];

const LUX_FACTS = [
  ['07', 'años'],
  ['—', 'una pieza a la vez'],
  ['02', 'disciplinas'],
  ['01', 'estudio'],
];

// IntersectionObserver-based reveal — copied from /shared so LUX variations
// can stand alone without depending on the Obscuro shared module loading first.
const useLuxReveal = (rootRef) => {
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-lux-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-lux-revealed', '');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

Object.assign(window, { LUX, LUX_SERVICES, LUX_METHOD, LUX_PRINCIPLES, LUX_FACTS, useLuxReveal });
