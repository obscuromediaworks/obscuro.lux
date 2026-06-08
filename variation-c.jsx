// Variation C — "Grilla Brutalista"
// Tenor Sans / Instrument Serif display + JetBrains Mono, sharp grid, index style.

const cStyles = {
  page: {
    width: '100%',
    background: '#0a0a0a',
    color: '#f5f4ef',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: '0.01em',
    position: 'relative',
    overflow: 'hidden',
  },
  display: {
    fontFamily: '"Instrument Serif", "Tenor Sans", Georgia, serif',
    fontWeight: 400,
  },
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    letterSpacing: '0.06em',
  },
};

const gridLine = 'rgba(245,244,239,0.10)';

const CRule = ({ vert = false }) => (
  <div style={{
    position:'absolute', background: gridLine,
    ...(vert ? { top:0, bottom:0, width:1 } : { left:0, right:0, height:1 }),
  }} />
);

const CGridBg = () => (
  <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
    {[1,2,3,4,5].map((i) => (
      <div key={i} style={{ position:'absolute', top:0, bottom:0, left: `${(i*100/6)}%`, width:1, background:'rgba(245,244,239,0.04)' }} />
    ))}
  </div>
);

const CNav = () => (
  <nav style={{
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '20px 40px',
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', alignItems: 'center',
    borderBottom: `1px solid ${gridLine}`,
    ...cStyles.mono, fontSize: 11, textTransform: 'uppercase',
  }}>
    <div style={{ color:'#f5f4ef', gridColumn: 'span 2', display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ width: 12, height: 12, border:'2px solid #f5f4ef' }} />
      Obscuro Mediaworks
    </div>
    <span style={{ color:'rgba(245,244,239,0.6)' }}>[01] Estudio</span>
    <span style={{ color:'rgba(245,244,239,0.6)' }}>[02] Servicios</span>
    <span style={{ color:'rgba(245,244,239,0.6)' }}>[03] Index</span>
    <span style={{ color:'#f5f4ef', textAlign:'right' }}>[04] Contacto ↗</span>
  </nav>
);

const CHero = () => (
  <section style={{ padding: '120px 40px 0', position: 'relative', borderBottom: `1px solid ${gridLine}` }}>
    <CGridBg />
    {/* Spec strip */}
    <div data-reveal style={{ display:'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderTop: `1px solid ${gridLine}`, borderBottom: `1px solid ${gridLine}`, padding: '12px 0', ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'rgba(245,244,239,0.55)', marginBottom: 80 }}>
      <span>● Loc / BA-ARG</span>
      <span>● Year / 2026</span>
      <span>● Edition / 01</span>
      <span>● Sector / Estudio</span>
      <span>● Disciplinas / 3</span>
      <span style={{ textAlign:'right', color:'#f5f4ef' }}>● Status / Aceptando proyectos</span>
    </div>

    <div data-reveal style={{ ...cStyles.mono, fontSize: 11, textTransform:'uppercase', color:'rgba(245,244,239,0.6)', marginBottom: 28 }}>
      ── Obscuro Mediaworks ─ Estudio de diseño & desarrollo
    </div>
    <h1 data-reveal style={{
      ...cStyles.display,
      fontSize: 196, lineHeight: 0.92, letterSpacing: '-0.025em',
      margin: '0 0 56px',
    }}>
      Identidad. Web.<br />
      <span style={{ fontStyle:'italic', color:'rgba(245,244,239,0.5)' }}>Game</span> design.
    </h1>

    <div data-reveal style={{ display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: `1px solid ${gridLine}` }}>
      <div style={{ padding: '24px 24px 24px 0', borderRight: `1px solid ${gridLine}` }}>
        <div style={{ ...cStyles.mono, fontSize: 10, color: 'rgba(245,244,239,0.45)', textTransform:'uppercase', marginBottom: 10 }}>[A] Disciplinas</div>
        <p style={{ ...cStyles.display, fontSize: 22, lineHeight: 1.3, margin: 0 }}>
          Branding, sitios web y videojuegos para proyectos con criterio.
        </p>
      </div>
      <div style={{ padding: '24px', borderRight: `1px solid ${gridLine}` }}>
        <div style={{ ...cStyles.mono, fontSize: 10, color: 'rgba(245,244,239,0.45)', textTransform:'uppercase', marginBottom: 10 }}>[B] Método</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'rgba(245,244,239,0.75)' }}>
          Pocos clientes, ciclo largo, control sobre todo el sistema. Trabajamos a la par del equipo del proyecto.
        </p>
      </div>
      <div style={{ padding: '24px 0 24px 24px' }}>
        <div style={{ ...cStyles.mono, fontSize: 10, color: 'rgba(245,244,239,0.45)', textTransform:'uppercase', marginBottom: 10 }}>[C] Estado</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'rgba(245,244,239,0.75)' }}>
          Aceptando 2 proyectos para Q3/2026. <span style={{ color:'#f5f4ef' }}>→ Escribir</span>
        </p>
      </div>
    </div>
    <div style={{ height: 80 }} />
  </section>
);

const CSectionLabel = ({ idx, label, count }) => (
  <div style={{ display:'grid', gridTemplateColumns: '160px 1fr 160px', alignItems:'baseline', padding: '40px 40px 24px', ...cStyles.mono, fontSize: 11, textTransform:'uppercase', borderBottom: `1px solid ${gridLine}`, background:'rgba(245,244,239,0.015)' }} data-reveal>
    <span style={{ color:'rgba(245,244,239,0.5)' }}>§ {idx}</span>
    <span style={{ color:'#f5f4ef' }}>{label}</span>
    <span style={{ textAlign:'right', color:'rgba(245,244,239,0.5)' }}>{count}</span>
  </div>
);

const CServices = () => (
  <section>
    <CSectionLabel idx="01" label="Servicios / Disciplines" count="03 entradas" />
    {SERVICES.map((s) => (
      <div key={s.num} data-reveal style={{ display:'grid', gridTemplateColumns: '160px 1fr 480px 160px', alignItems:'flex-start', padding: '56px 40px', borderBottom: `1px solid ${gridLine}`, gap: 32, background: s.sub ? 'rgba(201,169,110,0.04)' : 'transparent' }}>
        <div style={{ ...cStyles.mono, color: s.sub ? '#c9a96e' : 'rgba(245,244,239,0.45)', fontSize: 11, textTransform: 'uppercase' }}>
          / {s.num}
          {s.sub && <div style={{ marginTop: 8, color:'#c9a96e' }}>↳ Sub-brand</div>}
        </div>
        <h3 style={{ ...cStyles.display, fontSize: 72, lineHeight: 0.95, letterSpacing:'-0.02em', margin: 0 }}>
          {s.title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: 'rgba(245,244,239,0.75)' }}>
          {s.desc}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color: 'rgba(245,244,239,0.55)' }}>
          {s.items.map((it) => <span key={it}>+ {it}</span>)}
        </div>
      </div>
    ))}
  </section>
);

const CProjects = () => (
  <section>
    <CSectionLabel idx="02" label="Index / Trabajo seleccionado" count={`${PROJECTS.length} entradas`} />
    {/* Index list */}
    <div data-reveal style={{ display:'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 60px', ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'rgba(245,244,239,0.4)', padding: '14px 40px', borderBottom: `1px solid ${gridLine}` }}>
      <span>№</span><span>Proyecto</span><span>Cliente</span><span>Tipo</span><span>Año</span><span style={{ textAlign:'right' }}>↗</span>
    </div>
    {PROJECTS.map((p, i) => (
      <div key={p.name} data-reveal style={{ display:'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 60px', alignItems:'center', padding: '22px 40px', borderBottom: `1px solid ${gridLine}`, transition: 'background .2s' }}
           onMouseEnter={(e)=>e.currentTarget.style.background='rgba(245,244,239,0.03)'}
           onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}
      >
        <span style={{ ...cStyles.mono, fontSize: 11, color:'rgba(245,244,239,0.45)' }}>0{i+1}</span>
        <span style={{ ...cStyles.display, fontSize: 32, letterSpacing:'-0.01em' }}>{p.name}</span>
        <span style={{ fontSize: 13, color:'rgba(245,244,239,0.7)' }}>{p.client}</span>
        <span style={{ ...cStyles.mono, fontSize: 11, color:'rgba(245,244,239,0.6)', textTransform:'uppercase' }}>{p.tags.join(' · ')}</span>
        <span style={{ ...cStyles.mono, fontSize: 11, color:'rgba(245,244,239,0.6)' }}>{p.year}</span>
        <span style={{ ...cStyles.mono, fontSize: 14, color:'#f5f4ef', textAlign:'right' }}>↗</span>
      </div>
    ))}

    {/* Featured panels below the list */}
    <div style={{ display:'grid', gridTemplateColumns: '2fr 1fr', gap: 0, borderBottom: `1px solid ${gridLine}` }}>
      <div data-reveal style={{ borderRight: `1px solid ${gridLine}`, padding: 0 }}>
        <Placeholder label="Tótem — Fundación Marajó · 2025" ratio="16/10" tone="dark" />
      </div>
      <div data-reveal style={{ display:'grid', gridTemplateRows: '1fr 1fr' }}>
        <div style={{ borderBottom: `1px solid ${gridLine}` }}>
          <Placeholder label="Cobalto FC — identidad" ratio="auto" tone="dark" style={{ height: '100%' }} />
        </div>
        <Placeholder label="Mariposa Nocturna — packaging" ratio="auto" tone="dark" style={{ height: '100%' }} />
      </div>
    </div>
  </section>
);

const CGames = () => (
  <section style={{ position:'relative', borderBottom: `1px solid ${gridLine}` }}>
    <CSectionLabel idx="03" label="Obscuro / Games — Sub-brand" count="División" />
    <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${gridLine}` }}>
      <div data-reveal style={{ padding: '80px 40px', borderRight: `1px solid ${gridLine}`, position:'relative' }}>
        <div style={{ ...cStyles.mono, fontSize: 11, color: '#c9a96e', textTransform:'uppercase', marginBottom: 24, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width: 8, height: 8, background:'#c9a96e' }} />
          OBSCURO / GAMES — division
        </div>
        <h2 style={{ ...cStyles.display, fontSize: 120, lineHeight: 0.92, letterSpacing:'-0.025em', margin: '0 0 32px' }}>
          También <span style={{ fontStyle:'italic', color:'#c9a96e' }}>hacemos</span> juegos.
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color:'rgba(245,244,239,0.75)', maxWidth: 460, margin:'0 0 40px' }}>
          Una división aparte dentro del estudio, dedicada al desarrollo de videojuegos indie y experiencias interactivas. Diseño narrativo + dirección de arte + desarrollo en Unity y herramientas custom.
        </p>
        <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border: `1px solid ${gridLine}`, maxWidth: 460 }}>
          {[
            ['Labyrinth Encounters 2', 'En desarrollo · 2026'],
            ['Game Design', 'Servicio'],
            ['Dirección de arte', 'Servicio'],
            ['Narrativa', 'Servicio'],
          ].map(([k, v], i) => (
            <div key={k} style={{ padding: '14px 16px', borderRight: i % 2 === 0 ? `1px solid ${gridLine}` : 'none', borderBottom: i < 2 ? `1px solid ${gridLine}` : 'none' }}>
              <div style={{ ...cStyles.mono, fontSize: 9, textTransform:'uppercase', color:'rgba(245,244,239,0.5)', marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 14, color:'#f5f4ef' }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, ...cStyles.mono, fontSize: 11, textTransform:'uppercase', color:'#c9a96e' }}>
          → Visitar Obscuro Games
        </div>
      </div>
      <div data-reveal style={{ position:'relative', background:'#070707' }}>
        <Placeholder label="Labyrinth Encounters 2 — gameplay reel 0.4" ratio="auto" tone="dark" kind="video" style={{ height: '100%' }} />
        <div style={{ position:'absolute', top: 16, left: 16, ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'#f5f4ef', background:'rgba(0,0,0,0.6)', padding:'6px 10px' }}>
          ● REC · 0.4-alpha
        </div>
      </div>
    </div>
  </section>
);

const CAbout = () => (
  <section>
    <CSectionLabel idx="04" label="Estudio / Sobre nosotros" count="Manifesto" />
    <div data-reveal style={{ padding: '80px 40px', display:'grid', gridTemplateColumns: '160px 1fr 480px', gap: 40, alignItems:'flex-start', borderBottom: `1px solid ${gridLine}` }}>
      <div style={{ ...cStyles.mono, fontSize: 11, color:'rgba(245,244,239,0.5)', textTransform:'uppercase' }}>§ Manifesto</div>
      <p style={{ ...cStyles.display, fontSize: 40, lineHeight: 1.25, margin: 0, letterSpacing:'-0.01em' }}>
        Trabajamos en la zona donde el diseño deja de ser decoración y empieza a ser estructura. Ahí, en la sombra entre forma y función, vivimos nosotros.
      </p>
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border:`1px solid ${gridLine}` }}>
        {[['07', 'años'], ['42', 'proyectos'], ['06', 'personas'], ['12', 'países']].map(([n,l], i) => (
          <div key={l} style={{ padding: '20px', borderRight: i % 2 === 0 ? `1px solid ${gridLine}` : 'none', borderBottom: i < 2 ? `1px solid ${gridLine}` : 'none' }}>
            <div style={{ ...cStyles.display, fontSize: 56, lineHeight: 1 }}>{n}</div>
            <div style={{ ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'rgba(245,244,239,0.55)', marginTop: 8 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CContact = () => (
  <section style={{ borderBottom: `1px solid ${gridLine}`, position:'relative' }}>
    <CSectionLabel idx="05" label="Contacto / Iniciar proyecto" count="Aceptando 2 proyectos" />
    <div style={{ padding: '100px 40px 60px', position:'relative' }}>
      <CGridBg />
      <div data-reveal style={{ ...cStyles.mono, fontSize: 11, color:'rgba(245,244,239,0.5)', textTransform:'uppercase', marginBottom: 32 }}>
        ── Escribinos ─ hola@obscuro.studio
      </div>
      <h2 data-reveal style={{ ...cStyles.display, fontSize: 200, lineHeight: 0.9, letterSpacing:'-0.03em', margin: '0 0 64px' }}>
        <span style={{ fontStyle:'italic' }}>Iniciemos</span><br />
        algo juntos.
      </h2>
      <div data-reveal style={{ display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop:`1px solid ${gridLine}`, borderBottom:`1px solid ${gridLine}` }}>
        {[
          ['Email', 'hola@obscuro.studio'],
          ['Teléfono', '+54 11 0000 0000'],
          ['Ubicación', 'Buenos Aires · ARG'],
          ['Tiempo de respuesta', '48hs hábiles'],
        ].map(([k,v], i) => (
          <div key={k} style={{ padding: '24px 20px', borderRight: i < 3 ? `1px solid ${gridLine}` : 'none' }}>
            <div style={{ ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'rgba(245,244,239,0.5)', marginBottom: 8 }}>[{String(i+1).padStart(2,'0')}] {k}</div>
            <div style={{ fontSize: 15, color:'#f5f4ef' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CFooter = () => (
  <footer style={{ padding: '24px 40px', display:'grid', gridTemplateColumns: 'repeat(6, 1fr)', alignItems:'center', ...cStyles.mono, fontSize: 10, textTransform:'uppercase', color:'rgba(245,244,239,0.5)' }}>
    <span style={{ gridColumn:'span 2' }}>© Obscuro Mediaworks 2019—2026</span>
    <span>Instagram ↗</span>
    <span>Behance ↗</span>
    <span>Vimeo ↗</span>
    <span style={{ textAlign:'right' }}>Buenos Aires · Argentina</span>
  </footer>
);

const VariationC = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={cStyles.page} className="obscuro-c">
      <style>{`
        .obscuro-c [data-reveal]{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,.61,.36,1)}
        .obscuro-c [data-revealed]{opacity:1;transform:none}
      `}</style>
      <CNav />
      <CHero />
      <CServices />
      <CProjects />
      <CGames />
      <CAbout />
      <CContact />
      <CFooter />
    </div>
  );
};

window.VariationC = VariationC;
