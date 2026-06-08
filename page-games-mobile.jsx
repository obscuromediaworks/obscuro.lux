// Mobile version of the Obscuro Games sub-brand page (375px wide).
// Keeps the VHS, accent gold, and editorial cinematic system.

const gmmStyles = {
  page: { width: '100%', background: '#070504', color: '#f5e9d4', fontFamily: '"Space Grotesk", Helvetica, sans-serif', fontWeight: 400, position: 'relative', overflow: 'hidden' },
  serif: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300 },
  mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' },
};

const gmmAccent = '#c9a96e';

const GMMNav = () => (
  <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
      <LogoMark variant="games" size="footer" />
    </div>
    <a href="#/lux" style={{
      height: 28, padding: '0 12px', borderRadius: 999, border: `1px solid ${gmmAccent}`,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      textDecoration: 'none', color: gmmAccent, fontSize: 9,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      letterSpacing: '0.18em', textTransform: 'uppercase',
    }} aria-label="Ir a LUX — Identidad y Web">Web ↗</a>
  </nav>
);

const GMMHero = () => (
  <section style={{ position:'relative', height: 760, overflow: 'hidden' }}>
    <div style={{ position:'absolute', inset: 0 }} data-reveal>
      <VHSFrame label="PLAY" timecode="00:12:34:21" intensity={1} style={{ height: '100%' }}>
        <div style={{ position:'relative', width: '100%', height: '100%', background: '#070504', overflow: 'hidden' }}>
          <BgVideo
            src={[
              { src: 'assets/le2_back_video.webm', type: 'video/webm' },
              { src: 'assets/le2_back_video.mp4',  type: 'video/mp4'  },
            ]}
            filter="saturate(0.75) contrast(1.05) blur(2.5px)"
          />
        </div>
      </VHSFrame>
    </div>
    <Grain opacity={0.14} />
    <div style={{ position:'absolute', inset:0, background: 'radial-gradient(ellipse at 50% 40%, rgba(201,169,110,0.10) 0%, transparent 60%), linear-gradient(180deg, rgba(7,5,4,0.35) 0%, rgba(7,5,4,0.10) 35%, rgba(7,5,4,0.92) 100%)' }} />

    <div style={{ position:'absolute', top:0, left:0, right:0, height: 56, background: '#070504' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height: 60, background: '#070504' }} />

    <div style={{ position:'absolute', left: 22, right: 22, top: 100 }}>
      <div style={{ ...gmmStyles.mono, color: gmmAccent }} data-reveal>
        Obscuro Games · 2024 —
      </div>
    </div>

    <div style={{ position:'absolute', left: 22, right: 22, bottom: 100 }}>
      <h1 data-reveal style={{ ...gmmStyles.serif, fontSize: 96, lineHeight: 0.88, letterSpacing: '-0.04em', margin: 0 }}>
        Hacemos<br />
        <em style={{ color: gmmAccent }}>juegos</em>.
      </h1>
    </div>

    <div style={{ position:'absolute', bottom: 60, left:0, right:0, padding:'10px 0', borderTop: `1px solid rgba(201,169,110,0.25)`, borderBottom: `1px solid rgba(201,169,110,0.25)`, background:'rgba(7,5,4,0.7)' }}>
      <Marquee duration={42} direction="right">
        <span style={{ ...gmmStyles.mono, fontSize: 9, color: gmmAccent }}>
          {'◆ HORROR PSICOLÓGICO · UNITY 6 · WWISE · '.repeat(8)}
        </span>
      </Marquee>
    </div>
  </section>
);

const GMMIntro = () => (
  <section style={{ padding: '72px 22px', borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    <div data-reveal style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 20 }}>(01) Manifiesto</div>
    <h2 data-reveal style={{ ...gmmStyles.serif, fontSize: 48, lineHeight: 0.95, letterSpacing:'-0.025em', margin: '0 0 28px' }}>
      Audio que <em>recuerdas</em>. Mundos que <em>importan</em>.
    </h2>
    <p data-reveal style={{ ...gmmStyles.serif, fontSize: 18, lineHeight: 1.4, margin: '0 0 18px' }}>
      Equipo independiente que crea experiencias inmersivas en la intersección de narrativa, sonido y mecánicas. <em>El audio</em> es nuestro diferencial.
    </p>
    <p data-reveal style={{ fontSize: 13, lineHeight: 1.7, color:'rgba(245,233,212,0.7)', margin: 0 }}>
      Sound house y co-desarrollo para estudios indie. En paralelo, desarrollamos <strong style={{ color: '#f5e9d4', fontWeight: 400 }}>Labyrinth Encounters 2</strong>.
    </p>
  </section>
);

const GMMProject = () => (
  <section style={{ borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
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
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,5,4,0.5) 0%, rgba(7,5,4,0.25) 35%, rgba(7,5,4,0.92) 100%)' }} />

      <div data-reveal style={{ position: 'relative', padding: '88px 22px 64px' }}>
        <div style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 18 }}>(02) Proyecto actual</div>
        <h2 style={{ ...gmmStyles.serif, fontSize: 64, lineHeight: 0.88, letterSpacing:'-0.03em', margin: 0 }}>
          Labyrinth<br /><em>Encounters 2.</em>
        </h2>
        <div style={{ ...gmmStyles.mono, color:'rgba(245,233,212,0.6)', marginTop: 16, fontSize: 9 }}>
          Secuela de Labyrinth Encounters · 2024
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 4, ...gmmStyles.mono, color:'rgba(245,233,212,0.7)', marginTop: 20, fontSize: 9 }}>
          <span style={{ color: gmmAccent }}>● IN DEVELOPMENT</span>
          <span>Vertical slice · greyboxing</span>
        </div>
      </div>
    </div>

    <div style={{ padding: '40px 22px 8px' }}>
      <div data-reveal style={{ ...gmmStyles.mono, color:'rgba(245,233,212,0.5)', marginBottom: 16 }}>Pitch</div>
      <p data-reveal style={{ ...gmmStyles.serif, fontSize: 26, lineHeight: 1.25, margin: '0 0 18px', letterSpacing:'-0.01em' }}>
        <em>"Un laberinto que cambia cuando no estás mirando."</em>
      </p>
      <p data-reveal style={{ fontSize: 13, lineHeight: 1.7, color:'rgba(245,233,212,0.75)', margin: 0 }}>
        Horror psicológico en primera persona ambientado en una selva del noreste argentino —entre Misiones y el Chaco. Sin enemigos. Sin jumpscares.
      </p>
    </div>

    <div data-reveal style={{ padding: '32px 22px', display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[
        ['Género', 'Horror psicológico'],
        ['Perspectiva', 'Primera persona'],
        ['Engine', 'Unity 6 · HDRP'],
        ['Audio', 'Wwise'],
        ['Plataforma', 'PC (Steam)'],
        ['Estado', 'Vertical slice'],
      ].map(([k,v]) => (
        <div key={k} style={{ borderTop: `1px solid rgba(245,233,212,0.15)`, paddingTop: 10 }}>
          <div style={{ ...gmmStyles.mono, fontSize: 9, color:'rgba(245,233,212,0.5)', marginBottom: 4 }}>{k}</div>
          <div style={{ fontSize: 12 }}>{v}</div>
        </div>
      ))}
    </div>

    <div data-reveal>
      <Placeholder label="LE2 — paleta selva/noche" ratio="16/10" tone="dark" />
    </div>

    {/* Pillars stacked */}
    <div style={{ padding: '56px 22px 32px' }}>
      <div data-reveal style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 20 }}>Pilares de diseño</div>
      {[
        { n: '01', t: 'Sin enemigos', d: 'El miedo no viene de algo que te persigue. Viene del lugar.' },
        { n: '02', t: 'Sin jumpscares', d: 'Tensión sostenida. El horror se construye, no se grita.' },
        { n: '03', t: 'Horror perceptivo', d: 'El laberinto cambia cuando dejas de mirarlo. Tu memoria es el enemigo.' },
      ].map((p) => (
        <div key={p.n} data-reveal style={{ padding: '20px 0', borderTop: '1px solid rgba(245,233,212,0.12)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', ...gmmStyles.mono, color: gmmAccent, marginBottom: 10, fontSize: 9 }}>
            <span>{p.n}</span>
          </div>
          <h4 style={{ ...gmmStyles.serif, fontSize: 28, lineHeight: 1.05, margin: '0 0 10px', letterSpacing:'-0.015em' }}>{p.t}</h4>
          <p style={{ fontSize: 12, lineHeight: 1.65, color:'rgba(245,233,212,0.7)', margin: 0 }}>{p.d}</p>
        </div>
      ))}
    </div>

    <div data-reveal style={{ padding: '0 22px 64px' }}>
      <a href="#catalogo" style={{ display:'block', textDecoration:'none', color:'inherit' }}>
        <div style={{ border: '1px solid rgba(245,233,212,0.12)', padding: '18px 18px' }}>
          <div style={{ ...gmmStyles.mono, fontSize: 9, color: 'rgba(245,233,212,0.5)', marginBottom: 10 }}>↳ EL PREDECESOR</div>
          <div style={{ ...gmmStyles.serif, fontSize: 20, letterSpacing:'-0.01em' }}>Labyrinth Encounters <span style={{ color:'rgba(245,233,212,0.5)' }}>— 2024</span></div>
          <div style={{ fontSize: 11, color:'rgba(245,233,212,0.55)', margin: '6px 0 12px' }}>El primer laberinto. Jugable y gratis en itch.io.</div>
          <div style={{ ...gmmStyles.mono, fontSize: 10, color: gmmAccent }}>Ver catálogo ↓</div>
        </div>
      </a>
    </div>
  </section>
);

const GMMCatalog = () => (
  <section id="catalogo" style={{ padding: '72px 22px', borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    <div data-reveal style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 14 }}>(03) Catálogo</div>
    <h2 data-reveal style={{ ...gmmStyles.serif, fontSize: 48, margin: '0 0 12px', letterSpacing:'-0.025em' }}>3 juegos</h2>
    <div data-reveal style={{ ...gmmStyles.mono, color:'rgba(245,233,212,0.55)', marginBottom: 32, fontSize: 9 }}>
      Diseño de audio & Wwise
    </div>
    {GAMES.map((g) => (
      <a key={g.slug} data-reveal href={g.url} target="_blank" rel="noopener" style={{ display:'block', textDecoration:'none', color:'inherit', margin: '0 -22px', borderTop: '1px solid rgba(245,233,212,0.08)' }}>
        <Placeholder label={`${g.title} — ${g.genre}`} ratio="4/5" tone="dark" src={g.cover} />
        <div style={{ padding: '18px 22px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', ...gmmStyles.mono, color:'rgba(245,233,212,0.55)', marginBottom: 8, fontSize: 9 }}>
            <span>{g.studio}</span><span>{g.year}</span>
          </div>
          <h4 style={{ ...gmmStyles.serif, fontSize: 28, margin: '0 0 6px', letterSpacing:'-0.015em' }}>{g.title}</h4>
          <div style={{ ...gmmStyles.mono, color: gmmAccent, fontSize: 9, marginBottom: 10 }}>{g.genre}</div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color:'rgba(245,233,212,0.7)', margin: '0 0 12px' }}>{g.desc}</p>
          <div style={{ ...gmmStyles.mono, color:'rgba(245,233,212,0.55)', fontSize: 9, display:'flex', justifyContent:'space-between' }}>
            <span>{g.role}</span><span style={{ color:'#f5e9d4' }}>Jugar ↗</span>
          </div>
        </div>
      </a>
    ))}
  </section>
);

const GMMStudios = () => (
  <section style={{ padding: '72px 22px', borderBottom: '1px solid rgba(245,233,212,0.08)' }}>
    <div data-reveal style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 14 }}>(04) Colaboración</div>
    <h2 data-reveal style={{ ...gmmStyles.serif, fontSize: 48, margin: '0 0 24px', letterSpacing:'-0.025em' }}>3 estudios</h2>
    <p data-reveal style={{ ...gmmStyles.serif, fontSize: 18, lineHeight: 1.4, margin: '0 0 36px', color: 'rgba(245,233,212,0.8)' }}>
      LE2 se construye como colaboración. Cada estudio aporta su disciplina; nadie hace de todo.
    </p>
    {[
      { mark: <div style={{ width: 30, height: 30, borderRadius: '50%', background: gmmAccent }} />, name: 'Obscuro Mediaworks', role: 'Estudio anfitrión', desc: 'Programación, integración en Unity, audio (Wwise) y producción.' },
      { mark: <div style={{ width: 30, height: 30, border: `2px solid ${gmmAccent}`, transform: 'rotate(45deg)' }} />, name: 'Fox Fury', role: 'Co-creador · LE original', desc: '3D, level design e historia.' },
      { mark: <div style={{ width: 30, height: 3, background: gmmAccent, boxShadow: `0 -8px 0 ${gmmAccent}, 0 8px 0 ${gmmAccent}` }} />, name: 'Pocas Nueces Arte Sonoro', role: 'Composición musical', desc: 'Diseño y composición de la banda sonora original.' },
    ].map((s) => (
      <div key={s.name} data-reveal style={{ padding: '24px 0', borderTop: '1px solid rgba(245,233,212,0.12)' }}>
        <div style={{ marginBottom: 14, height: 30, display:'flex', alignItems:'center' }}>{s.mark}</div>
        <div style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 8, fontSize: 9 }}>{s.role}</div>
        <h4 style={{ ...gmmStyles.serif, fontSize: 28, lineHeight: 1.0, letterSpacing:'-0.02em', margin: '0 0 10px' }}>{s.name}</h4>
        <p style={{ fontSize: 12, lineHeight: 1.65, color:'rgba(245,233,212,0.7)', margin: 0 }}>{s.desc}</p>
      </div>
    ))}
  </section>
);

const GMMCTA = () => (
  <section style={{ padding: '96px 22px 56px', borderBottom: '1px solid rgba(245,233,212,0.08)', textAlign:'center', position:'relative' }}>
    <Grain opacity={0.06} />
    <div data-reveal style={{ ...gmmStyles.mono, color: gmmAccent, marginBottom: 32 }}>(05) Contacto Gamecrafting</div>
    <h2 data-reveal style={{ ...gmmStyles.serif, fontSize: 72, lineHeight: 0.9, letterSpacing:'-0.035em', margin: '0 0 36px' }}>
      <em>Press, publishers,<br />colaboradores.</em>
    </h2>
    <a data-reveal style={{ ...gmmStyles.serif, fontSize: 28, color: gmmAccent, textDecoration:'none', borderBottom: `1px solid ${gmmAccent}`, paddingBottom: 4, display:'inline-block' }}>
      games@obscuromediaworks.com.ar
    </a>
    <div data-reveal style={{ marginTop: 36, ...gmmStyles.mono, color:'rgba(245,233,212,0.5)', display:'flex', flexDirection:'column', gap: 8, fontSize: 9 }}>
      <span>Buenos Aires · ARG</span>
      <span>Press kit disponible</span>
    </div>
  </section>
);

const GMMFooter = () => (
  <footer style={{ padding: '22px', display:'flex', flexDirection: 'column', gap: 12, ...gmmStyles.mono, color:'rgba(245,233,212,0.5)', fontSize: 9 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span>© Obscuro Gamecrafting</span>
      <div style={{ display:'flex', gap: 14 }}><span>IG</span><span>X</span><span>YT</span><span>Steam</span></div>
    </div>
    <a href="#/lux" style={{ color:'rgba(245,233,212,0.7)', textDecoration: 'none' }}>Identidad &amp; Web ↗ (lux)</a>
  </footer>
);

const GamesPageMobile = () => {
  const ref = React.useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} style={gmmStyles.page} className="obscuro-gmm">
      <style>{`
        .obscuro-gmm [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .9s ease,transform .9s cubic-bezier(.22,.61,.36,1)}
        .obscuro-gmm [data-revealed]{opacity:1;transform:none}
      `}</style>
      <GMMNav />
      <GMMHero />
      <GMMIntro />
      <GMMProject />
      <GMMCatalog />
      <GMMStudios />
      <GMMCTA />
      <GMMFooter />
    </div>
  );
};

window.GamesPageMobile = GamesPageMobile;
