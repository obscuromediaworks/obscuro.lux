// Shared utilities for Obscuro Mediaworks landing variations.
// IntersectionObserver-based reveal-on-scroll, placeholder media, ticker.

const useReveal = (rootRef) => {
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-revealed', '');
          io.unobserve(e.target);
        }
      });
    }, { root, threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

// Subtly striped placeholder, monospace caption. For imagery we don't have.
// If `src` is provided, renders the image cropped to fit, keeping the caption overlay.
const Placeholder = ({ label, ratio = '16/9', tone = 'dark', style = {}, kind = 'image', src = null, noLabel = false }) => {
  const bg = tone === 'dark' ? '#0f0f0f' : '#f5f4ef';
  const stripe = tone === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)';
  const text = tone === 'dark' ? 'rgba(245,244,239,0.85)' : 'rgba(10,10,10,0.85)';
  const border = tone === 'dark' ? 'rgba(245,244,239,0.10)' : 'rgba(10,10,10,0.10)';
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: ratio,
      background: src
        ? '#0a0a0a'
        : `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
      border: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      ...style,
    }}>
      {src && (
        <img
          src={src}
          alt={label}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'saturate(0.92) contrast(1.02)',
          }}
        />
      )}
      {!noLabel && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          fontFamily: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: text, padding: '4px 8px',
          background: tone === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 1,
        }}>
          {kind === 'video' ? '▶ ' : '◐ '}{label}
        </div>
      )}
    </div>
  );
};

// Grain overlay for cinematic feel — pure CSS, Wix-friendly.
const Grain = ({ opacity = 0.06 }) => (
  <div aria-hidden style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', opacity,
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
    mixBlendMode: 'overlay',
  }} />
);

// VHS overlay — wrap any element to give it a 1980s tape look.
// Scanlines + chromatic aberration + random glitch bands + tracking
// drift + tape grain + corner timecode. Pure CSS/SVG, Wix-friendly.
let __vhsId = 0;
const VHSFrame = ({ children, label = 'PLAY', timecode = '00:12:34:21', intensity = 1, showTimecode = true, style = {} }) => {
  const id = React.useMemo(() => `vhs-${++__vhsId}`, []);
  const op = intensity; // 0..1
  return (
    <div className={`vhs ${id}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <style>{`
        .${id}{transform:translateZ(0)}
        .${id} > .vhs-body{position:absolute;inset:0;animation:${id}-wobble 7s steps(60) infinite}
        .${id} > .vhs-body::before,
        .${id} > .vhs-body::after{content:'';position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;}
        .${id} > .vhs-body::before{box-shadow:inset 0 0 0 9999px transparent;background:linear-gradient(90deg,rgba(255,0,40,${0.18*op}) 0%,transparent 6%);transform:translateX(-1.5px);}
        .${id} > .vhs-body::after{background:linear-gradient(90deg,transparent 94%,rgba(0,180,255,${0.18*op}) 100%);transform:translateX(1.5px);}
        .${id} .vhs-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,${0.18*op}) 0px,rgba(0,0,0,${0.18*op}) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;}
        .${id} .vhs-bright{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,${0.025*op}) 0px,rgba(255,255,255,${0.025*op}) 1px,transparent 1px,transparent 3px);mix-blend-mode:screen;}
        .${id} .vhs-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,${0.55*op}) 100%);}
        .${id} .vhs-track{position:absolute;left:0;right:0;height:14px;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,${0.28*op}) 30%,rgba(255,255,255,${0.10*op}) 70%,transparent 100%);mix-blend-mode:screen;filter:blur(0.5px);animation:${id}-track 4.2s linear infinite;}
        .${id} .vhs-track2{position:absolute;left:0;right:0;height:8px;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,${0.18*op}) 50%,transparent 100%);mix-blend-mode:screen;filter:blur(0.4px);animation:${id}-track2 6.8s linear infinite;animation-delay:1.7s;}
        .${id} .vhs-track3{position:absolute;left:0;right:0;height:22px;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,${0.12*op}) 40%,rgba(0,0,0,${0.20*op}) 60%,transparent 100%);mix-blend-mode:overlay;filter:blur(1px);animation:${id}-track3 9.4s linear infinite;animation-delay:0.4s;}
        .${id} .vhs-glitch{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;animation:${id}-glitch 8.3s steps(1) infinite;}
        .${id} .vhs-glitch::before{content:'';position:absolute;left:0;right:0;height:18px;top:30%;background:rgba(255,40,90,${0.45*op});mix-blend-mode:screen;transform:translateX(0);animation:${id}-tear 8.3s steps(1) infinite;}
        .${id} .vhs-noise{position:absolute;inset:0;pointer-events:none;opacity:${0.18*op};mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");animation:${id}-noise .12s steps(1) infinite;}
        .${id} .vhs-stamp{position:absolute;font-family:"VT323",ui-monospace,"JetBrains Mono",monospace;color:#ffffff;text-shadow:0 0 6px rgba(255,255,255,.5),2px 0 rgba(255,0,40,.6),-2px 0 rgba(0,180,255,.6);letter-spacing:.06em;pointer-events:none;}
        .${id} .vhs-stamp.tl{top:18px;left:18px;font-size:22px;}
        .${id} .vhs-stamp.tr{top:18px;right:18px;font-size:18px;}
        .${id} .vhs-stamp.br{bottom:18px;right:18px;font-size:18px;}
        .${id} .vhs-rec{display:inline-flex;align-items:center;gap:8px;}
        .${id} .vhs-rec::before{content:'';width:12px;height:12px;border-radius:50%;background:#ff1f3e;box-shadow:0 0 10px #ff1f3e;animation:${id}-blink 1s steps(2) infinite;}
        @keyframes ${id}-blink{50%{opacity:0}}
        @keyframes ${id}-wobble{0%,2%,4%,100%{transform:translateX(0)}1%{transform:translateX(-1px)}3%{transform:translateX(1px)}50%{transform:translateX(0.5px)}52%{transform:translateX(-0.5px)}}
        @keyframes ${id}-track{0%{top:-20px;opacity:0}3%{opacity:.9}45%{opacity:.55}90%{opacity:.7}100%{top:110%;opacity:0}}
        @keyframes ${id}-track2{0%{top:110%;opacity:0}5%{opacity:.6}55%{opacity:.4}95%{opacity:.5}100%{top:-20px;opacity:0}}
        @keyframes ${id}-track3{0%{top:-30px;opacity:0}8%{opacity:.7}50%{opacity:.45}92%{opacity:.5}100%{top:115%;opacity:0}}
        @keyframes ${id}-glitch{0%,92%,100%{opacity:0;transform:translate(0)}93%{opacity:1;transform:translate(-3px,0)}94%{opacity:1;transform:translate(3px,1px)}95%{opacity:0;transform:translate(0)}}
        @keyframes ${id}-tear{0%,92%,100%{opacity:0;top:30%;transform:translateX(0)}93%{opacity:1;top:30%;transform:translateX(-12px)}94%{opacity:1;top:55%;transform:translateX(20px)}95%{opacity:0;top:55%}}
        @keyframes ${id}-noise{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-1%)}75%{transform:translate(-1%,1%)}100%{transform:translate(0,0)}}
      `}</style>
      <div className="vhs-body">{children}</div>
      <div className="vhs-bright" />
      <div className="vhs-scan" />
      <div className="vhs-noise" />
      <div className="vhs-glitch" />
      <div className="vhs-track" />
      <div className="vhs-track2" />
      <div className="vhs-track3" />
      <div className="vhs-vignette" />
      {showTimecode && (
        <React.Fragment>
          <div className="vhs-stamp tl"><span className="vhs-rec" />{label}</div>
          <div className="vhs-stamp tr">SP&nbsp;&nbsp;LP</div>
          <div className="vhs-stamp br">{timecode}</div>
        </React.Fragment>
      )}
    </div>
  );
};
// Brand mark — direction 03 (Tipográfico mono / "[ obscuro ]")
// Reusable across navs, footers and contexts. Variants control scale + sub-brand.
const LogoMark = ({
  variant = 'primary',   // 'primary' | 'games' | 'compact'
  size = 'nav',          // 'nav' | 'hero' | 'footer' | 'tiny'
  tone = 'light',        // 'light' | 'mute'
  withTag = true,        // show "mediaworks" tag under primary mark
  align = 'left',        // 'left' | 'center' — only applies to primary stacked layout
}) => {
  const fontSize = { hero: 56, nav: 28, footer: 11, tiny: 10 }[size] || 18;
  const tagSize = { hero: 14, nav: 11, footer: 8, tiny: 8 }[size] || 9;
  const gap = { hero: 14, nav: 7, footer: 3, tiny: 3 }[size] || 6;
  const tagTrack = { hero: '0.42em', nav: '0.32em', footer: '0.42em', tiny: '0.42em' }[size] || '0.42em';
  const color = tone === 'mute' ? 'rgba(245,244,239,0.7)' : '#f5f4ef';
  const bracket = 'rgba(245,244,239,0.4)';

  if (variant === 'compact') {
    return (
      <span style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 500,
        fontSize, textTransform: 'lowercase', letterSpacing: '0.06em',
        color,
        display: 'inline-flex', alignItems: 'baseline', gap: 4,
      }}>
        <span style={{ color: bracket }}>[</span>
        <span>obscuro_mediaworks</span>
        <span style={{ color: bracket }}>]</span>
      </span>
    );
  }

  if (variant === 'games') {
    return (
      <span style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 500,
        fontSize, textTransform: 'lowercase', letterSpacing: '0.06em',
        color,
        display: 'inline-flex', alignItems: 'baseline', gap: 5,
      }}>
        <span style={{ color: bracket }}>[</span>
        <span>obscuro</span>
        <span style={{ color: bracket }}>/</span>
        <span style={{ color: '#c9a96e' }}>gamecrafting</span>
        <span style={{ color: bracket }}>]</span>
      </span>
    );
  }

  // primary
  return (
    <span style={{
      display: 'inline-flex', flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      gap,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      lineHeight: 1,
    }}>
      <span style={{
        fontWeight: 500,
        fontSize, textTransform: 'lowercase', letterSpacing: '0.06em',
        color,
        display: 'inline-flex', alignItems: 'baseline', gap: 5,
      }}>
        <span style={{ color: bracket }}>[</span>
        <span>obscuro</span>
        <span style={{ color: bracket }}>]</span>
      </span>
      {withTag && (
        <span style={{
          fontSize: tagSize,
          letterSpacing: tagTrack,
          textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.55)',
        }}>
          mediaworks
        </span>
      )}
    </span>
  );
};

const STUDIO = {
  name: 'Obscuro Mediaworks',
  short: 'Obscuro',
  tagline: 'Identidad. Web. Game design.',
  manifesto: 'Estudio multidisciplinario de diseño y desarrollo. Construimos marcas, sitios y videojuegos para proyectos que se toman en serio su forma.',
  city: 'Buenos Aires · 34.6°S',
  email: 'hola@obscuromediaworks.com.ar',
  year: '2026',
};

const SERVICES = [
  { num: '01', title: 'Branding', desc: 'Identidad visual, sistemas tipográficos, naming, manuales de marca y dirección de arte.', items: ['Identidad', 'Naming', 'Editorial', 'Empaque'] },
  { num: '02', title: 'Diseño Web', desc: 'Sitios y productos digitales diseñados a medida. Diseño UI/UX y desarrollo en plataformas no-code y custom.', items: ['UI/UX', 'No-code', 'E-commerce', 'CMS'] },
  { num: '03', title: 'Videojuegos', desc: 'Nuestra división Obscuro Gamecrafting. Audio, diseño de sonido, implementación con Wwise y co-desarrollo para estudios indie.', items: ['Audio', 'Wwise', 'Sound design', 'Co-desarrollo'], sub: true },
];

// Games released — three real titles on itch.io.
// "studio" credits the publishing brand per game (collaboration model).
const GAMES = [
  {
    slug: 'bloodline-ep1',
    title: 'Bloodline EP 1',
    sub: 'Where is Sarah Lake?',
    genre: 'Horror psicológico',
    studio: 'Obscuro',
    year: '2024',
    desc: 'Ethan desenmaraña verdades oscuras sobre su don, su pasado y un culto ancestral.',
    url: 'https://obscuro.itch.io/bloodline-ep1',
    role: 'Audio · Wwise · producción',
    cover: 'https://img.itch.zone/aW1nLzE4ODYzMjQxLnBuZw==/original/nnRgTx.png',
    coverWide: 'https://img.itch.zone/aW1nLzE4ODYzMzQxLnBuZw==/original/jyWUjd.png',
  },
  {
    slug: 'bonys-quest',
    title: 'Bony\u2019s Quest',
    sub: 'Serendell',
    genre: 'Plataformero',
    studio: 'Sad Mushroom Games',
    year: '2024',
    desc: 'Explorá las tierras misteriosas de Serendell y volvete el héroe que siempre quisiste ser.',
    url: 'https://sadmushroomgames.itch.io/bonys-quest',
    role: 'Audio · Wwise',
    cover: 'https://img.itch.zone/aW1nLzE4MDI3MTUzLnBuZw==/original/Yqvjbi.png',
    coverWide: 'https://img.itch.zone/aW1nLzE4MTkyNzI2LnBuZw==/original/SrG5%2FP.png',
  },
  {
    slug: 'labyrinth-encounters',
    title: 'Labyrinth Encounters',
    sub: 'El primer laberinto',
    genre: 'Experiencia psicológica',
    studio: 'Fox Fury',
    year: '2024',
    desc: 'Una experiencia psicológica en primera persona. El predecesor de Labyrinth Encounters 2.',
    url: 'https://foxfurystudio.itch.io/labyrinth-encounters',
    role: 'Audio · Wwise',
    cover: 'https://img.itch.zone/aW1nLzExODI5MzAwLnBuZw==/original/hSzEVV.png',
    coverWide: 'https://img.itch.zone/aW1nLzExODMwNjQwLnBuZw==/original/i0bn8Z.png',
  },
];

const PROJECTS = GAMES; // Backwards compat alias.

// Looping horizontal ticker. Duplicates content so the loop is seamless.
// `duration` in seconds for one full pass.
const Marquee = ({ children, duration = 40, direction = 'left', style = {}, pauseOnHover = false }) => {
  const id = React.useMemo(() => `marq-${Math.random().toString(36).slice(2, 8)}`, []);
  const dir = direction === 'right' ? 'reverse' : 'normal';
  return (
    <div className={`marq ${id}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      <style>{`
        .${id} .marq-track{display:inline-flex;animation:${id}-scroll ${duration}s linear infinite ${dir};will-change:transform}
        ${pauseOnHover ? `.${id}:hover .marq-track{animation-play-state:paused}` : ''}
        .${id} .marq-copy{display:inline-block;padding-right:0}
        @keyframes ${id}-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>
      <div className="marq-track">
        <div className="marq-copy">{children}</div>
        <div className="marq-copy" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
};

// Background video — drops behind any content. Mute, loop, autoplay, playsInline.
// `src` may be a string or an array of {src, type} for fallback sources.
const BgVideo = ({ src, filter = 'saturate(0.85) contrast(1.05) blur(4px)', poster = null, style = {} }) => {
  const sources = Array.isArray(src) ? src : [{ src, type: '' }];
  return (
    <video
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        filter,
        ...style,
      }}
    >
      {sources.map((s, i) => (
        <source key={i} src={s.src} type={s.type || undefined} />
      ))}
    </video>
  );
};

Object.assign(window, { useReveal, Placeholder, Grain, VHSFrame, LogoMark, Marquee, BgVideo, STUDIO, SERVICES, GAMES, PROJECTS });
