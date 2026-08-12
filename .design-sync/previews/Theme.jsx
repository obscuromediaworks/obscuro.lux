import { Theme, Section, Title, Body, Chip } from '@ds';

const Demo = ({ name }) => (
  <Theme name={name}>
    <Section eyebrow={`Tema · ${name}`}>
      <Title>Hacemos <em>juegos</em>.</Title>
      <Body style={{ marginTop: 16 }}>
        El tema pinta su propia superficie, define los tokens y elige la
        familia de cuerpo. Se pueden anidar.
      </Body>
      <div style={{ marginTop: 24 }}><Chip>Press kit</Chip></div>
    </Section>
  </Theme>
);

export const Obscuro = () => <Demo name="obscuro" />;
export const Gamecrafting = () => <Demo name="gamecrafting" />;
export const Lux = () => <Demo name="lux" />;
export const Anidado = () => (
  <Theme name="obscuro">
    <Section eyebrow="(01) Estudio">
      <Title>Obscuro</Title>
      <Theme name="lux" style={{ marginTop: 24, padding: 24 }}>
        <Title style={{ fontSize: 28 }}>LUX</Title>
        <Body style={{ marginTop: 8 }}>Un bloque LUX dentro de una pagina Obscuro.</Body>
      </Theme>
    </Section>
  </Theme>
);
