import { Theme, Section, Title, Body, Lead } from '@ds';

export const ConEyebrow = () => (
  <Theme name="obscuro">
    <Section eyebrow="(01) Manifiesto">
      <Title>Audio que <em>recuerdas</em>.</Title>
      <Lead style={{ marginTop: 24 }}>
        Somos un equipo independiente que crea experiencias inmersivas.
      </Lead>
      <Body style={{ marginTop: 16 }}>
        El audio —su diseño, implementacion con middleware y produccion— es
        nuestro diferencial.
      </Body>
    </Section>
  </Theme>
);

export const Encadenadas = () => (
  <Theme name="lux">
    <Section eyebrow="§ 01 — Servicios"><Title style={{ fontSize: 40 }}>Identidad</Title></Section>
    <Section eyebrow="§ 02 — Metodo"><Title style={{ fontSize: 40 }}>Investigacion</Title></Section>
  </Theme>
);
