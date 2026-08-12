import { Theme, Eyebrow } from '@ds';

export const Numerado = () => (
  <Theme name="obscuro" style={{ padding: 32, display: 'grid', gap: 20 }}>
    <Eyebrow>(01) Manifiesto</Eyebrow>
    <Eyebrow>(02) Proyectos</Eyebrow>
    <Eyebrow>(03) Equipo</Eyebrow>
  </Theme>
);

export const Seccionado = () => (
  <Theme name="lux" style={{ padding: 32, display: 'grid', gap: 20 }}>
    <Eyebrow>§ 00 — Frontispicio</Eyebrow>
    <Eyebrow>§ 01 — Metodo</Eyebrow>
  </Theme>
);
