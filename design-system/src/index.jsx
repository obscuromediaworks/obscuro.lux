/* Obscuro Mediaworks — primitivas del sistema de diseño.
 *
 * Componentes finos sobre tokens.css: cada uno emite el markup y las clases
 * correctas del sistema. No hay estilos inline acá a propósito — todo el look
 * vive en tokens.css, así que un cambio de marca es un cambio de token.
 *
 * React llega como global (window.React), cargado antes que este bundle.
 * Por eso el archivo no importa nada.
 */

const cx = (...xs) => xs.filter(Boolean).join(' ');

/** Contenedor de tema. Pinta su propia superficie, así que se pueden anidar. */
const Theme = ({ name = 'obscuro', as: As = 'div', className, children, ...rest }) => (
  <As data-theme={name} className={className} {...rest}>{children}</As>
);

/** Titular de hero. El `<em>` interno sale en oro — es la firma de la marca. */
const Display = ({ as: As = 'h1', className, children, ...rest }) => (
  <As className={cx('ob-display', className)} {...rest}>{children}</As>
);

/** Titular de sección. Mismo recurso del `<em>` dorado que Display. */
const Title = ({ as: As = 'h2', className, children, ...rest }) => (
  <As className={cx('ob-title', className)} {...rest}>{children}</As>
);

/** Bajada. Serif liviana, un escalón por encima del cuerpo. */
const Lead = ({ as: As = 'p', className, children, ...rest }) => (
  <As className={cx('ob-lead', className)} {...rest}>{children}</As>
);

/** Texto de lectura. Sale en fg-muted, que cumple AA en los tres temas. */
const Body = ({ as: As = 'p', className, children, ...rest }) => (
  <As className={cx('ob-body', className)} {...rest}>{children}</As>
);

/** Marcador que abre cada sección: "(01) Manifiesto". Mono, en oro. */
const Eyebrow = ({ as: As = 'div', className, children, ...rest }) => (
  <As className={cx('ob-eyebrow', className)} {...rest}>{children}</As>
);

/** Versalitas con tracking abierto. Metadata y navegación de LUX. */
const Caps = ({ as: As = 'span', className, children, ...rest }) => (
  <As className={cx('ob-caps', className)} {...rest}>{children}</As>
);

/** Monoespaciada. Timecodes, códigos de documento, el logotipo. */
const Mono = ({ as: As = 'span', className, children, ...rest }) => (
  <As className={cx('ob-mono', className)} {...rest}>{children}</As>
);

/** El único componente con radio del sistema. Borde de 1px, sin relleno. */
const Chip = ({ as: As = 'button', className, children, ...rest }) => (
  <As className={cx('ob-chip', className)} {...rest}>{children}</As>
);

/** Sección de página: canal lateral del tema, aire vertical y hairline al pie. */
const Section = ({ eyebrow, className, children, ...rest }) => (
  <section className={cx('ob-section', className)} {...rest}>
    {eyebrow ? <Eyebrow style={{ marginBottom: 'var(--ob-space-5)' }}>{eyebrow}</Eyebrow> : null}
    {children}
  </section>
);

/** Hairline. Las secciones se separan con una línea, nunca con una caja. */
const Rule = ({ soft = false, className, ...rest }) => (
  <div role="separator" className={cx(soft ? 'ob-rule-soft' : 'ob-rule', className)} {...rest} />
);

/** Fila de metadata tipo encabezado de documento. `items` = [[label, value], …] */
const MetaRow = ({ items = [], className, ...rest }) => (
  <div
    className={cx('ob-rule', className)}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, 1fr)`,
      gap: 'var(--ob-space-4)',
      padding: 'var(--ob-space-3) 0',
      fontFamily: 'var(--ob-font-mono)',
      fontSize: 'var(--ob-text-2xs)',
      color: 'var(--ob-fg-muted)',
    }}
    {...rest}
  >
    {items.map(([label, value], i) => (
      <span key={label} style={i === items.length - 1 ? { textAlign: 'right' } : undefined}>
        <span style={{ color: 'var(--ob-fg)' }}>{label}</span>&nbsp;{value}
      </span>
    ))}
  </div>
);

/** Grilla de cifras. Datos concretos antes que adjetivos. `items` = [[n, label], …] */
const Facts = ({ items = [], className, ...rest }) => (
  <div
    className={className}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, 1fr)`,
      gap: 'var(--ob-space-4)',
    }}
    {...rest}
  >
    {items.map(([n, label]) => (
      <div key={label}>
        <div className="ob-title" style={{ fontSize: 'var(--ob-text-xl)' }}>{n}</div>
        <div className="ob-mono" style={{ color: 'var(--ob-fg-subtle)' }}>{label}</div>
      </div>
    ))}
  </div>
);

/** Logotipo. `[ obscuro ]` en mono + el tag MEDIAWORKS con tracking. */
const LogoMark = ({ size = 'nav', withTag = true, className, ...rest }) => {
  const fontSize = { hero: 56, nav: 28, footer: 11, tiny: 10 }[size] || 18;
  const tagSize = { hero: 14, nav: 11, footer: 8, tiny: 8 }[size] || 9;
  const gap = { hero: 14, nav: 7, footer: 3, tiny: 3 }[size] || 6;
  return (
    <div className={className} {...rest}>
      <div style={{
        fontFamily: 'var(--ob-font-mono)',
        fontWeight: 'var(--ob-weight-medium)',
        fontSize, letterSpacing: '0.06em', color: 'var(--ob-fg)',
      }}>
        <span style={{ color: 'var(--ob-fg-faint)' }}>[</span>
        {' obscuro '}
        <span style={{ color: 'var(--ob-fg-faint)' }}>]</span>
      </div>
      {withTag && (
        <div style={{
          fontFamily: 'var(--ob-font-alt)', fontSize: tagSize,
          letterSpacing: 'var(--ob-track-logo)', color: 'var(--ob-fg-muted)',
          marginTop: gap,
        }}>MEDIAWORKS</div>
      )}
    </div>
  );
};

/** Overlay de grano. Decorativo: no recibe puntero ni lectores de pantalla. */
const Grain = ({ opacity, className, ...rest }) => (
  <div
    aria-hidden
    className={className}
    style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      opacity: opacity != null ? opacity : 'var(--ob-grain-opacity)',
      mixBlendMode: 'overlay',
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    }}
    {...rest}
  />
);

export {
  Theme, Display, Title, Lead, Body, Eyebrow, Caps, Mono,
  Chip, Section, Rule, MetaRow, Facts, LogoMark, Grain,
};
