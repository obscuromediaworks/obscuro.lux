// LUX — Variation B · "Etéreo / Lumínico"
// Pure white with soft warm light bleeding from corners. Instrument Serif italic.
// Lots of air, single statements floating in negative space.

const bStyle = {
  page: {
    width: '100%',
    background: '#ffffff',
    backgroundImage: [
      'radial-gradient(ellipse 900px 600px at 95% -10%, #f5efe2 0%, transparent 55%)',
      'radial-gradient(ellipse 1100px 700px at 0% 110%, #f1e9da 0%, transparent 50%)',
      'radial-gradient(ellipse 800px 500px at 50% 50%, #fbf7ee 0%, transparent 60%)',
    ].join(', '),
    color: '#0e0e0e',
    fontFamily: '"Geist", "Helvetica Neue", Helvetica, sans-serif',
    fontWeight: 300,
    position: 'relative',
  },
  serif: {
    fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
    fontWeight: 400,
    fontStyle: 'italic',
  },
  caps: {
    fontFamily: '"Geist", sans-serif',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.42em',
    fontSize: 10,
  },
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  muted: '#9b9385',
  hairline: 'rgba(14,14,14,0.10)',
};

const BNav = () => (
  <nav style={{
    padding: '32px 80px',
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    position: 'relative', zIndex: 2,
  }}>
    <span style={{
      ...bStyle.serif,
      fontSize: 36, lineHeight: 1,
      display: 'inline-flex', alignItems: 'baseline', gap: 10,
    }}>
      <span>lux</span>
      <span style={{ ...bStyle.caps, color: bStyle.muted, transform: 'translateY(-4px)', display:'inline-block' }}>· obscuro</span>
    </span>
    <div style={{ display: 'flex', gap: 44, ...bStyle.caps, color: '#3a342b' }}>
      <a href="#manifiesto" style={{ color:'inherit', textDecoration:'none' }}>Manifiesto</a>
      <a href="#servicios" style={{ color:'inherit', textDecoration:'none' }}>Servicios</a>
      <a href="#metodo" style={{ color:'inherit', textDecoration:'none' }}>Método</a>
      <a href="#estudio" style={{ color:'inherit', textDecoration:'none' }}>Estudio</a>
      <a href="#contacto" style={{ color:'inherit', textDecoration:'none' }}>Contacto</a>
    </div>
  </nav>
);

const BHero = () => (
  <section style={{ padding: '180px 80px 220px', position: 'relative' }}>
    <div data-lux-reveal style={{ ...bStyle.caps, color: bStyle.muted, marginBottom: 80 }}>
      Práctica de diseño &nbsp; · &nbsp; fundada en {LUX.founded}
    </div>
    <h1 data-lux-reveal style={{
      ...bStyle.serif,
      fontSize: 260, lineHeight: 0.88, letterSpacing: '-0.04em',
      margin: 0,
      maxWidth: 1280,
    }}>
      Identidad.<br />
      Diseño <span style={{ color: bStyle.muted }}>digital.</span>
    </h1>
    <div data-lux-reveal style={{
      marginTop: 96, marginLeft: 'auto', maxWidth: 540,
      ...bStyle.serif, fontSize: 28, lineHeight: 1.4, color: '#3a342b',
    }}>
      Trabajamos con marcas que se toman en serio su forma.
      Una pieza a la vez, despacio, con todo documentado.
    </div>
  </section>
);

const BManifesto = () => (
  <section id="manifiesto" style={{ padding: '160px 80px 200px' }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...bStyle.caps, color: bStyle.muted, marginBottom: 120 }}>
      <span>(i) &nbsp; Manifiesto</span>
      <span>Cuatro principios</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>
      {LUX_PRINCIPLES.map((p, i) => (
        <div data-lux-reveal key={p} style={{
          display: 'grid', gridTemplateColumns: '80px 1fr', gap: 48,
          alignItems: 'baseline',
          paddingLeft: i % 2 === 0 ? 0 : 200,
        }}>
          <span style={{ ...bStyle.serif, fontSize: 56, color: bStyle.muted, lineHeight: 1 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <p style={{
            ...bStyle.serif, fontSize: 64, lineHeight: 1.15,
            margin: 0, maxWidth: 880, letterSpacing: '-0.02em',
          }}>
            {p}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const BServices = () => (
  <section id="servicios" style={{ padding: '160px 80px 200px' }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...bStyle.caps, color: bStyle.muted, marginBottom: 120 }}>
      <span>(ii) &nbsp; Disciplinas</span>
      <span>Dos prácticas</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 140 }}>
      {LUX_SERVICES.map((s, i) => (
        <div data-lux-reveal key={s.num} style={{
          display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 80,
          alignItems: 'start',
          paddingLeft: i === 1 ? 200 : 0,
        }}>
          <div>
            <div style={{ ...bStyle.caps, color: bStyle.muted, marginBottom: 28 }}>
              {s.num} &nbsp; · &nbsp; práctica
            </div>
            <h3 style={{ ...bStyle.serif, fontSize: 140, lineHeight: 0.95, letterSpacing: '-0.03em', margin: 0 }}>
              {s.title}
            </h3>
          </div>
          <div style={{ paddingTop: 48 }}>
            <p style={{ ...bStyle.serif, fontStyle: 'normal', fontFamily: '"Geist", sans-serif', fontWeight: 300, fontSize: 22, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 40px', maxWidth: 540 }}>
              {s.desc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...bStyle.caps, color: bStyle.muted, fontSize: 9 }}>
              {s.items.map((it, j) => (
                <React.Fragment key={it}>
                  <span>{it}</span>
                  {j < s.items.length - 1 && <span style={{ opacity: 0.4 }}>—</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const BMethod = () => (
  <section id="metodo" style={{ padding: '160px 80px 200px' }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...bStyle.caps, color: bStyle.muted, marginBottom: 120 }}>
      <span>(iii) &nbsp; Método</span>
      <span>Tres fases</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
      {LUX_METHOD.map((m, i) => (
        <div data-lux-reveal key={m.num}>
          <div style={{ ...bStyle.serif, fontSize: 200, lineHeight: 0.9, color: bStyle.muted, marginBottom: 32 }}>
            {m.num}.
          </div>
          <h4 style={{ ...bStyle.serif, fontSize: 56, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            {m.title}
          </h4>
          <p style={{ fontFamily: '"Geist", sans-serif', fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: '#1a1a1a', margin: 0, maxWidth: 320 }}>
            {m.desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const BStudio = () => (
  <section id="estudio" style={{ padding: '180px 80px 200px' }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...bStyle.caps, color: bStyle.muted, marginBottom: 120 }}>
      <span>(iv) &nbsp; Estudio</span>
      <span>Buenos Aires &nbsp; · &nbsp; 34.6°S</span>
    </div>
    <p data-lux-reveal style={{
      ...bStyle.serif, fontSize: 88, lineHeight: 1.15, letterSpacing: '-0.025em',
      margin: '0 0 120px', maxWidth: 1280,
    }}>
      Una práctica <span style={{ color: bStyle.muted }}>pequeña</span> en Buenos Aires.
      Hermana de Obscuro Gamecrafting. Trabajamos
      <span style={{ color: bStyle.muted }}> sólo en una pieza a la vez.</span>
    </p>
    <div data-lux-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
      {LUX_FACTS.map(([n, l]) => (
        <div key={l}>
          <div style={{ ...bStyle.serif, fontSize: 96, lineHeight: 1, color: '#0e0e0e' }}>{n}</div>
          <div style={{ ...bStyle.caps, color: bStyle.muted, marginTop: 18 }}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

const BContact = () => (
  <section id="contacto" style={{ padding: '220px 80px 180px', textAlign: 'center', position: 'relative' }}>
    <div data-lux-reveal style={{ ...bStyle.caps, color: bStyle.muted, marginBottom: 80 }}>
      (v) &nbsp; Contacto
    </div>
    <h2 data-lux-reveal style={{ ...bStyle.serif, fontSize: 220, lineHeight: 0.9, margin: '0 0 88px', letterSpacing: '-0.04em' }}>
      ¿Empezamos?
    </h2>
    <a data-lux-reveal href={`mailto:${LUX.email}`} style={{
      ...bStyle.serif, fontStyle: 'italic',
      fontSize: 56, color: '#0e0e0e', textDecoration: 'none',
      display: 'inline-block', paddingBottom: 8,
      borderBottom: `1px solid ${bStyle.hairline}`,
    }}>
      {LUX.email}
    </a>
  </section>
);

const BFooter = () => (
  <footer style={{
    padding: '40px 80px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: `1px solid ${bStyle.hairline}`,
    ...bStyle.caps, color: bStyle.muted, fontSize: 10,
  }}>
    <span style={{ ...bStyle.serif, fontSize: 18, textTransform:'none', letterSpacing: 0 }}>
      lux<span style={{ color: bStyle.muted }}> · una práctica de Obscuro</span>
    </span>
    <a href="#/obscuro-gamecrafting" style={{ color: 'inherit', textDecoration: 'none' }}>
      También: obscuro / gamecrafting ↗
    </a>
    <span>{LUX.year}</span>
  </footer>
);

const LuxVariationB = () => {
  const ref = React.useRef(null);
  useLuxReveal(ref);
  return (
    <div ref={ref} className="lux-b" style={bStyle.page}>
      <style>{`
        .lux-b [data-lux-reveal]{opacity:0;transform:translateY(20px);transition:opacity 1.1s ease,transform 1.1s cubic-bezier(.22,.61,.36,1)}
        .lux-b [data-lux-revealed]{opacity:1;transform:none}
        .lux-b a:hover{ opacity: 0.55; }
      `}</style>
      <BNav />
      <BHero />
      <BManifesto />
      <BServices />
      <BMethod />
      <BStudio />
      <BContact />
      <BFooter />
    </div>
  );
};

window.LuxVariationB = LuxVariationB;
