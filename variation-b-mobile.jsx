// Mobile version of Variation B — 375px wide, full landing
// Same visual system, adapted scales and stacked layouts.

const bmStyles = {
  page: {
    width: '100%',
    background: '#0a0a0a',
    color: '#f5f4ef',
    fontFamily: '"Space Grotesk", Helvetica, sans-serif',
    fontWeight: 400,
    position: 'relative',
    overflow: 'hidden',
  },
  serif: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300 },
  mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' },
};

const BMNav = () => (
  <nav style={{
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '20px 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
      <LogoMark variant="primary" size="footer" />
    </div>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '1px solid rgba(245,244,239,0.3)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{ width: 14, height: 1, background:'#f5f4ef', boxShadow: '0 -4px 0 #f5f4ef, 0 4px 0 #f5f4ef' }} />
    </div>
  </nav>
);

const BMHero = () => (
  <section style={{ position: 'relative', height: 720, overflow: 'hidden' }}>
    <div style={{ position:'absolute', inset: 0 }} data-reveal>
      <Placeholder label="Reel 2026" ratio="auto" tone="dark" kind="video" style={{ height: '100%' }} noLabel />
    </div>
    <Grain opacity={0.10} />
    <div style={{ position:'absolute', inset:0, background: 'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.15) 30%, rgba(10,10,10,0.95) 100%)' }} />
    <div style={{ position:'absolute', top:0, left:0, right:0, height: 48, background: '#0a0a0a' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height: 56, background: '#0a0a0a' }} />

    <div style={{ position:'absolute', left: 22, right: 22, bottom: 100 }}>
      <div style={{ ...bmStyles.mono, color:'#f5f4ef', marginBottom: 18, display:'flex', gap: 10, alignItems:'center' }} data-reveal>
        <span style={{ width: 6, height: 6, background:'#ff3b1f', borderRadius:'50%', boxShadow:'0 0 10px #ff3b1f' }} />
        <span>REC · BA · MMXXVI</span>
      </div>
      <h1 style={{ ...bmStyles.serif, fontSize: 68, lineHeight: 0.92, letterSpacing: '-0.03em', margin: 0 }} data-reveal>
        Identidad.<br />
        Web. <em style={{ color:'rgba(245,244,239,0.7)' }}>Game</em><br />
        <em>design.</em>
      </h1>
    </div>

    <div style={{ position:'absolute', bottom: 56, left:0, right:0, padding:'10px 0', borderTop:'1px solid rgba(245,244,239,0.15)', borderBottom:'1px solid rgba(245,244,239,0.15)', background:'rgba(10,10,10,0.7)' }}>
      <Marquee duration={38}>
        <span style={{ ...bmStyles.mono, fontSize: 9, color:'rgba(245,244,239,0.8)' }}>
          {'● BRANDING · WEB · GAMECRAFTING · '.repeat(8)}
        </span>
      </Marquee>
    </div>
  </section>
);

const BMMarquee = () => (
  <section style={{ padding: '72px 22px 64px', borderBottom: '1px solid rgba(245,244,239,0.08)' }}>
    <div data-reveal>
      <div style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 20 }}>(01) Filosofía</div>
      <h2 style={{ ...bmStyles.serif, fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0 }}>
        Diseño que <em style={{ color:'rgba(245,244,239,0.6)' }}>escucha</em>. Sistemas que funcionan. Productos que <em>recuerdas</em>.
      </h2>
    </div>
  </section>
);

const BMServices = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '64px 22px' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 36 }}>
      <h2 style={{ ...bmStyles.serif, fontSize: 48, margin: 0, letterSpacing:'-0.02em' }}>Servicios</h2>
      <span style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.5)', fontSize: 9 }}>(02)</span>
    </div>
    {SERVICES.map((s) => (
      <div key={s.num} data-reveal style={{
        padding: '28px 0',
        borderTop: '1px solid rgba(245,244,239,0.12)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', ...bmStyles.mono, color: s.sub ? '#c9a96e' : 'rgba(245,244,239,0.5)', marginBottom: 16 }}>
          <span>{s.num}</span>
          {s.sub && <span>↳ SUB-BRAND</span>}
        </div>
        <h3 style={{ ...bmStyles.serif, fontSize: 40, lineHeight: 0.95, letterSpacing:'-0.02em', margin: '0 0 14px' }}>{s.title}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.6, color:'rgba(245,244,239,0.7)', margin:'0 0 16px' }}>{s.desc}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
          {s.items.map((it) => (
            <span key={it} style={{ ...bmStyles.mono, fontSize: 9, padding: '5px 9px', border:'1px solid rgba(245,244,239,0.2)', borderRadius: 999 }}>{it}</span>
          ))}
        </div>
      </div>
    ))}
  </section>
);

const BMProjects = () => (
  <section id="trabajo" style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '64px 0 0' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 28, padding: '0 22px' }}>
      <div>
        <h2 style={{ ...bmStyles.serif, fontSize: 48, margin: 0, letterSpacing:'-0.02em' }}>Trabajo</h2>
        <div style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.55)', marginTop: 10, fontSize: 9 }}>
          Tres juegos · Audio & Wwise
        </div>
      </div>
      <span style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.5)', fontSize: 9 }}>(03)</span>
    </div>

    {/* Featured */}
    <a data-reveal href={GAMES[0].url} target="_blank" rel="noopener" style={{ position:'relative', display:'block', textDecoration:'none', color:'inherit' }}>
      <Placeholder label={`${GAMES[0].title} — ${GAMES[0].year}`} ratio="4/5" tone="dark" src={GAMES[0].cover} />
      <div style={{ position:'absolute', left: 22, bottom: 20, right: 22 }}>
        <div style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.8)', marginBottom: 8, fontSize: 9 }}>FEATURED · {GAMES[0].genre.toUpperCase()}</div>
        <h3 style={{ ...bmStyles.serif, fontSize: 44, margin: 0, letterSpacing:'-0.02em' }}>{GAMES[0].title}</h3>
        <div style={{ color:'rgba(245,244,239,0.7)', fontSize: 12 }}>{GAMES[0].sub} · {GAMES[0].studio}</div>
      </div>
    </a>

    {GAMES.slice(1).map((g) => (
      <a key={g.slug} data-reveal href={g.url} target="_blank" rel="noopener" style={{ display:'block', textDecoration:'none', color:'inherit', borderTop: '1px solid rgba(245,244,239,0.08)' }}>
        <Placeholder label={`${g.title} — ${g.genre}`} ratio="4/3" tone="dark" src={g.cover} />
        <div style={{ padding: '18px 22px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', ...bmStyles.mono, color:'rgba(245,244,239,0.55)', marginBottom: 6, fontSize: 9 }}>
            <span>{g.studio}</span><span>{g.year}</span>
          </div>
          <h4 style={{ ...bmStyles.serif, fontSize: 30, margin: 0, letterSpacing:'-0.01em' }}>{g.title}</h4>
          <div style={{ fontSize: 12, color:'rgba(245,244,239,0.65)', marginTop: 6 }}>{g.desc}</div>
          <div style={{ ...bmStyles.mono, fontSize: 9, color:'rgba(245,244,239,0.5)', marginTop: 10 }}>
            {g.genre} · {g.role}
          </div>
        </div>
      </a>
    ))}

    <div data-reveal style={{ padding: '28px 22px 56px', borderTop: '1px solid rgba(245,244,239,0.08)' }}>
      <p style={{ ...bmStyles.serif, fontSize: 18, lineHeight: 1.45, margin: '0 0 18px', color:'rgba(245,244,239,0.8)' }}>
        <em>Trabajamos como sound house</em> para estudios independientes.
      </p>
      <a href="#/games" style={{ ...bmStyles.mono, color: '#f5f4ef', textDecoration:'none', fontSize: 9 }}>
        Ver división Gamecrafting →
      </a>
    </div>
  </section>
);

const BMGames = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', background: 'linear-gradient(180deg, #0a0a0a 0%, #100c08 100%)' }}>
    <div style={{ padding: '72px 22px 32px' }}>
      <div data-reveal style={{ ...bmStyles.mono, color: '#c9a96e', marginBottom: 18, display:'flex', alignItems:'center', gap: 10 }}>
        <span style={{ width: 18, height: 1, background: '#c9a96e' }} />
        <span>OBSCURO / GAMECRAFTING</span>
      </div>
      <h2 data-reveal style={{ ...bmStyles.serif, fontSize: 60, lineHeight: 0.92, letterSpacing:'-0.025em', margin: '0 0 22px' }}>
        También construimos <em style={{ color:'#c9a96e' }}>juegos</em>.
      </h2>
      <p data-reveal style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(245,244,239,0.72)', margin: '0 0 32px' }}>
        Nuestra división de videojuegos. Audio, diseño de sonido e implementación con Wwise para estudios indie.
      </p>
    </div>
    <div data-reveal style={{ position:'relative' }}>
      <VHSFrame label="REC" timecode="00:04:12:08" intensity={0.8}>
        <Placeholder label="Labyrinth Encounters 2 — reel 0.4" ratio="3/4" tone="dark" kind="video" />
      </VHSFrame>
      <div style={{ position:'absolute', bottom: 14, right: 14, ...bmStyles.mono, fontSize: 9, color:'#f5f4ef', background: 'rgba(0,0,0,0.6)', padding: '5px 8px', zIndex: 2 }}>
        IN DEV · 2026
      </div>
    </div>
    <div style={{ padding: '32px 22px 64px' }}>
      <a href="#/games" style={{ ...bmStyles.mono, padding: '12px 18px', border: '1px solid #c9a96e', color: '#c9a96e', borderRadius: 999, display:'inline-block', textDecoration: 'none' }}>
        Visitar Obscuro Gamecrafting →
      </a>
    </div>
  </section>
);

const BMAbout = () => (
  <section style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '64px 22px' }}>
    <div data-reveal style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 24 }}>(04) El estudio</div>
    <p data-reveal style={{ ...bmStyles.serif, fontSize: 28, lineHeight: 1.25, margin: '0 0 36px' }}>
      Somos un estudio pequeño de Buenos Aires. Trabajamos cerca, despacio, y solo en proyectos donde podemos meter las manos en todo.
    </p>
    <div data-reveal style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap: 24 }}>
      {[['07','años'],['42','proyectos'],['06','personas'],['12','países']].map(([n,l]) => (
        <div key={l} style={{ borderTop:'1px solid rgba(245,244,239,0.15)', paddingTop: 12 }}>
          <div style={{ ...bmStyles.serif, fontSize: 52, lineHeight: 1, letterSpacing:'-0.02em' }}>{n}</div>
          <div style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.55)', marginTop: 6 }}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

const BMContact = () => (
  <section style={{ padding: '88px 22px 56px', borderBottom: '1px solid rgba(245,244,239,0.08)', textAlign:'center', position:'relative' }}>
    <Grain opacity={0.05} />
    <div data-reveal style={{ ...bmStyles.mono, color:'rgba(245,244,239,0.5)', marginBottom: 28 }}>(05) Contacto</div>
    <h2 data-reveal style={{ ...bmStyles.serif, fontSize: 92, lineHeight: 0.88, letterSpacing:'-0.035em', margin: '0 0 36px' }}>
      <em>¿Empezamos?</em>
    </h2>
    <a data-reveal style={{ ...bmStyles.serif, fontSize: 28, color:'#f5f4ef', textDecoration:'none', borderBottom: '1px solid rgba(245,244,239,0.5)', paddingBottom: 4, display:'inline-block' }}>
      hola@obscuromediaworks.com.ar
    </a>
    <div data-reveal style={{ marginTop: 40, ...bmStyles.mono, color:'rgba(245,244,239,0.5)', display:'flex', flexDirection:'column', gap: 8, fontSize: 9 }}>
      <span>Buenos Aires · ARG</span>
      <span>Respuesta en 48hs hábiles</span>
    </div>
  </section>
);

const BMFooter = () => (
  <footer style={{ padding: '22px', display:'flex', justifyContent:'space-between', alignItems:'center', ...bmStyles.mono, color:'rgba(245,244,239,0.5)', fontSize: 9 }}>
    <span>© Obscuro 2026</span>
    <div style={{ display:'flex', gap: 16 }}>
      <span>IG</span><span>BE</span><span>VM</span>
    </div>
  </footer>
);

const VariationBMobile = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={bmStyles.page} className="obscuro-bm">
      <style>{`
        .obscuro-bm [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .9s ease,transform .9s cubic-bezier(.22,.61,.36,1)}
        .obscuro-bm [data-revealed]{opacity:1;transform:none}
      `}</style>
      <BMNav />
      <BMHero />
      <BMMarquee />
      <BMServices />
      <BMProjects />
      <BMGames />
      <BMAbout />
      <BMContact />
      <BMFooter />
    </div>
  );
};

window.VariationBMobile = VariationBMobile;
