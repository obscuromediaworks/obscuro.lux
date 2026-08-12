import { Theme, Chip } from '@ds';

export const Botones = () => (
  <Theme name="gamecrafting" style={{ padding: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    <Chip>Press kit</Chip>
    <Chip as="a" href="#">Ver proyecto ↗</Chip>
    <Chip>Contacto</Chip>
  </Theme>
);

export const EnLux = () => (
  <Theme name="lux" style={{ padding: 32, display: 'flex', gap: 12 }}>
    <Chip>Descargar manual</Chip>
    <Chip as="a" href="#">Estudio ↗</Chip>
  </Theme>
);
