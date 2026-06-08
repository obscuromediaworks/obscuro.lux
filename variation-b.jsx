// Variation B — "Cinematográfico"
// Cormorant Garamond + Space Grotesk, big imagery, filmstrip, dramatic scale.

const bStyles = {
  page: {
    width: '100%',
    background: '#0a0a0a',
    color: '#f5f4ef',
    fontFamily: '"Space Grotesk", Helvetica, sans-serif',
    fontWeight: 400,
    position: 'relative',
    overflow: 'hidden',
  },
  serif: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 300,
  },
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
};

const BNav = () => (
  <nav style={{
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '24px 48px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
      <LogoMark variant="primary" size="nav" align="center" />
    </div>
    <div style={{ display: 'flex', gap: 32, ...bStyles.mono, fontSize: 11, color: 'rgba(245,244,239,0.7)' }}>
      <a href="#trabajo" style={{ color: 'inherit', textDecoration: 'none' }}>Index</a>
      <a href="#estudio" style={{ color: 'inherit', textDecoration: 'none' }}>Estudio</a>
      <a href="#/games" style={{ color: 'inherit', textDecoration: 'none' }}>Gamecrafting</a>
      <a href="#contacto" style={{ color:'#f5f4ef', padding: '6px 14px', border: '1px solid #f5f4ef', borderRadius: 999, textDecoration: 'none' }}>Iniciar proyecto</a>
    </div>
  </nav>
);

const BHero = () => (
  <section style={{ position: 'relative', height: 980, overflow: 'hidden' }}>
    {/* Cinematic letterbox image */}
    <div style={{ position:'absolute', inset: 0 }} data-reveal>
      <Placeholder label="Reel 2026 — loop principal" ratio="auto" tone="dark" kind="video" style={{ height: '100%' }} noLabel />
    </div>
    <Grain opacity={0.10} />
    <div style={{ position:'absolute', inset:0, background: 'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.85) 100%)' }} />

    {/* Letterbox bars */}
    <div style={{ position:'absolute', top:0, left:0, right:0, height: 64, background: '#0a0a0a' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height: 80, background: '#0a0a0a' }} />

    {/* Hero text */}
    <div style={{ position:'absolute', left: 48, right: 48, bottom: 140 }}>
      <div style={{ ...bStyles.mono, color: '#f5f4ef', marginBottom: 24, display:'flex', gap: 12, alignItems:'center' }} data-reveal>
        <span style={{ width: 8, height: 8, background:'#ff3b1f', borderRadius:'50%', boxShadow:'0 0 12px #ff3b1f' }} />
        <span>REC · BUENOS AIRES · MMXXVI</span>
      </div>
      <h1 style={{ ...bStyles.serif, fontSize: 210, lineHeight: 0.86, letterSpacing: '-0.035em', margin: 0, maxWidth: 1380 }} data-reveal>
        Identidad.<br />
        Web. <em style={{ fontFamily: '"Cormorant Garamond", serif', color:'rgba(245,244,239,0.7)' }}>Game</em><br />
        <em>design.</em>
      </h1>
    </div>

    {/* Ticker */}
    <div style={{ position:'absolute', bottom: 80, left:0, right:0, padding:'14px 0', borderTop:'1px solid rgba(245,244,239,0.15)', borderBottom:'1px solid rgba(245,244,239,0.15)', background:'rgba(10,10,10,0.7)' }}>
      <Marquee duration={50}>
        <span style={{ ...bStyles.mono, color:'rgba(245,244,239,0.8)' }}>
          {'● BRANDING · DISEÑO WEB · OBSCURO GAMECRAFTING · DIRECCIÓN DE ARTE · NARRATIVA · '.repeat(4)}
        </span>
      </Marquee>
    </div>
  </section>
);

const BMarquee = () => (
  <section style={{ padding: '140px 0 120px', borderBottom: '1px solid rgba(245,244,239,0.08)', overflow:'hidden' }}>
    <div data-reveal>
      <div style={{ ...bStyles.mono, color: 'rgba(245,244,239,0.5)', padding: '0 48px 40px', display:'flex', justifyContent:'space-between' }}>
        <span>(01) Filosofía</span>
        <span>Tres frases · una idea</span>
      </div>
      <h2 style={{ ...bStyles.serif, fontSize: 120, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0, padding: '0 48px', maxWidth: 1380 }}>
        Diseño que <em style={{ color:'rgba(245,244,239,0.6)' }}>escucha</em>. Sistemas que funcionan. Productos que <em>recuerdas</em>.
      </h2>
    </div>
  </section>
);

const BServices = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '120px 48px' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 72 }}>
      <h2 style={{ ...bStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.02em' }}>Servicios</h2>
      <span style={{ ...bStyles.mono, color:'rgba(245,244,239,0.5)' }}>(02) — Tres prácticas</span>
    </div>
    <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background:'rgba(245,244,239,0.08)', border:'1px solid rgba(245,244,239,0.08)' }}>
      {SERVICES.map((s, i) => (
        <div key={s.num} data-reveal style={{ background:'#0a0a0a', padding: '48px 36px 36px', minHeight: 440, display:'flex', flexDirection:'column', position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', ...bStyles.mono, color: s.sub ? 'var(--accent)' : 'rgba(245,244,239,0.5)', marginBottom: 56 }}>
            <span>{s.num}</span>
            {s.sub && <span>↳ SUB-BRAND</span>}
          </div>
          <h3 style={{ ...bStyles.serif, fontSize: 68, lineHeight: 0.95, letterSpacing:'-0.02em', margin: '0 0 28px' }}>{s.title}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color:'rgba(245,244,239,0.65)', margin:'0 0 32px', maxWidth: 320 }}>{s.desc}</p>
          <div style={{ marginTop: 'auto', display:'flex', flexWrap:'wrap', gap: 8 }}>
            {s.items.map((it) => (
              <span key={it} style={{ ...bStyles.mono, fontSize: 10, padding: '6px 10px', border:'1px solid rgba(245,244,239,0.2)', borderRadius: 999 }}>{it}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const BProjects = () => (
  <section id="trabajo" style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '120px 0 0' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 60, padding: '0 48px' }}>
      <div>
        <h2 style={{ ...bStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.02em' }}>Trabajo</h2>
        <div style={{ ...bStyles.mono, color:'rgba(245,244,239,0.55)', marginTop: 18 }}>
          Tres juegos publicados · Audio & Wwise como especialidad
        </div>
      </div>
      <span style={{ ...bStyles.mono, color:'rgba(245,244,239,0.5)' }}>(03)</span>
    </div>

    {/* Featured game — full bleed */}
    <a data-reveal href={GAMES[0].url} target="_blank" rel="noopener" style={{ display:'block', textDecoration:'none', color:'inherit', position:'relative' }}>
      <Placeholder label={`${GAMES[0].title} — ${GAMES[0].sub} · ${GAMES[0].year}`} ratio="21/9" tone="dark" src={GAMES[0].coverWide || GAMES[0].cover} />
      <div style={{ position:'absolute', left: 48, bottom: 32, right: 48, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ ...bStyles.mono, color:'rgba(245,244,239,0.7)', marginBottom: 12 }}>FEATURED · {GAMES[0].genre.toUpperCase()}</div>
          <h3 style={{ ...bStyles.serif, fontSize: 88, margin: 0, letterSpacing:'-0.02em' }}>{GAMES[0].title}</h3>
          <div style={{ color:'rgba(245,244,239,0.7)', fontSize: 16 }}>{GAMES[0].sub} — {GAMES[0].studio} · {GAMES[0].year}</div>
        </div>
        <span style={{ ...bStyles.mono, color: '#f5f4ef' }}>Jugar ↗</span>
      </div>
    </a>

    {/* Other games — 2-up */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 0, borderTop:'1px solid rgba(245,244,239,0.08)' }}>
      {GAMES.slice(1).map((g, i) => (
        <a key={g.slug} data-reveal href={g.url} target="_blank" rel="noopener" style={{
          display:'block', textDecoration:'none', color:'inherit',
          borderRight: i === 0 ? '1px solid rgba(245,244,239,0.08)' : 'none',
        }}>
          <Placeholder label={`${g.title} — ${g.genre}`} ratio="16/10" tone="dark" src={g.cover} />
          <div style={{ padding: '28px 32px 40px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', ...bStyles.mono, color:'rgba(245,244,239,0.55)', marginBottom: 12 }}>
              <span>{g.studio}</span><span>{g.year}</span>
            </div>
            <h4 style={{ ...bStyles.serif, fontSize: 48, margin: '0 0 8px', letterSpacing:'-0.015em' }}>{g.title}</h4>
            <div style={{ fontSize: 14, color:'rgba(245,244,239,0.65)', marginBottom: 14 }}>{g.desc}</div>
            <div style={{ ...bStyles.mono, fontSize: 10, color:'rgba(245,244,239,0.5)', display:'flex', gap: 14, alignItems:'center' }}>
              <span>{g.genre}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{g.role}</span>
            </div>
          </div>
        </a>
      ))}
    </div>

    <div data-reveal style={{ padding: '40px 48px 100px', display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:'1px solid rgba(245,244,239,0.08)' }}>
      <p style={{ ...bStyles.serif, fontSize: 22, lineHeight: 1.5, margin: 0, maxWidth: 640, color:'rgba(245,244,239,0.8)' }}>
        <em>Trabajamos como sound house</em> para estudios independientes — diseño de audio, integración con Wwise, foley y producción musical.
      </p>
      <a href="#/games" style={{ ...bStyles.mono, color: '#f5f4ef', display:'flex', alignItems:'center', gap: 14, textDecoration:'none' }}>
        Ver división Games <span style={{ width: 40, height: 1, background:'#f5f4ef' }} /> →
      </a>
    </div>
  </section>
);

const BGames = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', position:'relative', background: 'linear-gradient(180deg, #0a0a0a 0%, #100c08 100%)' }}>
    <div style={{ padding: '140px 48px 0', display:'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}>
      <div data-reveal>
        <div style={{ ...bStyles.mono, color: 'var(--accent)', marginBottom: 28, display:'flex', alignItems:'center', gap: 12 }}>
          <span style={{ width: 28, height: 1, background: 'var(--accent)' }} />
          <span>OBSCURO / GAMECRAFTING — sub-brand</span>
        </div>
        <h2 style={{ ...bStyles.serif, fontSize: 140, lineHeight: 0.9, letterSpacing:'-0.025em', margin: '0 0 32px' }}>
          También construimos <em style={{ color:'var(--accent)' }}>juegos</em>.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(245,244,239,0.72)', maxWidth: 500, margin: '0 0 48px' }}>
          Obscuro Gamecrafting es nuestra división de videojuegos. Audio, diseño de sonido, implementación con Wwise y co-desarrollo para estudios indie.
        </p>
        <div style={{ display:'flex', gap: 16 }}>
          <a href="#/games" style={{ ...bStyles.mono, padding: '14px 22px', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 999, textDecoration: 'none' }}>Visitar Obscuro Gamecrafting →</a>
        </div>
      </div>
      <div data-reveal style={{ position:'relative' }}>
        <VHSFrame label="REC" timecode="00:04:12:08" intensity={0.85}>
          <Placeholder label="Labyrinth Encounters 2 — gameplay reel 0.4" ratio="3/4" tone="dark" kind="video" />
        </VHSFrame>
        <div style={{ position:'absolute', bottom: 16, right: 16, ...bStyles.mono, fontSize: 10, color:'#f5f4ef', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', backdropFilter:'blur(4px)', zIndex: 2 }}>
          IN DEV · 2026
        </div>
      </div>
    </div>
    <div style={{ height: 140 }} />
  </section>
);

const BAbout = () => (
  <section id="estudio" style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '140px 48px' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 72 }}>
      <h2 style={{ ...bStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.02em' }}>El estudio</h2>
      <span style={{ ...bStyles.mono, color:'rgba(245,244,239,0.5)' }}>(04)</span>
    </div>
    <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
      <p data-reveal style={{ ...bStyles.serif, fontSize: 40, lineHeight: 1.25, margin: 0 }}>
        Somos un estudio pequeño de Buenos Aires. Trabajamos cerca, despacio, y solo en proyectos donde podemos meter las manos en todo.
      </p>
      <div data-reveal style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap: 40 }}>
        {[
          ['07', 'años'],
          ['42', 'proyectos'],
          ['6', 'personas'],
          ['12', 'países'],
        ].map(([n, l]) => (
          <div key={l} style={{ borderTop:'1px solid rgba(245,244,239,0.15)', paddingTop: 16 }}>
            <div style={{ ...bStyles.serif, fontSize: 84, lineHeight: 1, letterSpacing:'-0.02em' }}>{n}</div>
            <div style={{ ...bStyles.mono, color:'rgba(245,244,239,0.55)', marginTop: 8 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const BContact = () => (
  <section id="contacto" style={{ padding: '160px 48px 80px', borderBottom: '1px solid rgba(245,244,239,0.08)', textAlign:'center', position:'relative' }}>
    <Grain opacity={0.05} />
    <div style={{ ...bStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 56 }} data-reveal>(05) — Contacto</div>
    <h2 data-reveal style={{ ...bStyles.serif, fontSize: 220, lineHeight: 0.88, letterSpacing:'-0.035em', margin: '0 0 56px' }}>
      <em>¿Empezamos?</em>
    </h2>
    <a data-reveal style={{ ...bStyles.serif, fontSize: 56, color:'#f5f4ef', textDecoration:'none', borderBottom: '1px solid rgba(245,244,239,0.5)', paddingBottom: 6 }}>
      hola@obscuromediaworks.com.ar
    </a>
    <div data-reveal style={{ marginTop: 72, ...bStyles.mono, color:'rgba(245,244,239,0.5)', display:'flex', justifyContent:'center', gap: 40 }}>
      <span>Buenos Aires · ARG</span>
      <span>+54 11 0000 0000</span>
      <span>Respuesta en 48hs</span>
    </div>
  </section>
);

const BFooter = () => (
  <footer style={{ padding: '32px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', ...bStyles.mono, color:'rgba(245,244,239,0.5)' }}>
    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
      <LogoMark variant="compact" size="footer" tone="mute" />
      <span>· MMXIX/MMXXVI</span>
    </div>
    <div style={{ display:'flex', gap: 28 }}>
      <span>IG</span><span>BE</span><span>VM</span><span>IN</span>
    </div>
    <span>Buenos Aires · Argentina</span>
  </footer>
);

const VariationB = ({ accent = '#c9a96e', accentName = 'gold' }) => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={{ ...bStyles.page, '--accent': accent }} className={`obscuro-b obscuro-b-${accentName}`}>
      <style>{`
        .obscuro-b [data-reveal]{opacity:0;transform:translateY(40px);transition:opacity 1s ease,transform 1s cubic-bezier(.22,.61,.36,1)}
        .obscuro-b [data-revealed]{opacity:1;transform:none}
      `}</style>
      <BNav />
      <BHero />
      <BMarquee />
      <BServices />
      <BProjects />
      <BGames />
      <BAbout />
      <BContact />
      <BFooter />
    </div>
  );
};

window.VariationB = VariationB;
