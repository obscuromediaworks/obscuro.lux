import { Theme, Body } from '@ds';

const T = 'Trabajamos como sound house y co-desarrollo para estudios indie. Cuando no estamos en eso, hacemos lo nuestro: ahora mismo, Labyrinth Encounters 2.';

export const Oscuro = () => (
  <Theme name="obscuro" style={{ padding: 32 }}><Body>{T}</Body></Theme>
);
export const Claro = () => (
  <Theme name="lux" style={{ padding: 32 }}><Body>{T}</Body></Theme>
);
