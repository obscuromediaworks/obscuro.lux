# Obscuro Mediaworks — cómo construir con este sistema

Sistema de la marca paraguas: estudio, división de videojuegos (Gamecrafting)
y práctica de identidad (LUX). Es **tipográfico y de tokens**, no de utilidades.

## 1. Todo árbol arranca con `Theme` — sin excepción

`Theme` es el que define los tokens y pinta la superficie. Un componente fuera
de un `Theme` renderiza con estilos por defecto del navegador: sin color, sin
familia tipográfica, sin espaciado.

```jsx
<Theme name="obscuro">      {/* 'obscuro' | 'gamecrafting' | 'lux' */}
  <Section eyebrow="(01) Manifiesto">
    <Title>Audio que <em>recuerdas</em>.</Title>
    <Body>Somos un equipo independiente.</Body>
  </Section>
</Theme>
```

Los `Theme` se anidan: un bloque `lux` dentro de una página `obscuro` funciona,
porque cada uno pinta su propia superficie.

| Tema | Superficie | Cuerpo | Acento |
|---|---|---|---|
| `obscuro` | `#0a0a0a` / crema `#f5f4ef` | Geist | oro `#c9a96e` |
| `gamecrafting` | `#070504` / crema `#f5e9d4` | Space Grotesk | oro `#c9a96e` |
| `lux` | blanco / negro | Geist Light | **ninguno** |

## 2. El idioma: tokens `--ob-*`, más un vocabulario chico de clases

No hay clases de utilidad. Para tu propio layout usá los tokens directo; para
tipografía y piezas del sistema usá los componentes.

**Tokens** (definidos en `tokens/tokens.css`, todos con prefijo `--ob-`):

- Color: `--ob-bg`, `--ob-bg-elevated`, `--ob-fg`, `--ob-fg-muted`,
  `--ob-fg-subtle`, `--ob-fg-faint`, `--ob-accent`, `--ob-rule`, `--ob-rule-soft`
- Tipografía: `--ob-font-display`, `--ob-font-sans`, `--ob-font-alt`,
  `--ob-font-mono`; pesos `--ob-weight-light|regular|medium|semi`
- Escala: `--ob-text-2xs|xs|sm|base|md|lg|xl|2xl|3xl|display`
- Espaciado: `--ob-space-1` … `--ob-space-11`; canal `--ob-page-gutter`
- Movimiento: `--ob-ease`, `--ob-dur-fast|base|slow`

**Clases** (las emiten los componentes; usalas directo solo si necesitás el rol
sobre un elemento propio): `.ob-display`, `.ob-title`, `.ob-lead`, `.ob-body`,
`.ob-eyebrow`, `.ob-caps`, `.ob-mono`, `.ob-chip`, `.ob-section`, `.ob-rule`,
`.ob-rule-soft`.

Cualquier color, tamaño o espacio que no salga de un token está fuera de marca.

## 3. Reglas que no se negocian

- **Un solo acento.** El oro `--ob-accent`. No hay paleta secundaria ni colores
  de estado. La jerarquía se hace con opacidad de texto (`--ob-fg-muted` 70%,
  `--ob-fg-subtle` 50%) o con una hairline. Nunca con un color nuevo.
- **Esquina viva.** `border-radius: 0` en todo. La única excepción es `Chip`.
- **Separar con línea, no con caja.** Usá `Rule` o `.ob-rule`. Este sistema casi
  no tiene tarjetas con borde completo.
- **La cursiva dorada es la firma.** En `Display` y `Title`, envolver una o dos
  palabras en `<em>` las pinta de oro. Una o dos por titular, nunca tres.
- **Nada arriba de peso 600.** El sistema es liviano por diseño.
- **El aire es el lujo.** `Section` ya trae 160px de aire vertical. No lo
  comprimas para ganar fold.
- **LUX no lleva oro ni grano.** Si una pieza `lux` tiene acento cromático,
  está mal tematizada.
- `--ob-fg-faint` (30%) no cumple contraste AA: es decorativo, nunca información.

## 4. Tono de voz

Castellano rioplatense, sobrio. Frases cortas y afirmativas: "Hacemos juegos.",
no "Nos apasiona crear juegos". Secciones numeradas — `(01)`, `§ 00`, `I/II/III`:
la marca se comporta como un documento. Datos concretos antes que adjetivos.
Nunca: "soluciones", "pasión", "innovador", signos de exclamación.

## 5. Dónde está la verdad

Antes de estilar, leé `styles.css` y su cierre de imports —
`tokens/tokens.css` tiene los 82 tokens con sus tres temas. Cada componente
tiene su `.prompt.md` con props, ejemplo y reglas propias.

## 6. Ejemplo idiomático

```jsx
<Theme name="gamecrafting">
  <Section eyebrow="(02) Proyectos">
    <Title>Hacemos <em>juegos</em>.</Title>
    <Lead style={{ marginTop: 'var(--ob-space-5)' }}>
      El audio es nuestro diferencial.
    </Lead>
    <div style={{ display: 'flex', gap: 'var(--ob-space-3)', marginTop: 'var(--ob-space-7)' }}>
      <Chip as="a" href="/presskit">Press kit</Chip>
      <Chip>Contacto</Chip>
    </div>
    <MetaRow items={[['Doc.', 'OMW-2026-01'], ['Loc.', 'Buenos Aires'], ['Año.', 'MMXXVI']]} />
  </Section>
</Theme>
```
