import { Theme, Rule, Mono } from '@ds';

export const Separadores = () => (
  <Theme name="obscuro" style={{ padding: 32 }}>
    <Mono>rule · 12%</Mono>
    <Rule style={{ margin: '12px 0 24px' }} />
    <Mono>rule soft · 8%</Mono>
    <Rule soft style={{ margin: '12px 0' }} />
  </Theme>
);
