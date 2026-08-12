import { Theme, Display } from '@ds';

export const Hero = () => (
  <Theme name="gamecrafting" style={{ padding: 32 }}>
    <Display style={{ fontSize: 96 }}>Hacemos <em>juegos</em>.</Display>
  </Theme>
);

export const EnLux = () => (
  <Theme name="lux" style={{ padding: 32 }}>
    <Display style={{ fontSize: 96 }}>Identidad y <em>diseño</em>.</Display>
  </Theme>
);
