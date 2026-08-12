import { Theme, MetaRow } from '@ds';

const items = [
  ['Doc.', 'OMW-2026-01'],
  ['Estudio.', 'Obscuro'],
  ['Loc.', 'Buenos Aires'],
  ['Año.', 'MMXXVI'],
  ['Rev.', '01'],
];

export const Encabezado = () => (
  <Theme name="lux" style={{ padding: 32 }}><MetaRow items={items} /></Theme>
);
export const Oscuro = () => (
  <Theme name="obscuro" style={{ padding: 32 }}><MetaRow items={items} /></Theme>
);
