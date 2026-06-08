// Variation A — "Editorial Noir"
// Instrument Serif headlines, Geist sans, generous whitespace, quiet luxe.

const aStyles = {
  page: {
    width: '100%',
    background: '#0a0a0a',
    color: '#f5f4ef',
    fontFamily: '"Geist", Helvetica, Arial, sans-serif',
    fontWeight: 300,
    letterSpacing: '0.005em',
    position: 'relative',
    overflow: 'hidden',
  },
  serif: {
    fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
    fontWeight: 400,
  },
  mono: {
    fontFamily: '"Geist Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
};

const ANav = () => (
  <nav style={{
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '28px 56px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(245,244,239,0.06)',
  }}>
    <div style={{ ...aStyles.mono, color: '#f5f4ef' }}>
      Obscuro<span style={{ opacity: 0.4 }}>® Mediaworks · est. 2019</span>
    </div>
    <div style={{ display: 'flex', gap: 36, ...aStyles.mono, color: 'rgba(245,244,239,0.7)' }}>
      <span>Estudio</span><span>Servicios</span><span>Trabajo</span><span>Games</span><span style={{ color:'#f5f4ef' }}>Contacto</span>
    </div>
  </nav>
);

const AHero = () => (
  <section style={{ padding: '180px 56px 120px', position: 'relative', borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', ...aStyles.mono, color: 'rgba(245,244,239,0.5)', marginBottom: 96 }} data-reveal>
      <span>— Estudio de diseño · Games</span>
      <span>Edición MMXXVI / 01</span>
    </div>
    <h1 style={{
      ...aStyles.serif,
      fontSize: 168, lineHeight: 0.92, letterSpacing: '-0.025em',
      margin: '0 0 48px', maxWidth: 1200,
    }} data-reveal>
      Identidad.<br />
      <span style={{ fontStyle: 'italic', color: 'rgba(245,244,239,0.55)' }}>Web.</span>{' '}
      <span style={{ fontStyle: 'italic' }}>Game design.</span>
    </h1>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 80 }}>
      <p style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 440, color: 'rgba(245,244,239,0.7)', margin: 0 }} data-reveal>
        Estudio multidisciplinario. Construimos marcas, sitios y videojuegos para proyectos que se toman en serio su forma.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, ...aStyles.mono, color: '#f5f4ef' }} data-reveal>
        <span>Agenda una conversación</span>
        <span style={{ width: 56, height: 1, background: '#f5f4ef' }} />
        <span style={{ fontSize: 14 }}>→</span>
      </div>
    </div>
  </section>
);

const ASectionHeader = ({ num, label, title }) => (
  <div style={{ padding: '88px 56px 32px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 48, alignItems: 'baseline' }} data-reveal>
    <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.5)' }}>{num} / {label}</div>
    <h2 style={{ ...aStyles.serif, fontSize: 64, lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
      {title}
    </h2>
  </div>
);

const AServices = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <ASectionHeader num="01" label="Servicios" title={<><span style={{ fontStyle: 'italic' }}>Qué</span> hacemos</>} />
    <div style={{ padding: '40px 56px 96px' }}>
      {SERVICES.map((s, i) => (
        <div key={s.num} data-reveal style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 1fr 220px', gap: 48,
          padding: '40px 0', alignItems: 'baseline',
          borderTop: '1px solid rgba(245,244,239,0.10)',
          borderBottom: i === SERVICES.length - 1 ? '1px solid rgba(245,244,239,0.10)' : 'none',
        }}>
          <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.4)' }}>{s.num}</div>
          <div style={{ ...aStyles.serif, fontSize: 44, lineHeight: 1, letterSpacing:'-0.01em' }}>
            {s.title}
            {s.sub && <div style={{ ...aStyles.mono, fontSize: 10, color: '#c9a96e', marginTop: 10, fontFamily: '"Geist Mono", monospace' }}>↳ División Obscuro Games</div>}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(245,244,239,0.7)', margin: 0, maxWidth: 380 }}>{s.desc}</p>
          <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.5)', display:'flex', flexDirection:'column', gap: 6 }}>
            {s.items.map((it) => <span key={it}>— {it}</span>)}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const AProjects = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <ASectionHeader num="02" label="Trabajo seleccionado" title={<>Trabajo <span style={{ fontStyle: 'italic' }}>reciente</span></>} />
    <div style={{ padding: '40px 56px 96px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 56 }}>
      {PROJECTS.slice(0,4).map((p, i) => (
        <div key={p.name} data-reveal>
          <Placeholder label={`${p.name} — ${p.tags[0]}`} ratio={i % 2 === 0 ? '4/5' : '4/3'} tone="dark" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 }}>
            <h3 style={{ ...aStyles.serif, fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>
              {p.name} <span style={{ fontStyle: 'italic', color:'rgba(245,244,239,0.5)', fontSize: 18 }}>— {p.client}</span>
            </h3>
            <span style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.45)' }}>{p.year}</span>
          </div>
          <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.45)', marginTop: 6 }}>
            {p.tags.join(' · ')}
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '0 56px 80px', display: 'flex', justifyContent: 'flex-end' }} data-reveal>
      <span style={{ ...aStyles.mono, color: '#f5f4ef', display:'flex', alignItems:'center', gap: 14 }}>
        Archivo completo <span style={{ width: 40, height: 1, background:'#f5f4ef' }} /> →
      </span>
    </div>
  </section>
);

const AGames = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', position: 'relative', background: '#070707' }}>
    <div style={{ padding: '120px 56px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
      <div data-reveal>
        <div style={{ ...aStyles.mono, color: '#c9a96e', marginBottom: 32 }}>Sub-brand · Obscuro Games</div>
        <h2 style={{ ...aStyles.serif, fontSize: 96, lineHeight: 0.95, letterSpacing: '-0.025em', margin: '0 0 32px' }}>
          También <span style={{ fontStyle:'italic' }}>hacemos</span><br />
          juegos.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(245,244,239,0.7)', maxWidth: 460, margin: '0 0 40px' }}>
          Obscuro Games es nuestra división de videojuegos. Diseño narrativo, dirección de arte y desarrollo para proyectos indie y experiencias interactivas.
        </p>
        <div style={{ display:'flex', gap: 16, ...aStyles.mono }}>
          <span style={{ padding: '12px 18px', border: '1px solid rgba(245,244,239,0.25)' }}>Ver división →</span>
          <span style={{ padding: '12px 18px', color: 'rgba(245,244,239,0.5)' }}>Labyrinth Encounters 2 · 2026</span>
        </div>
      </div>
      <div data-reveal>
        <Placeholder label="Obscuro Games — gameplay reel" ratio="4/5" tone="dark" kind="video" />
      </div>
    </div>
    <div style={{ height: 120 }} />
  </section>
);

const AAbout = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <ASectionHeader num="03" label="Filosofía" title={<><span style={{ fontStyle: 'italic' }}>Sobre</span> nosotros</>} />
    <div style={{ padding: '40px 56px 120px', display:'grid', gridTemplateColumns: '120px 1fr 360px', gap: 48 }} data-reveal>
      <div />
      <p style={{ ...aStyles.serif, fontSize: 36, lineHeight: 1.25, letterSpacing: '-0.01em', margin: 0, color: 'rgba(245,244,239,0.92)' }}>
        Trabajamos en la zona donde el diseño deja de ser decoración y empieza a ser estructura. Ahí, en la sombra entre forma y función, vivimos nosotros.
      </p>
      <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.55)', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
        <span>— Fundado 2019</span>
        <span>— Equipo de 6</span>
        <span>— Buenos Aires / Remoto</span>
        <span>— Trabajo internacional</span>
      </div>
    </div>
  </section>
);

const AContact = () => (
  <section style={{ padding: '160px 56px 80px', borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.5)', marginBottom: 56 }} data-reveal>04 / Contacto</div>
    <h2 style={{ ...aStyles.serif, fontSize: 180, lineHeight: 0.9, letterSpacing: '-0.03em', margin: '0 0 48px', maxWidth: 1300 }} data-reveal>
      <span style={{ fontStyle: 'italic' }}>Cuéntanos</span><br />
      tu proyecto.
    </h2>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 56 }} data-reveal>
      <a style={{ ...aStyles.serif, fontSize: 48, color: '#f5f4ef', textDecoration: 'none', borderBottom: '1px solid rgba(245,244,239,0.3)', paddingBottom: 4 }}>
        hola@obscuro.studio
      </a>
      <div style={{ ...aStyles.mono, color: 'rgba(245,244,239,0.55)', textAlign:'right' }}>
        <div>Buenos Aires</div>
        <div>—34.6°S, 58.3°W</div>
        <div style={{ marginTop: 10, color: 'rgba(245,244,239,0.4)' }}>Respondemos en 48hs hábiles</div>
      </div>
    </div>
  </section>
);

const AFooter = () => (
  <footer style={{ padding: '40px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...aStyles.mono, color: 'rgba(245,244,239,0.5)' }}>
    <span>© Obscuro Mediaworks · 2019 — 2026</span>
    <div style={{ display: 'flex', gap: 28 }}>
      <span>Instagram</span><span>Behance</span><span>Vimeo</span><span>LinkedIn</span>
    </div>
    <span>Diseñado y desarrollado en Buenos Aires</span>
  </footer>
);

const VariationA = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={aStyles.page} className="obscuro-a">
      <style>{`
        .obscuro-a [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .9s ease,transform .9s cubic-bezier(.22,.61,.36,1)}
        .obscuro-a [data-revealed]{opacity:1;transform:none}
      `}</style>
      <ANav />
      <AHero />
      <AServices />
      <AProjects />
      <AGames />
      <AAbout />
      <AContact />
      <AFooter />
    </div>
  );
};

window.VariationA = VariationA;
