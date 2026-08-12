import { Theme, Grain, Title, Caps } from '@ds';

// El grano sobre negro casi puro es invisible: un overlay al 6% no tiene
// contra que contrastar. Estas previews lo muestran sobre un degrade que
// pasa por medios tonos, que es donde la textura realmente lee — y como en
// el sitio real el grano va sobre video, ese es tambien el uso honesto.
const Panel = ({ children, ...rest }) => (
  <div
    style={{
      position: 'relative', height: 200, overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end', padding: 24,
      background: 'radial-gradient(ellipse at 30% 20%, #c9a96e 0%, #5a4a30 38%, #100c09 100%)',
    }}
    {...rest}
  >
    {children}
  </div>
);

export const Comparacion = () => (
  <Theme name="gamecrafting" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    <div>
      <Caps style={{ display: 'block', marginBottom: 8, color: 'var(--ob-fg-subtle)' }}>Sin grano</Caps>
      <Panel><Title style={{ fontSize: 32 }}>Limpio</Title></Panel>
    </div>
    <div>
      <Caps style={{ display: 'block', marginBottom: 8, color: 'var(--ob-fg-subtle)' }}>Con grano · 0.14</Caps>
      <Panel><Title style={{ fontSize: 32 }}>Con <em>grano</em></Title><Grain /></Panel>
    </div>
  </Theme>
);

export const Intensidades = () => (
  <Theme name="gamecrafting" style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    {[0.06, 0.14, 0.4].map((o) => (
      <div key={o}>
        <Caps style={{ display: 'block', marginBottom: 8, color: 'var(--ob-fg-subtle)' }}>opacity {o}</Caps>
        <Panel><Grain opacity={o} /></Panel>
      </div>
    ))}
  </Theme>
);
