// Page — Obscuro Gamecrafting sub-brand landing. Darker, more atmospheric than the main site.
// Acento dorado, tone más jugado, sigue siendo el mismo idioma visual.

const gmStyles = {
  page: { width: '100%', background: '#070504', color: '#f5e9d4', fontFamily: '"Space Grotesk", Helvetica, sans-serif', fontWeight: 400, position: 'relative', overflow: 'hidden' },
  serif: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300 },
  mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' },
};

const accent = '#c9a96e';

const GMNav = () => (
  <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
      <LogoMark variant="games" size="nav" align="center" />
    </div>
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', ...gmStyles.mono, fontSize: 11, color: 'rgba(245,233,212,0.7)' }}>
      <span>Proyectos</span>
      <span>Equipo</span>
      <a href="#/lux" style={{ color:'rgba(245,233,212,0.7)', textDecoration: 'none' }}>Identidad &amp; Web ↗</a>
      <span style={{ color: accent, padding: '6px 14px', border: `1px solid ${accent}`, borderRadius: 999 }}>Press kit</span>
    </div>
  </nav>
);

const GMHero = () => (
  <section style={{ position:'relative', height: 1080, overflow: 'hidden' }}>
    <div style={{ position:'absolute', inset: 0 }} data-reveal>
      <VHSFrame label="PLAY" timecode="00:12:34:21" intensity={1} style={{ height: '100%' }}>
        <div style={{ position:'relative', width: '100%', height: '100%', background: '#070504', overflow: 'hidden' }}>
          <BgVideo
            src={[
              { src: 'assets/le2_back_video.webm', type: 'video/webm' },
              { src: 'assets/le2_back_video.mp4',  type: 'video/mp4'  },
            ]}
            filter="saturate(0.75) contrast(1.05) blur(2px)"
          />
        </div>
      </VHSFrame>
    </div>
    <Grain opacity={0.14} />
    <div style={{ position:'absolute', inset:0, background: 'radial-gradient(ellipse at 60% 40%, rgba(201,169,110,0.10) 0%, transparent 60%), linear-gradient(180deg, rgba(7,5,4,0.35) 0%, rgba(7,5,4,0.10) 40%, rgba(7,5,4,0.92) 100%)' }} />

    <div style={{ position:'absolute', top:0, left:0, right:0, height: 64, background: '#070504' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height: 80, background: '#070504' }} />

    <div style={{ position:'absolute', left: 48, right: 48, top: 200 }}>
      <div style={{ ...gmStyles.mono, color: accent, marginBottom: 24 }} data-reveal>
        Obscuro Gamecrafting · División de desarrollo · 2024 —
      </div>
    </div>

    <div style={{ position:'absolute', left: 48, right: 48, bottom: 160 }}>
      <h1 data-reveal style={{ ...gmStyles.serif, fontSize: 280, lineHeight: 0.85, letterSpacing: '-0.04em', margin: 0 }}>
        Hacemos<br />
        <em style={{ color: accent }}>juegos</em>.
      </h1>
    </div>

    <div style={{ position:'absolute', bottom: 80, left:0, right:0, padding:'14px 0', borderTop: `1px solid rgba(201,169,110,0.25)`, borderBottom: `1px solid rgba(201,169,110,0.25)`, background:'rgba(7,5,4,0.7)' }}>
      <Marquee duration={55} direction="right">
        <span style={{ ...gmStyles.mono, color: accent }}>
          {'◆ HORROR PSICOLÓGICO · UNITY 6 · HDRP · WWISE · IN DEV · '.repeat(4)}
        </span>
      </Marquee>
    </div>
  </section>
);

const GMIntro = () => (
  <section style={{ padding: '160px 48px 120px', borderBottom: '1px solid rgba(245,233,212,0.08)', display:'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems:'flex-start' }}>
    <div data-reveal>
      <div style={{ ...gmStyles.mono, color: accent, marginBottom: 24 }}>(01) Manifiesto</div>
      <h2 style={{ ...gmStyles.serif, fontSize: 80, lineHeight: 0.95, letterSpacing:'-0.025em', margin: 0 }}>
        Audio que <em>recuerdas</em>. Mundos que <em>importan</em>.
      </h2>
    </div>
    <div data-reveal style={{ display:'flex', flexDirection:'column', gap: 24, paddingTop: 24 }}>
      <p style={{ ...gmStyles.serif, fontSize: 28, lineHeight: 1.4, margin: 0 }}>
        Somos un equipo independiente que crea experiencias inmersivas en la intersección de narrativa, diseño de sonido y mecánicas. <em>El audio</em> —su diseño, implementación con middleware y producción— es nuestro diferencial.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.75, color:'rgba(245,233,212,0.7)', margin: 0 }}>
        Trabajamos como sound house y co-desarrollo para estudios indie. Cuando no estamos en eso, hacemos lo nuestro: ahora mismo, <strong style={{ color: '#f5e9d4', fontWeight: 400 }}>Labyrinth Encounters 2</strong>.
      </p>
    </div>
  </section>
);

const GMProject = () => (
  <section style={{ borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    {/* Title block with ambient video background */}
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <VHSFrame label="REC" timecode="00:04:12:08" intensity={0.75} showTimecode={false} style={{ height: '100%' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', background: '#070504' }}>
            <BgVideo
              src={[
                { src: 'assets/le2_back_video.webm', type: 'video/webm' },
                { src: 'assets/le2_back_video.mp4',  type: 'video/mp4'  },
              ]}
              filter="saturate(0.7) contrast(1.05) blur(3px)"
            />
          </div>
        </VHSFrame>
      </div>
      <Grain opacity={0.10} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(7,5,4,0.0) 0%, rgba(7,5,4,0.55) 70%), linear-gradient(180deg, rgba(7,5,4,0.55) 0%, rgba(7,5,4,0.30) 35%, rgba(7,5,4,0.85) 100%)' }} />

      <div data-reveal style={{ position: 'relative', padding: '160px 48px 140px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div>
          <div style={{ ...gmStyles.mono, color: accent, marginBottom: 18 }}>(02) Proyecto actual</div>
          <h2 style={{ ...gmStyles.serif, fontSize: 168, lineHeight: 0.85, letterSpacing:'-0.035em', margin: 0 }}>
            Labyrinth<br /><em>Encounters 2.</em>
          </h2>
          <div style={{ ...gmStyles.mono, color:'rgba(245,233,212,0.6)', marginTop: 18 }}>
            Secuela de Labyrinth Encounters · <span style={{ textDecoration:'underline', textUnderlineOffset: 4 }}>2024</span>
          </div>
        </div>
        <div style={{ textAlign:'right', display:'flex', flexDirection:'column', gap: 6, ...gmStyles.mono, color:'rgba(245,233,212,0.7)' }}>
          <span style={{ color: accent }}>● IN DEVELOPMENT</span>
          <span>Vertical slice · greyboxing</span>
          <span>Steam wishlist soon</span>
        </div>
      </div>
    </div>

    <div style={{ padding: '80px 48px', display:'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems:'flex-start' }}>
      <div data-reveal>
        <div style={{ ...gmStyles.mono, color:'rgba(245,233,212,0.5)', marginBottom: 18 }}>Pitch</div>
        <p style={{ ...gmStyles.serif, fontSize: 44, lineHeight: 1.2, margin: '0 0 24px', letterSpacing:'-0.01em' }}>
          <em>"Un laberinto que cambia cuando no estás mirando."</em>
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.75, color:'rgba(245,233,212,0.75)', margin: 0 }}>
          Horror psicológico en primera persona ambientado en una selva del noreste argentino —entre Misiones y el Chaco. Sin enemigos. Sin jumpscares. Horror perceptivo: lo que cambia es el lugar, y el jugador.
        </p>
      </div>
      <div data-reveal style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[
          ['Género', 'Horror psicológico'],
          ['Perspectiva', 'Primera persona'],
          ['Engine', 'Unity 6 · HDRP'],
          ['Audio', 'Wwise'],
          ['Plataforma', 'PC (Steam)'],
          ['Equipo', '3 personas core'],
          ['Estado', 'Vertical slice'],
          ['Próximo hito', 'Demo & wishlist'],
        ].map(([k,v]) => (
          <div key={k} style={{ borderTop: `1px solid rgba(245,233,212,0.15)`, paddingTop: 14 }}>
            <div style={{ ...gmStyles.mono, fontSize: 10, color:'rgba(245,233,212,0.5)', marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 14 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display:'grid', gridTemplateColumns: '2fr 1fr', gap: 0, borderTop:'1px solid rgba(245,233,212,0.08)' }}>
      <div data-reveal style={{ borderRight:'1px solid rgba(245,233,212,0.08)' }}>
        <Placeholder label="LE2 — dirección de arte, paleta selva/noche" ratio="16/10" tone="dark" />
      </div>
      <div data-reveal>
        <Placeholder label="Concept — laberinto en estado uno" ratio="auto" tone="dark" style={{ height: '100%' }} />
      </div>
    </div>

    {/* Pillars */}
    <div data-reveal style={{ padding: '100px 48px 40px' }}>
      <div style={{ ...gmStyles.mono, color: accent, marginBottom: 24 }}>Pilares de diseño</div>
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1px solid rgba(245,233,212,0.12)' }}>
        {[
          { n: '01', t: 'Sin enemigos', d: 'El miedo no viene de algo que te persigue. Viene del lugar.' },
          { n: '02', t: 'Sin jumpscares', d: 'Tensión sostenida. El horror se construye, no se grita.' },
          { n: '03', t: 'Horror perceptivo', d: 'El laberinto cambia cuando dejas de mirarlo. Tu memoria es el enemigo.' },
        ].map((p, i) => (
          <div key={p.n} style={{ padding: '36px 28px', borderRight: i < 2 ? '1px solid rgba(245,233,212,0.12)' : 'none' }}>
            <div style={{ ...gmStyles.mono, color: accent, marginBottom: 24 }}>{p.n}</div>
            <h4 style={{ ...gmStyles.serif, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px', letterSpacing:'-0.015em' }}>{p.t}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.65, color:'rgba(245,233,212,0.7)', margin: 0 }}>{p.d}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Predecessor strip — links to the catalog below */}
    <div data-reveal style={{ padding: '40px 48px 100px' }}>
      <a href="#catalogo" style={{ display:'block', textDecoration:'none', color:'inherit' }}>
        <div style={{ display:'grid', gridTemplateColumns: '200px 1fr 200px', gap: 32, alignItems:'center', border:'1px solid rgba(245,233,212,0.12)', padding: '24px 28px' }}>
          <div style={{ ...gmStyles.mono, fontSize: 10, color: 'rgba(245,233,212,0.5)' }}>↳ EL PREDECESOR</div>
          <div>
            <div style={{ ...gmStyles.serif, fontSize: 22, letterSpacing:'-0.01em' }}>Labyrinth Encounters <span style={{ color:'rgba(245,233,212,0.5)' }}>— 2024</span></div>
            <div style={{ fontSize: 12, color:'rgba(245,233,212,0.55)', marginTop: 4 }}>El primer laberinto. Jugable y gratis en itch.io.</div>
          </div>
          <div style={{ ...gmStyles.mono, fontSize: 11, color: accent, textAlign:'right' }}>Ver catálogo ↓</div>
        </div>
      </a>
    </div>
  </section>
);

const GMCatalog = () => (
  <section id="catalogo" style={{ borderBottom: '1px solid rgba(245,233,212,0.08)', padding: '120px 0 0' }}>
    <div data-reveal style={{ padding: '0 48px 56px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
      <div>
        <h2 style={{ ...gmStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.025em' }}>Catálogo</h2>
        <div style={{ ...gmStyles.mono, color: 'rgba(245,233,212,0.55)', marginTop: 18 }}>
          Tres juegos publicados · Diseño de audio & Wwise
        </div>
      </div>
      <span style={{ ...gmStyles.mono, color: accent }}>(03) — Juegos</span>
    </div>

    <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid rgba(245,233,212,0.08)' }}>
      {GAMES.map((g, i) => (
        <a key={g.slug} data-reveal href={g.url} target="_blank" rel="noopener" style={{
          display:'block', textDecoration:'none', color:'inherit',
          borderRight: i < GAMES.length - 1 ? '1px solid rgba(245,233,212,0.08)' : 'none',
        }}>
          <Placeholder label={`${g.title} — ${g.genre}`} ratio="4/5" tone="dark" src={g.cover} />
          <div style={{ padding: '28px 28px 40px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', ...gmStyles.mono, color:'rgba(245,233,212,0.55)', marginBottom: 12, fontSize: 10 }}>
              <span>{g.studio}</span>
              <span>{g.year}</span>
            </div>
            <h3 style={{ ...gmStyles.serif, fontSize: 40, margin: '0 0 6px', letterSpacing:'-0.015em', lineHeight: 1 }}>{g.title}</h3>
            <div style={{ ...gmStyles.mono, color: accent, fontSize: 10, marginBottom: 14 }}>{g.genre}</div>
            <p style={{ fontSize: 13, lineHeight: 1.65, color:'rgba(245,233,212,0.7)', margin: '0 0 18px' }}>{g.desc}</p>
            <div style={{ ...gmStyles.mono, color:'rgba(245,233,212,0.55)', fontSize: 10, display:'flex', justifyContent:'space-between' }}>
              <span>{g.role}</span>
              <span style={{ color: '#f5e9d4' }}>Jugar ↗</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

const GMServices = () => (
  <section style={{ padding: '140px 48px 80px', borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 56 }}>
      <h2 style={{ ...gmStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.025em' }}>Servicios</h2>
      <span style={{ ...gmStyles.mono, color: accent }}>(04) — Sound house</span>
    </div>
    <p data-reveal style={{ ...gmStyles.serif, fontSize: 28, lineHeight: 1.4, maxWidth: 880, margin: '0 0 64px', color: 'rgba(245,233,212,0.8)' }}>
      Trabajamos como sound house para estudios independientes. Implementamos sistemas de audio con middleware (Wwise) que hacen que el juego suene como debe sonar.
    </p>
    <div style={{ display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, background:'rgba(245,233,212,0.08)', border:'1px solid rgba(245,233,212,0.08)' }}>
      {[
        { num: '01', t: 'Diseño de audio', d: 'Diseño sonoro original, foley y SFX a medida. La paleta sonora de tu juego, de cero.' },
        { num: '02', t: 'Implementación Wwise', d: 'Integración completa de Wwise + Unity / Unreal. Sistemas dinámicos, capas y mezclas en tiempo real.' },
        { num: '03', t: 'Producción musical', d: 'Score original o curaduría sonora. Coordinación con compositores externos cuando hace falta.' },
        { num: '04', t: 'Co-desarrollo', d: 'Programación, integración y producción cuando necesitás un equipo que entre y resuelva.' },
      ].map((s) => (
        <div key={s.num} data-reveal style={{ background: '#070504', padding: '36px 28px', minHeight: 320, display:'flex', flexDirection:'column' }}>
          <div style={{ ...gmStyles.mono, color: accent, marginBottom: 32 }}>{s.num}</div>
          <h3 style={{ ...gmStyles.serif, fontSize: 36, lineHeight: 1.05, letterSpacing:'-0.015em', margin: '0 0 16px' }}>{s.t}</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color:'rgba(245,233,212,0.65)', margin: 0 }}>{s.d}</p>
        </div>
      ))}
    </div>
  </section>
);

const GMTeam = () => (
  <section style={{ padding: '140px 48px', borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 56 }}>
      <h2 style={{ ...gmStyles.serif, fontSize: 96, margin: 0, letterSpacing:'-0.025em' }}>Colaboración</h2>
      <span style={{ ...gmStyles.mono, color: accent }}>(05) — 3 estudios</span>
    </div>
    <p data-reveal style={{ ...gmStyles.serif, fontSize: 28, lineHeight: 1.4, maxWidth: 880, margin: '0 0 64px', color: 'rgba(245,233,212,0.8)' }}>
      LE2 se construye como colaboración entre tres estudios independientes. Cada uno aporta su disciplina; nadie hace de todo.
    </p>
    <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background:'rgba(245,233,212,0.08)', border:'1px solid rgba(245,233,212,0.08)' }}>
      {[
        {
          mark: <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent }} />,
          name: 'Obscuro Mediaworks',
          role: 'Estudio anfitrión',
          desc: 'Programación, integración en Unity, implementación de audio (Wwise), foley y producción.',
          loc: 'Buenos Aires · ARG',
        },
        {
          mark: <div style={{ width: 36, height: 36, border: `2px solid ${accent}`, transform: 'rotate(45deg)' }} />,
          name: 'Fox Fury',
          role: 'Co-creador · Labyrinth Encounters',
          desc: '3D, level design e historia. Responsable del primer Labyrinth Encounters y de la dirección del mundo en LE2.',
          loc: 'Argentina',
        },
        {
          mark: <div style={{ width: 36, height: 4, background: accent, boxShadow: `0 -10px 0 ${accent}, 0 10px 0 ${accent}` }} />,
          name: 'Pocas Nueces Arte Sonoro',
          role: 'Composición musical',
          desc: 'Diseño y composición de la banda sonora original. Atmósfera, drones y materia musical para la selva.',
          loc: 'Argentina',
        },
      ].map((s) => (
        <div key={s.name} data-reveal style={{ background: '#070504', padding: '40px 32px 36px', minHeight: 380, display:'flex', flexDirection:'column' }}>
          <div style={{ marginBottom: 32, height: 36, display:'flex', alignItems:'center' }}>{s.mark}</div>
          <div style={{ ...gmStyles.mono, color: accent, marginBottom: 14, fontSize: 10 }}>{s.role}</div>
          <h4 style={{ ...gmStyles.serif, fontSize: 40, lineHeight: 1.0, letterSpacing:'-0.02em', margin: '0 0 18px' }}>{s.name}</h4>
          <p style={{ fontSize: 13, lineHeight: 1.65, color:'rgba(245,233,212,0.7)', margin: '0 0 24px' }}>{s.desc}</p>
          <div style={{ ...gmStyles.mono, color:'rgba(245,233,212,0.45)', fontSize: 9, marginTop: 'auto' }}>{s.loc}</div>
        </div>
      ))}
    </div>
  </section>
);

const GMCTA = () => (
  <section style={{ padding: '180px 48px 100px', borderBottom: '1px solid rgba(245,233,212,0.08)', textAlign:'center', position:'relative' }}>
    <Grain opacity={0.06} />
    <div data-reveal style={{ ...gmStyles.mono, color: accent, marginBottom: 40 }}>(06) — Contacto Gamecrafting</div>
    <h2 data-reveal style={{ ...gmStyles.serif, fontSize: 180, lineHeight: 0.9, letterSpacing:'-0.035em', margin: '0 0 56px' }}>
      <em>Press, publishers,<br />colaboradores.</em>
    </h2>
    <a data-reveal style={{ ...gmStyles.serif, fontSize: 52, color: accent, textDecoration:'none', borderBottom: `1px solid ${accent}`, paddingBottom: 6 }}>
      games@obscuromediaworks.com.ar
    </a>
    <div data-reveal style={{ marginTop: 72, ...gmStyles.mono, color:'rgba(245,233,212,0.5)', display:'flex', justifyContent:'center', gap: 40 }}>
      <span>Buenos Aires · ARG</span>
      <span>Press kit disponible</span>
      <span>Aceptando 1 colaboración</span>
    </div>
  </section>
);

const GMFooter = () => (
  <footer style={{ padding: '32px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', ...gmStyles.mono, color:'rgba(245,233,212,0.5)' }}>
    <span>© Obscuro Gamecrafting · MMXXVI</span>
    <div style={{ display:'flex', gap: 28, alignItems: 'center' }}>
      <a href="#/lux" style={{ color:'rgba(245,233,212,0.7)', textDecoration: 'none' }}>Identidad &amp; Web ↗ (lux)</a>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>IG</span><span>X</span><span>YT</span><span>Steam</span>
    </div>
    <span>Buenos Aires · Argentina</span>
  </footer>
);

const GamesPage = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={gmStyles.page} className="obscuro-gm">
      <style>{`
        .obscuro-gm [data-reveal]{opacity:0;transform:translateY(40px);transition:opacity 1s ease,transform 1s cubic-bezier(.22,.61,.36,1)}
        .obscuro-gm [data-revealed]{opacity:1;transform:none}
      `}</style>
      <GMNav />
      <GMHero />
      <GMIntro />
      <GMProject />
      <GMCatalog />
      <GMServices />
      <GMTeam />
      <GMCTA />
      <GMFooter />
    </div>
  );
};

window.GamesPage = GamesPage;
