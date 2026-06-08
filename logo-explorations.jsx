// Logo explorations for Obscuro Mediaworks.
// Each component renders one direction at large scale on a dark stage,
// showing primary lockup + sub-brand variation + small/favicon use.

const logoStage = {
  width: '100%', height: '100%',
  background: '#0a0a0a', color: '#f5f4ef',
  position: 'relative', overflow: 'hidden',
  fontFamily: '"Space Grotesk", Helvetica, sans-serif',
  padding: 48, display: 'flex', flexDirection: 'column',
};

const logoCaption = {
  position: 'absolute', top: 24, left: 24,
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'rgba(245,244,239,0.45)',
};
const logoMeta = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'rgba(245,244,239,0.45)',
};
const logoFootStrip = {
  marginTop: 'auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 32,
  paddingTop: 32,
  borderTop: '1px solid rgba(245,244,239,0.10)',
};
const logoFootCell = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

// ──────────────────────────────────────────────────────────────────────
// 01 — Editorial italic wordmark (Cormorant Garamond italic)
// ──────────────────────────────────────────────────────────────────────
const Logo01 = () => (
  <div style={logoStage}>
    <div style={logoCaption}>01 · Wordmark editorial · Cormorant italic</div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 140, lineHeight: 0.9, letterSpacing: '-0.025em',
        }}>
          Obscuro
        </div>
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 22, letterSpacing: '0.38em', textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.7)', marginTop: 18,
        }}>
          Mediaworks
        </div>
      </div>
    </div>

    <div style={logoFootStrip}>
      <div style={logoFootCell}>
        <div style={logoMeta}>Sub-brand</div>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle:'italic', fontSize: 34 }}>
          Obscuro / <span style={{ color: '#c9a96e' }}>Games</span>
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Footer (small)</div>
        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          Obscuro&nbsp;&nbsp;Mediaworks
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Favicon (32px)</div>
        <div style={{
          width: 56, height: 56, background: '#f5f4ef', color: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 44, lineHeight: 1, paddingBottom: 4,
        }}>
          O
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// 02 — Lens / aperture mark + wordmark
// A circle with an inset crescent: eclipse + camera aperture suggestion.
// ──────────────────────────────────────────────────────────────────────
const LensMark = ({ size = 120, color = '#f5f4ef' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="2" />
    <path d="M50,2 A48,48 0 0,1 50,98 A30,48 0 0,0 50,2 Z" fill={color} />
    <circle cx="50" cy="50" r="6" fill="#0a0a0a" />
  </svg>
);

const Logo02 = () => (
  <div style={logoStage}>
    <div style={logoCaption}>02 · Marca + wordmark · Lente / eclipse</div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <LensMark size={160} />
      <div>
        <div style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 300,
          fontSize: 108, lineHeight: 0.9, letterSpacing: '-0.025em',
        }}>
          Obscuro
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.65)', marginTop: 10,
        }}>
          Mediaworks · est. 2019
        </div>
      </div>
    </div>

    <div style={logoFootStrip}>
      <div style={logoFootCell}>
        <div style={logoMeta}>Sub-brand</div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <LensMark size={36} color="#c9a96e" />
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30, letterSpacing:'-0.01em' }}>
            Obscuro <span style={{ color: '#c9a96e' }}>/ Games</span>
          </div>
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Marca aislada</div>
        <div style={{ display:'flex', gap: 18, alignItems:'center' }}>
          <LensMark size={28} />
          <LensMark size={20} />
          <LensMark size={14} />
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Favicon (32px)</div>
        <div style={{
          width: 56, height: 56, background: '#f5f4ef',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LensMark size={40} color="#0a0a0a" />
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// 03 — Mono / bracket: tipográfico técnico, estilo "studio file"
// ──────────────────────────────────────────────────────────────────────
const Logo03 = () => (
  <div style={logoStage}>
    <div style={logoCaption}>03 · Tipográfico mono · Studio file</div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontWeight: 500,
          fontSize: 76, letterSpacing: '0.04em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <span style={{ color: 'rgba(245,244,239,0.4)' }}>[</span>
          <span>obscuro</span>
          <span style={{ color: 'rgba(245,244,239,0.4)' }}>]</span>
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.42em', textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.65)', marginTop: 16,
        }}>
          mediaworks
        </div>
      </div>
    </div>

    <div style={logoFootStrip}>
      <div style={logoFootCell}>
        <div style={logoMeta}>Sub-brand</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          [ obscuro / <span style={{ color: '#c9a96e' }}>games</span> ]
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Footer (small)</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          [ obscuro_mediaworks ]
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Favicon (32px)</div>
        <div style={{
          width: 56, height: 56, background: '#f5f4ef', color: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: 34,
        }}>
          [o]
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// 04 — Monogram lens: "O" como apertura/eclipse, wordmark abajo
// ──────────────────────────────────────────────────────────────────────
const ApertureO = ({ size = 240, color = '#f5f4ef' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
    <defs>
      <mask id="apert-mask">
        <rect width="200" height="200" fill="white" />
        <rect x="0" y="92" width="200" height="16" fill="black" />
      </mask>
    </defs>
    <circle cx="100" cy="100" r="92" fill="none" stroke={color} strokeWidth="14" mask="url(#apert-mask)" />
    <rect x="50" y="94" width="100" height="12" fill={color} />
  </svg>
);

const Logo04 = () => (
  <div style={logoStage}>
    <div style={logoCaption}>04 · Monograma · "O" como apertura</div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <ApertureO size={220} />
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 500,
          fontSize: 36, letterSpacing: '0.32em', textTransform: 'uppercase',
          marginTop: 28,
        }}>
          Obscuro
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13, letterSpacing: '0.36em', textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.55)', marginTop: 10,
        }}>
          Mediaworks
        </div>
      </div>
    </div>

    <div style={logoFootStrip}>
      <div style={logoFootCell}>
        <div style={logoMeta}>Sub-brand</div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <ApertureO size={44} color="#c9a96e" />
          <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Obscuro <span style={{ color: '#c9a96e' }}>/ Games</span>
          </div>
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Lockup horizontal</div>
        <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
          <ApertureO size={32} />
          <div style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 16, letterSpacing: '0.32em', textTransform: 'uppercase',
          }}>
            Obscuro&nbsp;Mediaworks
          </div>
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Favicon (32px)</div>
        <div style={{
          width: 56, height: 56, background: '#f5f4ef',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ApertureO size={40} color="#0a0a0a" />
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// 05 — Modular slash: "Obscuro / Mediaworks" como sistema
// ──────────────────────────────────────────────────────────────────────
const Logo05 = () => (
  <div style={logoStage}>
    <div style={logoCaption}>05 · Sistema modular · Slash divisional</div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 0,
        fontFamily: '"Cormorant Garamond", serif',
        fontWeight: 300, fontSize: 130, lineHeight: 0.9, letterSpacing: '-0.025em',
      }}>
        <span>Obscuro</span>
        <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 80, color: 'rgba(245,244,239,0.4)', margin: '0 18px' }}>/</span>
        <span style={{ fontStyle:'italic', color: 'rgba(245,244,239,0.85)' }}>Mediaworks</span>
      </div>
    </div>

    <div style={logoFootStrip}>
      <div style={logoFootCell}>
        <div style={logoMeta}>Sub-brands del sistema</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          {[
            ['Mediaworks', '#f5f4ef'],
            ['Games', '#c9a96e'],
            ['Studio', 'rgba(245,244,239,0.6)'],
          ].map(([n, c]) => (
            <div key={n} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, letterSpacing:'-0.01em', display:'flex', gap: 10, alignItems:'baseline' }}>
              <span>Obscuro</span>
              <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, color: 'rgba(245,244,239,0.4)' }}>/</span>
              <span style={{ fontStyle:'italic', color: c }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Footer (small)</div>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle:'italic', fontSize: 18 }}>
          Obscuro <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontStyle: 'normal', color: 'rgba(245,244,239,0.4)' }}>/</span> Mediaworks
        </div>
      </div>
      <div style={logoFootCell}>
        <div style={logoMeta}>Favicon (32px)</div>
        <div style={{
          width: 56, height: 56, background: '#f5f4ef', color: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 32,
        }}>
          O/
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// 06 — In context: lockup elegido viviendo en hero / nav / loading
// (mostrado como referencia, usa el logo 02 por defecto)
// ──────────────────────────────────────────────────────────────────────
const LogoInContext = () => (
  <div style={{ ...logoStage, padding: 0 }}>
    <div style={{ ...logoCaption, top: 24, left: 24, zIndex: 2 }}>06 · En contexto · Nav / loading / footer</div>

    {/* Nav bar */}
    <div style={{ borderBottom: '1px solid rgba(245,244,239,0.08)', padding: '20px 32px', display:'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <LensMark size={24} />
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22 }}>Obscuro</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.3em', textTransform:'uppercase', color: 'rgba(245,244,239,0.5)', marginLeft: 4 }}>
          Mediaworks
        </div>
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.2em', textTransform:'uppercase', color: 'rgba(245,244,239,0.6)', display:'flex', gap: 24 }}>
        <span>Estudio</span><span>Trabajo</span><span>Games</span><span style={{ color:'#f5f4ef' }}>Contacto</span>
      </div>
    </div>

    {/* Loading screen */}
    <div style={{ flex: 1, display:'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column', gap: 22, position:'relative' }}>
      <LensMark size={64} />
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36 }}>Obscuro</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.4em', textTransform:'uppercase', color: 'rgba(245,244,239,0.55)' }}>
        Cargando · 047 / 100
      </div>
      <div style={{ width: 200, height: 1, background: 'rgba(245,244,239,0.15)' }}>
        <div style={{ width: '47%', height: '100%', background: '#f5f4ef' }} />
      </div>
    </div>

    {/* Footer */}
    <div style={{ borderTop: '1px solid rgba(245,244,239,0.08)', padding: '18px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,244,239,0.5)' }}>
      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
        <LensMark size={14} />
        <span>Obscuro Mediaworks · 2019—2026</span>
      </div>
      <span>Buenos Aires · Argentina</span>
    </div>
  </div>
);

Object.assign(window, { Logo01, Logo02, Logo03, Logo04, Logo05, LogoInContext });
