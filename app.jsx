// Mount: artboards organized by section.

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

const App = () => (
  <DesignCanvas initialZoom={0.26}>
    <DCSection
      id="logo"
      title="Logo / marca — exploración"
      subtitle="5 direcciones + un contexto de uso. Cada artboard muestra: marca principal, sub-brand Games, footer pequeño y favicon."
    >
      <DCArtboard id="logo-01" label="01 · Editorial italic" width={900} height={620}>
        <Logo01 />
      </DCArtboard>
      <DCArtboard id="logo-02" label="02 · Lente + wordmark" width={900} height={620}>
        <Logo02 />
      </DCArtboard>
      <DCArtboard id="logo-03" label="03 · Tipográfico mono" width={900} height={620}>
        <Logo03 />
      </DCArtboard>
      <DCArtboard id="logo-04" label="04 · Apertura monograma" width={900} height={620}>
        <Logo04 />
      </DCArtboard>
      <DCArtboard id="logo-05" label="05 · Sistema modular" width={900} height={620}>
        <Logo05 />
      </DCArtboard>
      <DCArtboard id="logo-06" label="06 · En contexto" width={900} height={620}>
        <LogoInContext />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="landing"
      title="Landing — 3 direcciones"
      subtitle="Oscuro y cinematográfico · tres direcciones"
    >
      <DCArtboard id="a" label="A · Editorial Noir" width={1440} height={4600}>
        <VariationA />
      </DCArtboard>
      <DCArtboard id="b" label="B · Cinematográfico (gold)" width={1440} height={5200}>
        <VariationB accent="#c9a96e" accentName="gold" />
      </DCArtboard>
      <DCArtboard id="c" label="C · Grilla Brutalista" width={1440} height={4800}>
        <VariationC />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="palette"
      title="Variación B — alternativa de acento"
      subtitle="Misma estructura, otro carácter. Para decidir paleta antes de Wix."
    >
      <DCArtboard id="b-crimson" label="B · Acento carmesí" width={1440} height={5200}>
        <VariationB accent="#ff3b2e" accentName="crimson" />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="mobile"
      title="B · Mobile (375)"
      subtitle="La misma landing portada a móvil."
    >
      <DCArtboard id="b-mobile" label="B · Mobile" width={375} height={5800}>
        <VariationBMobile />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="pages"
      title="Páginas internas — sistema B"
      subtitle="Cómo se ve el sistema cuando entras al detalle. Mismo idioma visual."
    >
      <DCArtboard id="case-totem" label="Caso · Tótem (Fundación Marajó)" width={1440} height={5400}>
        <CaseStudyPage />
      </DCArtboard>
      <DCArtboard id="games" label="Sub-brand · Obscuro Games (VHS)" width={1440} height={7600}>
        <GamesPage />
      </DCArtboard>
      <DCArtboard id="games-mobile" label="Games · Mobile (VHS)" width={375} height={4900}>
        <GamesPageMobile />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
