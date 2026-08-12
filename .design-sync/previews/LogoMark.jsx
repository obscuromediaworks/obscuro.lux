import { Theme, LogoMark } from '@ds';

export const Tamaños = () => (
  <Theme name="obscuro" style={{ padding: 32, display: 'grid', gap: 32 }}>
    <LogoMark size="hero" />
    <LogoMark size="nav" />
    <LogoMark size="footer" />
  </Theme>
);

export const SinTag = () => (
  <Theme name="gamecrafting" style={{ padding: 32 }}>
    <LogoMark size="nav" withTag={false} />
  </Theme>
);
