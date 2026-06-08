// Page — Case Study: Tótem (Fundación Marajó). Style of Variation B applied to a project detail page.

const csStyles = {
  page: { width: '100%', background: '#0a0a0a', color: '#f5f4ef', fontFamily: '"Space Grotesk", Helvetica, sans-serif', fontWeight: 400, position: 'relative', overflow: 'hidden' },
  serif: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300 },
  mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' },
};

const CSNav = () => (
  <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
      <LogoMark variant="primary" size="nav" />
    </div>
    <div style={{ display: 'flex', gap: 32, ...csStyles.mono, fontSize: 11, color: 'rgba(245,244,239,0.7)' }}>
      <span style={{ color: '#f5f4ef' }}>← Volver al index</span>
      <span style={{ padding: '6px 14px', border: '1px solid #f5f4ef', borderRadius: 999, color:'#f5f4ef' }}>Iniciar proyecto</span>
    </div>
  </nav>
);

const CSHero = () => (
  <section style={{ padding: '160px 48px 80px', position: 'relative', borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <div data-reveal style={{ display:'grid', gridTemplateColumns: '120px 1fr 220px', gap: 24, ...csStyles.mono, color: 'rgba(245,244,239,0.55)', marginBottom: 72, alignItems:'baseline' }}>
      <span>Case 01 / 12</span>
      <span style={{ color:'#f5f4ef' }}>● BRANDING · EDITORIAL · ARTE DIRECCIÓN</span>
      <span style={{ textAlign:'right' }}>MMXXV — 6 meses</span>
    </div>
    <h1 data-reveal style={{ ...csStyles.serif, fontSize: 240, lineHeight: 0.88, letterSpacing:'-0.035em', margin: '0 0 48px' }}>
      <em>Tótem.</em>
    </h1>
    <div data-reveal style={{ display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 56, marginTop: 40, borderTop:'1px solid rgba(245,244,239,0.12)', paddingTop: 32 }}>
      <div>
        <div style={{ ...csStyles.mono, color:'rgba(245,244,239,0.45)', marginBottom: 10 }}>Cliente</div>
        <div style={{ fontSize: 17 }}>Fundación Marajó</div>
      </div>
      <div>
        <div style={{ ...csStyles.mono, color:'rgba(245,244,239,0.45)', marginBottom: 10 }}>Disciplinas</div>
        <div style={{ fontSize: 17 }}>Identidad, sistema editorial, dirección de arte</div>
      </div>
      <div>
        <div style={{ ...csStyles.mono, color:'rgba(245,244,239,0.45)', marginBottom: 10 }}>Equipo</div>
        <div style={{ fontSize: 17 }}>4 personas · 2025</div>
      </div>
    </div>
  </section>
);

const CSCover = () => (
  <section style={{ position: 'relative', borderBottom: '1px solid rgba(245,244,239,0.08)' }} data-reveal>
    <Placeholder label="Cover — Tótem identidad principal · 2025" ratio="21/9" tone="dark" />
    <Grain opacity={0.06} />
  </section>
);

const CSBrief = () => (
  <section style={{ padding: '120px 48px', borderBottom: '1px solid rgba(245,244,239,0.08)', display:'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 64, alignItems:'flex-start' }}>
    <div data-reveal style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>(01) Brief</div>
    <h2 data-reveal style={{ ...csStyles.serif, fontSize: 56, lineHeight: 1.05, letterSpacing:'-0.02em', margin: 0 }}>
      Una fundación cultural sin identidad propia, prestando logos a cada programa que lanzaban.
    </h2>
    <div data-reveal style={{ display:'flex', flexDirection:'column', gap: 24, paddingTop: 12 }}>
      <p style={{ fontSize: 15, lineHeight: 1.7, color:'rgba(245,244,239,0.75)', margin: 0 }}>
        Marajó nos llamó después de 18 años de trabajar sin un sistema gráfico. Cada publicación, evento o pieza editorial tenía su propio tono. La fundación se diluía.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.7, color:'rgba(245,244,239,0.75)', margin: 0 }}>
        Diseñamos una identidad que pudiera convivir con la diversidad de sus programas, pero que diera continuidad visual a todo lo que sale del lugar.
      </p>
    </div>
  </section>
);

const CSGallery = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <div data-reveal style={{ padding: '120px 48px 32px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
      <h2 style={{ ...csStyles.serif, fontSize: 88, margin: 0, letterSpacing:'-0.025em' }}>Proceso</h2>
      <span style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>(02) Imagen</span>
    </div>
    <div data-reveal style={{ padding: '32px 48px' }}>
      <Placeholder label="Sistema tipográfico — display + texto" ratio="16/9" tone="dark" />
    </div>
    <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop:'1px solid rgba(245,244,239,0.08)' }}>
      <div data-reveal style={{ borderRight:'1px solid rgba(245,244,239,0.08)' }}>
        <Placeholder label="Logo principal & variantes" ratio="4/5" tone="dark" />
      </div>
      <div data-reveal>
        <Placeholder label="Paleta cromática — primaria + acentos" ratio="4/5" tone="dark" />
      </div>
    </div>
    <div data-reveal style={{ padding: 0 }}>
      <Placeholder label="Aplicaciones — editorial impreso" ratio="21/9" tone="dark" />
    </div>
    <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
      <div data-reveal style={{ borderRight:'1px solid rgba(245,244,239,0.08)' }}>
        <Placeholder label="Stationery" ratio="3/4" tone="dark" />
      </div>
      <div data-reveal style={{ borderRight:'1px solid rgba(245,244,239,0.08)' }}>
        <Placeholder label="Wayfinding sede" ratio="3/4" tone="dark" />
      </div>
      <div data-reveal>
        <Placeholder label="Sistema digital" ratio="3/4" tone="dark" />
      </div>
    </div>
  </section>
);

const CSQuote = () => (
  <section style={{ padding: '160px 48px', borderBottom: '1px solid rgba(245,244,239,0.08)', textAlign:'center', position: 'relative' }}>
    <Grain opacity={0.05} />
    <div data-reveal style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 40 }}>— Cliente</div>
    <p data-reveal style={{ ...csStyles.serif, fontSize: 56, lineHeight: 1.25, letterSpacing:'-0.01em', maxWidth: 1100, margin: '0 auto 40px' }}>
      <em>"Por primera vez en veinte años la fundación se parece a sí misma."</em>
    </p>
    <div data-reveal style={{ ...csStyles.mono, color:'rgba(245,244,239,0.6)' }}>
      Marina Albuquerque · Directora Ejecutiva, Fundación Marajó
    </div>
  </section>
);

const CSCredits = () => (
  <section style={{ padding: '120px 48px', borderBottom: '1px solid rgba(245,244,239,0.08)', display:'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 64 }}>
    <div data-reveal style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>(03) Créditos</div>
    <div data-reveal style={{ display:'flex', flexDirection:'column', gap: 16 }}>
      {[
        ['Dirección creativa', 'Federico Solá'],
        ['Diseño gráfico', 'María Iturralde, Tomás Reyes'],
        ['Tipografía custom', 'Sofía Vassallo'],
        ['Producción', 'Estudio Obscuro'],
      ].map(([k,v]) => (
        <div key={k} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid rgba(245,244,239,0.1)', paddingBottom: 12 }}>
          <span style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>{k}</span>
          <span style={{ fontSize: 14 }}>{v}</span>
        </div>
      ))}
    </div>
    <div data-reveal style={{ display:'flex', flexDirection:'column', gap: 16 }}>
      {[
        ['Año', '2025 — 6 meses'],
        ['Cliente', 'Fundación Marajó'],
        ['Sector', 'Cultura · Sin fines de lucro'],
        ['Reconocimientos', 'Brand New shortlist · 2025'],
      ].map(([k,v]) => (
        <div key={k} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid rgba(245,244,239,0.1)', paddingBottom: 12 }}>
          <span style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>{k}</span>
          <span style={{ fontSize: 14 }}>{v}</span>
        </div>
      ))}
    </div>
  </section>
);

const CSNext = () => (
  <section style={{ padding: '160px 48px 100px', borderBottom: '1px solid rgba(245,244,239,0.08)', display:'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems:'center', position:'relative' }}>
    <div data-reveal>
      <div style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 24 }}>Siguiente proyecto →</div>
      <h2 style={{ ...csStyles.serif, fontSize: 140, lineHeight: 0.9, letterSpacing:'-0.03em', margin: 0 }}>
        Mariposa<br /><em>Nocturna</em>
      </h2>
      <div style={{ ...csStyles.mono, color:'rgba(245,244,239,0.5)', marginTop: 24 }}>Café & Bar · Identidad & empaque · 2025</div>
    </div>
    <div data-reveal>
      <Placeholder label="Mariposa Nocturna — preview" ratio="4/5" tone="dark" />
    </div>
  </section>
);

const CSFooter = () => (
  <footer style={{ padding: '32px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', ...csStyles.mono, color:'rgba(245,244,239,0.5)' }}>
    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
      <LogoMark variant="compact" size="footer" tone="mute" />
      <span>· MMXIX/MMXXVI</span>
    </div>
    <div style={{ display:'flex', gap: 28 }}><span>IG</span><span>BE</span><span>VM</span><span>IN</span></div>
    <span>Buenos Aires · Argentina</span>
  </footer>
);

const CaseStudyPage = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={csStyles.page} className="obscuro-cs">
      <style>{`
        .obscuro-cs [data-reveal]{opacity:0;transform:translateY(36px);transition:opacity 1s ease,transform 1s cubic-bezier(.22,.61,.36,1)}
        .obscuro-cs [data-revealed]{opacity:1;transform:none}
      `}</style>
      <CSNav />
      <CSHero />
      <CSCover />
      <CSBrief />
      <CSGallery />
      <CSQuote />
      <CSCredits />
      <CSNext />
      <CSFooter />
    </div>
  );
};

window.CaseStudyPage = CaseStudyPage;
