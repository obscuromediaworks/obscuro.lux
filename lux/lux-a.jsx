// LUX — Variation A · "Atelier / Museo"
// Parchment background, framed plates, italic serif display.
// Reads like an architecture monograph or museum catalog.

const aStyle = {
  page: {
    width: '100%',
    background: '#f4f1eb',
    color: '#1a1a1a',
    fontFamily: '"Tenor Sans", "Cormorant Garamond", Georgia, serif',
    fontWeight: 400,
    position: 'relative',
  },
  serif: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 300,
  },
  caps: {
    fontFamily: '"Tenor Sans", "Geist", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.32em',
    fontSize: 10.5,
  },
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  hairline: 'rgba(26,26,26,0.22)',
  hairlineSoft: 'rgba(26,26,26,0.12)',
  muted: '#6b6358',
};

const ANav = () => (
  <nav style={{
    padding: '28px 64px',
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    borderBottom: `1px solid ${aStyle.hairline}`,
  }}>
    <span style={{
      ...aStyle.serif, fontStyle: 'italic',
      fontSize: 22, color: '#1a1a1a',
      display: 'inline-flex', gap: 8, alignItems: 'baseline',
    }}>
      <span style={{ color: aStyle.muted }}>(</span>
      <span>lux</span>
      <span style={{ color: aStyle.muted }}>)</span>
    </span>
    <div style={{ display: 'flex', gap: 40, ...aStyle.caps, color: '#1a1a1a' }}>
      <a href="#manifiesto" style={{ color:'inherit', textDecoration:'none' }}>Manifiesto</a>
      <a href="#servicios" style={{ color:'inherit', textDecoration:'none' }}>Servicios</a>
      <a href="#metodo" style={{ color:'inherit', textDecoration:'none' }}>Método</a>
      <a href="#estudio" style={{ color:'inherit', textDecoration:'none' }}>Estudio</a>
      <a href="#contacto" style={{ color:'inherit', textDecoration:'none' }}>Contacto</a>
    </div>
  </nav>
);

const AHero = () => (
  <section style={{ padding: '120px 64px 140px', position: 'relative' }}>
    {/* Plate label */}
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...aStyle.caps, color: aStyle.muted, marginBottom: 100 }}>
      <span>Plate &nbsp; · &nbsp; Frontispicio</span>
      <span>{LUX.founded} — {LUX.year}</span>
    </div>

    {/* Framed hero plaque */}
    <div data-lux-reveal style={{
      padding: '120px 80px',
      border: `1px solid ${aStyle.hairline}`,
      position: 'relative',
      textAlign: 'center',
    }}>
      {/* Corner ticks */}
      {['tl','tr','bl','br'].map((c) => (
        <span key={c} aria-hidden style={{
          position: 'absolute', width: 9, height: 9, background: '#f4f1eb',
          border: `1px solid ${aStyle.hairline}`,
          top: c.startsWith('t') ? -5 : 'auto', bottom: c.startsWith('b') ? -5 : 'auto',
          left: c.endsWith('l') ? -5 : 'auto', right: c.endsWith('r') ? -5 : 'auto',
        }} />
      ))}
      <div style={{ ...aStyle.caps, color: aStyle.muted, marginBottom: 36 }}>
        LUX — Práctica de diseño · MMXXVI
      </div>
      <h1 style={{
        ...aStyle.serif,
        fontSize: 156, lineHeight: 0.95,
        letterSpacing: '-0.02em',
        margin: 0,
        fontWeight: 300,
      }}>
        <em style={{ fontStyle: 'italic' }}>Identidad</em>
        <span style={{ color: aStyle.muted }}> &amp; </span>
        <em style={{ fontStyle: 'italic' }}>diseño digital</em>
      </h1>
      <div style={{ ...aStyle.caps, color: aStyle.muted, marginTop: 36 }}>
        Buenos Aires &nbsp; · &nbsp; 34.6°S
      </div>
    </div>
  </section>
);

const AManifesto = () => (
  <section id="manifiesto" style={{ padding: '120px 64px', borderTop: `1px solid ${aStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...aStyle.caps, color: aStyle.muted, marginBottom: 56 }}>
      <span>Plate &nbsp; 01 &nbsp; · &nbsp; Manifiesto</span>
      <span>Cuatro principios</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48, columnGap: 96 }}>
      {LUX_PRINCIPLES.map((p, i) => (
        <div data-lux-reveal key={p} style={{
          borderTop: `1px solid ${aStyle.hairlineSoft}`,
          paddingTop: 28, display: 'flex', gap: 32,
        }}>
          <span style={{ ...aStyle.caps, color: aStyle.muted, paddingTop: 8 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <p style={{ ...aStyle.serif, fontStyle: 'italic', fontSize: 36, lineHeight: 1.25, margin: 0, maxWidth: 460 }}>
            {p}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const AServices = () => (
  <section id="servicios" style={{ padding: '120px 64px', borderTop: `1px solid ${aStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...aStyle.caps, color: aStyle.muted, marginBottom: 72 }}>
      <span>Plate &nbsp; 02 &nbsp; · &nbsp; Disciplinas</span>
      <span>Dos prácticas</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${aStyle.hairline}` }}>
      {LUX_SERVICES.map((s, i) => (
        <div data-lux-reveal key={s.num} style={{
          padding: '60px 56px 64px',
          borderRight: i === 0 ? `1px solid ${aStyle.hairline}` : 'none',
          background: '#f7f4ee',
          minHeight: 360,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ ...aStyle.caps, color: aStyle.muted, marginBottom: 36 }}>
            Plate · {s.num}
          </div>
          <h3 style={{ ...aStyle.serif, fontStyle: 'italic', fontSize: 88, margin: '0 0 28px', letterSpacing: '-0.015em', fontWeight: 300 }}>
            {s.title}
          </h3>
          <p style={{ ...aStyle.serif, fontSize: 22, lineHeight: 1.5, margin: '0 0 36px', color: '#2a261f' }}>
            {s.desc}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 6, ...aStyle.caps, color: aStyle.muted }}>
            {s.items.map((it, j) => (
              <React.Fragment key={it}>
                <span>{it}</span>
                {j < s.items.length - 1 && <span style={{ opacity: 0.5 }}>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const AMethod = () => (
  <section id="metodo" style={{ padding: '120px 64px', borderTop: `1px solid ${aStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...aStyle.caps, color: aStyle.muted, marginBottom: 72 }}>
      <span>Plate &nbsp; 03 &nbsp; · &nbsp; Método</span>
      <span>Tres fases</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56 }}>
      {LUX_METHOD.map((m) => (
        <div data-lux-reveal key={m.num} style={{
          borderTop: `1px solid ${aStyle.hairline}`,
          paddingTop: 32,
        }}>
          <div style={{ ...aStyle.serif, fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: aStyle.muted, marginBottom: 24 }}>
            {m.num}
          </div>
          <h4 style={{ ...aStyle.serif, fontSize: 36, margin: '0 0 16px', letterSpacing: '-0.015em', fontWeight: 400 }}>
            {m.title}
          </h4>
          <p style={{ ...aStyle.serif, fontSize: 18, lineHeight: 1.55, color: '#3a342b', margin: 0 }}>
            {m.desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const AStudio = () => (
  <section id="estudio" style={{ padding: '120px 64px', borderTop: `1px solid ${aStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...aStyle.caps, color: aStyle.muted, marginBottom: 72 }}>
      <span>Plate &nbsp; 04 &nbsp; · &nbsp; Estudio</span>
      <span>Buenos Aires</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 96 }}>
      <p data-lux-reveal style={{ ...aStyle.serif, fontSize: 42, lineHeight: 1.3, margin: 0, fontWeight: 300 }}>
        Una práctica pequeña en Buenos Aires.
        <br /><em style={{ color: aStyle.muted }}>Hermana</em> de Obscuro Gamecrafting,
        dedicada exclusivamente al diseño de identidad y al diseño digital.
        Trabajamos en una pieza a la vez.
      </p>
      <div data-lux-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
        {LUX_FACTS.map(([n, l]) => (
          <div key={l} style={{ borderTop: `1px solid ${aStyle.hairline}`, paddingTop: 16 }}>
            <div style={{ ...aStyle.serif, fontSize: 64, lineHeight: 1, fontWeight: 300 }}>{n}</div>
            <div style={{ ...aStyle.caps, color: aStyle.muted, marginTop: 12 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AContact = () => (
  <section id="contacto" style={{ padding: '140px 64px 120px', borderTop: `1px solid ${aStyle.hairline}`, textAlign: 'center' }}>
    <div data-lux-reveal style={{ ...aStyle.caps, color: aStyle.muted, marginBottom: 64 }}>
      Plate &nbsp; 05 &nbsp; · &nbsp; Contacto
    </div>
    <h2 data-lux-reveal style={{ ...aStyle.serif, fontSize: 124, fontStyle: 'italic', margin: '0 0 56px', letterSpacing: '-0.02em', fontWeight: 300 }}>
      Escribinos.
    </h2>
    <a data-lux-reveal href={`mailto:${LUX.email}`} style={{
      ...aStyle.serif, fontStyle: 'italic',
      fontSize: 40, color: '#1a1a1a', textDecoration: 'none',
      borderBottom: `1px solid ${aStyle.hairline}`, paddingBottom: 6,
    }}>
      {LUX.email}
    </a>
  </section>
);

const AFooter = () => (
  <footer style={{
    padding: '36px 64px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: `1px solid ${aStyle.hairline}`,
    ...aStyle.caps, color: aStyle.muted, fontSize: 10,
  }}>
    <span>( lux ) &nbsp; — &nbsp; {LUX.parentNote}</span>
    <a href="#/obscuro-gamecrafting" style={{ color: 'inherit', textDecoration: 'none' }}>
      También: obscuro / gamecrafting ↗
    </a>
    <span>{LUX.year}</span>
  </footer>
);

const LuxVariationA = () => {
  const ref = React.useRef(null);
  useLuxReveal(ref);
  return (
    <div ref={ref} className="lux-a" style={aStyle.page}>
      <style>{`
        .lux-a [data-lux-reveal]{opacity:0;transform:translateY(20px);transition:opacity .9s ease,transform .9s cubic-bezier(.22,.61,.36,1)}
        .lux-a [data-lux-revealed]{opacity:1;transform:none}
        .lux-a a:hover{ opacity: 0.6; }
      `}</style>
      <ANav />
      <AHero />
      <AManifesto />
      <AServices />
      <AMethod />
      <AStudio />
      <AContact />
      <AFooter />
    </div>
  );
};

window.LuxVariationA = LuxVariationA;
