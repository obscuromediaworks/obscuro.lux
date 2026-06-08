// LUX — Variation C · "Minimal / Grotesk"
// Pure white, ultra-thin grotesk, hairline grid, baseline-aligned.
// Reads like a Swiss reference document or annual report.

const cStyle = {
  page: {
    width: '100%',
    background: '#ffffff',
    color: '#000000',
    fontFamily: '"Geist", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 300,
    position: 'relative',
  },
  display: {
    fontFamily: '"Geist", "Helvetica Neue", sans-serif',
    fontWeight: 300,
    letterSpacing: '-0.03em',
  },
  caps: {
    fontFamily: '"Geist", sans-serif',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: 10,
  },
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10.5,
    letterSpacing: '0.04em',
  },
  hairline: 'rgba(0,0,0,0.14)',
  hairlineSoft: 'rgba(0,0,0,0.07)',
  muted: '#888',
};

// Reusable hairline grid columns (12-col visual)
const CGridLines = () => (
  <div aria-hidden style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `linear-gradient(to right, ${cStyle.hairlineSoft} 1px, transparent 1px)`,
    backgroundSize: 'calc((100% - 128px) / 12) 100%',
    backgroundPosition: '64px 0',
  }} />
);

const CNav = () => (
  <nav style={{
    padding: '20px 64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: `1px solid ${cStyle.hairline}`,
    position: 'relative',
  }}>
    <span style={{ ...cStyle.mono, fontWeight: 500, fontSize: 13 }}>
      <span style={{ color: cStyle.muted }}>/</span>&nbsp;lux&nbsp;<span style={{ color: cStyle.muted }}>/</span>
      <span style={{ color: cStyle.muted, marginLeft: 12 }}>practice · est. {LUX.founded}</span>
    </span>
    <div style={{ display: 'flex', gap: 36, ...cStyle.caps }}>
      <a href="#manifiesto" style={{ color:'inherit', textDecoration:'none' }}>01 Manifiesto</a>
      <a href="#servicios" style={{ color:'inherit', textDecoration:'none' }}>02 Servicios</a>
      <a href="#metodo" style={{ color:'inherit', textDecoration:'none' }}>03 Método</a>
      <a href="#estudio" style={{ color:'inherit', textDecoration:'none' }}>04 Estudio</a>
      <a href="#contacto" style={{ color:'inherit', textDecoration:'none' }}>05 Contacto</a>
    </div>
  </nav>
);

// Top metadata row — feels like a document header
const CMetaRow = () => (
  <div data-lux-metarow style={{
    padding: '14px 64px',
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    borderBottom: `1px solid ${cStyle.hairline}`,
    ...cStyle.mono, color: cStyle.muted,
  }}>
    <span><span style={{ color: '#000' }}>Doc.</span>&nbsp; LUX-2026-01</span>
    <span><span style={{ color: '#000' }}>Práctica.</span>&nbsp; Identidad &amp; digital</span>
    <span><span style={{ color: '#000' }}>Loc.</span>&nbsp; Buenos Aires · 34.6°S</span>
    <span><span style={{ color: '#000' }}>Año.</span>&nbsp; {LUX.year}</span>
    <span style={{ textAlign: 'right' }}><span style={{ color: '#000' }}>Rev.</span>&nbsp; 01</span>
  </div>
);

const CHero = () => (
  <section style={{ padding: '120px 64px 140px', position: 'relative', borderBottom: `1px solid ${cStyle.hairline}` }}>
    <div data-lux-reveal style={{ ...cStyle.caps, color: cStyle.muted, marginBottom: 60 }}>
      § 00 &nbsp;—&nbsp; Frontispicio
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 80, alignItems: 'end' }}>
      <h1 data-lux-reveal style={{
        ...cStyle.display,
        fontSize: 184, lineHeight: 0.92,
        margin: 0,
      }}>
        lux —<br />
        identidad y<br />
        diseño digital.
      </h1>
      <div data-lux-reveal style={{ paddingBottom: 24, borderTop: `1px solid ${cStyle.hairline}`, paddingTop: 24 }}>
        <div style={{ ...cStyle.mono, color: cStyle.muted, marginBottom: 14, lineHeight: 1.8 }}>
          <div><span style={{ color: '#000' }}>Práctica:</span>&nbsp; sub-marca de Obscuro</div>
          <div><span style={{ color: '#000' }}>Disciplinas:</span>&nbsp; 02</div>
          <div><span style={{ color: '#000' }}>Modo:</span>&nbsp; una pieza a la vez</div>
        </div>
      </div>
    </div>
    <div data-lux-reveal style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
      <p style={{ gridColumn: '1 / span 7', ...cStyle.display, fontSize: 26, lineHeight: 1.45, margin: 0, color: '#222' }}>
        Trabajamos con marcas que se toman en serio su forma. Documentamos todo, restringimos el campo, entregamos sistemas.
      </p>
    </div>
  </section>
);

const CManifesto = () => (
  <section id="manifiesto" style={{ padding: '100px 64px', borderBottom: `1px solid ${cStyle.hairline}`, position: 'relative' }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.caps, color: cStyle.muted, marginBottom: 64 }}>
      <span>§ 01 &nbsp;—&nbsp; Manifiesto</span>
      <span>Cuatro principios fundamentales</span>
    </div>
    <div>
      {LUX_PRINCIPLES.map((p, i) => (
        <div data-lux-reveal key={p} style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 1fr',
          gap: 40, alignItems: 'baseline',
          padding: '32px 0',
          borderTop: `1px solid ${cStyle.hairlineSoft}`,
        }}>
          <span style={{ ...cStyle.mono, color: cStyle.muted }}>0{i + 1}.</span>
          <p style={{ ...cStyle.display, fontSize: 36, lineHeight: 1.25, margin: 0 }}>
            {p}
          </p>
          <p style={{ ...cStyle.mono, color: cStyle.muted, margin: 0, lineHeight: 1.65 }}>
            {[
              'Cada decisión justificada en un documento. El proceso es parte del entregable.',
              'Documentar el por qué importa más que mostrar el resultado.',
              'Nuestro ritmo no se negocia. La calidad es función directa del tiempo dedicado.',
              'Decir que no es una habilidad de diseño. Lo que dejamos fuera define lo que queda.',
            ][i]}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const CServices = () => (
  <section id="servicios" style={{ padding: '100px 64px', borderBottom: `1px solid ${cStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.caps, color: cStyle.muted, marginBottom: 64 }}>
      <span>§ 02 &nbsp;—&nbsp; Servicios</span>
      <span>Dos disciplinas</span>
    </div>
    {/* Tabular display */}
    <div>
      {LUX_SERVICES.map((s, i) => (
        <div data-lux-reveal key={s.num} style={{
          display: 'grid', gridTemplateColumns: '60px 2fr 3fr 2fr',
          gap: 32, alignItems: 'start',
          padding: '56px 0',
          borderTop: `1px solid ${cStyle.hairline}`,
          borderBottom: i === LUX_SERVICES.length - 1 ? `1px solid ${cStyle.hairline}` : 'none',
        }}>
          <span style={{ ...cStyle.mono, color: cStyle.muted, paddingTop: 8 }}>{s.num}.</span>
          <h3 style={{ ...cStyle.display, fontSize: 56, margin: 0, lineHeight: 0.95 }}>
            {s.title}
          </h3>
          <p style={{ ...cStyle.display, fontSize: 17, lineHeight: 1.55, margin: 0, color: '#1a1a1a' }}>
            {s.desc}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...cStyle.mono, color: '#000', paddingTop: 8 }}>
            {s.items.map((it) => (
              <span key={it}>— {it}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CMethod = () => (
  <section id="metodo" style={{ padding: '100px 64px', borderBottom: `1px solid ${cStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.caps, color: cStyle.muted, marginBottom: 64 }}>
      <span>§ 03 &nbsp;—&nbsp; Método</span>
      <span>Tres fases en secuencia</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${cStyle.hairline}` }}>
      {LUX_METHOD.map((m, i) => (
        <div data-lux-reveal key={m.num} style={{
          padding: '48px 36px 48px 0',
          borderRight: i < LUX_METHOD.length - 1 ? `1px solid ${cStyle.hairline}` : 'none',
          paddingRight: i < LUX_METHOD.length - 1 ? 36 : 0,
          paddingLeft: i > 0 ? 36 : 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.mono, color: cStyle.muted, marginBottom: 32 }}>
            <span>Fase {m.num}</span>
            <span>{String(i + 1).padStart(2, '0')} / 03</span>
          </div>
          <h4 style={{ ...cStyle.display, fontSize: 42, margin: '0 0 20px', lineHeight: 1 }}>
            {m.title}
          </h4>
          <p style={{ ...cStyle.display, fontSize: 15, lineHeight: 1.65, color: '#333', margin: 0 }}>
            {m.desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const CStudio = () => (
  <section id="estudio" style={{ padding: '100px 64px', borderBottom: `1px solid ${cStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.caps, color: cStyle.muted, marginBottom: 64 }}>
      <span>§ 04 &nbsp;—&nbsp; Estudio</span>
      <span>Buenos Aires · ARG</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 80 }}>
      <p data-lux-reveal style={{
        ...cStyle.display, fontSize: 42, lineHeight: 1.2, margin: 0, maxWidth: 720,
      }}>
        Una práctica pequeña en Buenos Aires. Hermana de Obscuro Gamecrafting. Dedicada exclusivamente a identidad y diseño digital. Trabajamos en una pieza a la vez.
      </p>
      <div data-lux-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, borderTop: `1px solid ${cStyle.hairline}` }}>
        {LUX_FACTS.map(([n, l], i) => (
          <div key={l} style={{
            padding: '20px 24px 24px 0',
            borderBottom: i < LUX_FACTS.length - 2 ? `1px solid ${cStyle.hairlineSoft}` : 'none',
            borderRight: i % 2 === 0 ? `1px solid ${cStyle.hairlineSoft}` : 'none',
            paddingLeft: i % 2 === 1 ? 24 : 0,
          }}>
            <div style={{ ...cStyle.display, fontSize: 64, lineHeight: 1 }}>{n}</div>
            <div style={{ ...cStyle.mono, color: cStyle.muted, marginTop: 12 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CContact = () => (
  <section id="contacto" style={{ padding: '120px 64px', borderBottom: `1px solid ${cStyle.hairline}` }}>
    <div data-lux-reveal style={{ display: 'flex', justifyContent: 'space-between', ...cStyle.caps, color: cStyle.muted, marginBottom: 64 }}>
      <span>§ 05 &nbsp;—&nbsp; Contacto</span>
      <span>Respuesta en 48hs</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 80, alignItems: 'end' }}>
      <h2 data-lux-reveal style={{ ...cStyle.display, fontSize: 144, margin: 0, lineHeight: 0.9 }}>
        Escribinos.
      </h2>
      <a data-lux-reveal href={`mailto:${LUX.email}`} style={{
        ...cStyle.mono, fontSize: 18,
        color: '#000', textDecoration: 'none',
        borderBottom: `1px solid #000`, paddingBottom: 4,
        justifySelf: 'start',
      }}>
        {LUX.email}
      </a>
    </div>
  </section>
);

const CFooter = () => (
  <footer style={{
    padding: '24px 64px',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    ...cStyle.mono, color: cStyle.muted,
  }}>
    <span><span style={{ color: '#000' }}>/ lux /</span>&nbsp; · &nbsp;{LUX.parentNote}</span>
    <span>{LUX.founded} — {LUX.year}</span>
    <span>Doc. LUX-2026-01 · Rev. 01</span>
    <a href="#/" style={{ color: '#000', textDecoration: 'none', textAlign: 'right' }}>
      → obscuro / gamecrafting
    </a>
  </footer>
);

const LuxVariationC = () => {
  const ref = React.useRef(null);
  useLuxReveal(ref);
  return (
    <div ref={ref} className="lux-c" style={cStyle.page}>
      <style>{`
        .lux-c [data-lux-reveal]{opacity:0;transform:translateY(14px);transition:opacity .8s ease,transform .8s cubic-bezier(.22,.61,.36,1)}
        .lux-c [data-lux-revealed]{opacity:1;transform:none}
        .lux-c a:hover{ opacity: 0.55; }

        /* Mobile pass — single-column, smaller scale. A proper mobile pass
           lives as a TODO; this keeps it usable below 720px. */
        @media (max-width: 720px) {
          .lux-c nav { padding: 14px 20px !important; flex-wrap: wrap !important; gap: 12px !important; }
          .lux-c nav > div:last-child { display: none !important; }
          .lux-c section { padding: 56px 20px !important; }
          .lux-c h1 { font-size: 48px !important; line-height: 1.05 !important; }
          .lux-c h2 { font-size: 56px !important; line-height: 1 !important; }
          .lux-c h3 { font-size: 30px !important; line-height: 1.05 !important; }
          .lux-c h4 { font-size: 24px !important; line-height: 1.1 !important; }
          .lux-c p { font-size: 16px !important; line-height: 1.55 !important; }
          .lux-c [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .lux-c footer {
            padding: 20px !important;
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }
          /* Hide the document meta strip on mobile — too dense to be readable. */
          .lux-c [data-lux-metarow] { display: none !important; }
        }
      `}</style>
      <CNav />
      <CMetaRow />
      <CHero />
      <CManifesto />
      <CServices />
      <CMethod />
      <CStudio />
      <CContact />
      <CFooter />
    </div>
  );
};

window.LuxVariationC = LuxVariationC;
