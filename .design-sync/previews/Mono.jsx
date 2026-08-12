import { Theme, Mono } from '@ds';

export const Documento = () => (
  <Theme name="obscuro" style={{ padding: 32, display: 'grid', gap: 14 }}>
    <Mono>Doc. OMW-2026-01 · Rev. 01</Mono>
    <Mono>00:12:34:21</Mono>
    <Mono>Buenos Aires · MMXXVI</Mono>
  </Theme>
);
