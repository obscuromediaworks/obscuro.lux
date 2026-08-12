# Obscuro Mediaworks — Sistema de diseño

Fuente de verdad de la marca paraguas. Todo lo que se diseñe para el estudio
—sitio, landings, presskits, redes, decks— sale de acá.

Los **juegos** tienen identidad propia (MOBA Warmup usa Hextech, LE2 lo suyo).
Este sistema no los gobierna; solo el sello del estudio cuando aparece en ellos.

- Tokens: [`tokens.css`](tokens.css) — fuente de verdad de valores.
- Preview: [`preview.html`](preview.html) — todo renderizado, los tres temas.

---

## 1. Arquitectura de marca

```
Obscuro Mediaworks            ← el estudio. Marca paraguas.
├── Obscuro Gamecrafting      ← división de videojuegos
└── LUX                       ← práctica de identidad y diseño digital
```

Tres temas, **un solo sistema**. Cambia la superficie y el acento; la escala,
el espaciado, el ritmo tipográfico y el tono son compartidos. Eso es lo que hace
que las tres se lean como el mismo estudio y no como tres clientes distintos.

| | Obscuro (estudio) | Gamecrafting | LUX |
|---|---|---|---|
| `data-theme` | `obscuro` | `gamecrafting` | `lux` |
| Fondo | `#0a0a0a` | `#070504` | `#ffffff` |
| Texto | `#f5f4ef` | `#f5e9d4` | `#000000` |
| Acento | oro `#c9a96e` | oro `#c9a96e` | ninguno |
| Cuerpo | Geist | Space Grotesk | Geist Light |
| Grain | 0.06 | 0.14 | **nunca** |
| VHS | no | sí | **nunca** |

**Decisiones tomadas** (había divergencia en el código, esto la resuelve):

- El negro del estudio es `#0a0a0a` (neutro). El de Gamecrafting es `#070504`
  (cálido, casi marrón). **No son intercambiables** — el cálido existe para que
  el oro y el grain se asienten sobre él.
- La crema del estudio es `#f5f4ef`. La de Gamecrafting es `#f5e9d4`.
  Misma lógica: la cálida acompaña al negro cálido.
- Se bajó de **8 familias tipográficas a 4** (+1 restringida).
  Deprecadas: Instrument Serif, Tenor Sans, Geist Mono.
  Geist Mono se unifica en JetBrains Mono.

---

## 2. Logotipo

Dos marcas distintas, no variantes de la misma:

**Logotipo (wordmark).** `[ obscuro ]` en JetBrains Mono Medium, minúscula,
con los corchetes al 40% de opacidad, y `MEDIAWORKS` debajo en Space Grotesk
con tracking `0.32em`. Es la marca primaria.

**Isotipo (el triángulo).** Triángulo escalonado con ojo, en oro sobre piedra
oscura. Se usa **solo** donde el wordmark no entra: favicon, avatar de red,
splash de juego, sello. Nunca junto al wordmark en la misma composición.

Archivos en [`assets/`](assets), 2048×2048 a 300 dpi, con 10% de resguardo ya
incorporado:

| Archivo | Fondo | Para |
|---|---|---|
| `isotipo-dark.jpg` | `#0a0a0a` | tema Obscuro, avatares, redes |
| `isotipo-warm.jpg` | `#070504` | tema Gamecrafting |
| `isotipo-white.jpg` | `#ffffff` | LUX, documentos, impresión |
| `isotipo-master.png` | transparente | **preferir este** cuando el fondo no es plano |

El JPG no tiene canal alpha: cada variante ya viene compuesta sobre su
superficie. Si el fondo no es exactamente uno de esos tres, usar el PNG maestro
—un JPG sobre el fondo equivocado deja un recuadro visible.

Origen: `MOBAWarmup/Assets/Resources/UI/logo_obscuro.png` (500×500). El reescalado
es Lanczos, así que **no hay detalle nuevo**: a 2048 los bordes están limpios pero
la textura de piedra es la del original. Para impresión grande hace falta
revectorizarlo.

### Reglas de uso

- Área de resguardo mínima: la altura de la `o` de "obscuro" en los cuatro lados.
- Tamaño mínimo del wordmark: 10px de cuerpo. Por debajo, usar el isotipo.
- Sobre imagen: el wordmark va sobre un scrim o una zona lisa. Nunca sobre
  detalle. Si no hay zona limpia, se le pone la barra sólida del color de fondo
  (así funciona el hero de Gamecrafting).

### Lo que no se hace

- No rotar, no inclinar, no dar contorno, no sombra paralela.
- No cambiar el color de los corchetes (siempre 40% del color de texto).
- No traducir ni pluralizar "mediaworks".
- No poner el wordmark en oro. El oro es acento, no es la marca.
- No recolorear el isotipo fuera de oro sobre oscuro, o negro plano en 1 tinta.

---

## 3. Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | Cormorant Garamond Light | Titulares, lead. La cursiva va en oro. |
| Sans | Geist | Cuerpo del estudio y de LUX. |
| Alt sans | Space Grotesk | Cuerpo de Gamecrafting, tag del logo. |
| Mono | JetBrains Mono | Eyebrows, metadata, logotipo, timecodes. |
| VHS | VT323 | **Solo** overlays VHS de Gamecrafting. Nada más. |

**La firma tipográfica del estudio** es el contraste extremo: un display serif
enorme y liviano (hasta 280px, peso 300) contra mono de 11px con tracking de
`0.18em`. Si una pieza no tiene los dos, no se lee como Obscuro.

**Nada arriba de peso 600.** El sistema es liviano por diseño.

La cursiva del display en oro (`<em>`) es un recurso de énfasis, no de decoración.
Una o dos por titular, nunca tres.

---

## 4. Color

El oro `#c9a96e` es **el único acento del sistema**. No hay paleta secundaria,
no hay colores de estado cromáticos. Si algo necesita jerarquía, se resuelve con
opacidad del texto (70% / 50% / 30%) o con una hairline, no con color nuevo.

`#ff1f3e` (rojo REC) existe pero es **exclusivo del lenguaje VHS** — el punto
que parpadea. No es un color de error ni de alerta.

LUX **no tiene acento cromático**. Su jerarquía es 100% tipográfica y de aire.
Si una pieza de LUX tiene oro, está mal tematizada.

---

## 5. Composición

- **Esquina viva.** `border-radius: 0` en todo, salvo los chips (pill).
- **Separar con línea, no con caja.** Las secciones se dividen con una hairline
  al 8-12% de opacidad. Casi no hay tarjetas con borde completo.
- **Grilla de 12 con hairlines visibles** en LUX (es un recurso, se ve).
- **El aire es el lujo.** 160px entre secciones en desktop. No comprimir para
  que "entre más arriba del fold" — la marca no compite por atención.
- Canal lateral: 48px (Obscuro/Gamecrafting), 64px (LUX), 20px en mobile.

### Recursos atmosféricos — y su límite

Grain, VHS, marquee y video de fondo son parte del idioma de **Gamecrafting**.

- **Grain** al 6% en el estudio, 14% en Gamecrafting, 0% en LUX.
- **VHS** (scanlines, aberración cromática, tracking, timecode) solo en piezas
  de Gamecrafting, y solo sobre video o imagen — nunca sobre texto de lectura.
- **Marquee** máximo uno por pantalla.
- Todo esto se apaga con `prefers-reduced-motion`.

---

## 6. Tono de voz

Castellano rioplatense, sin voseo forzado. Sobrio y preciso; no jugado.

- Frases cortas y afirmativas. "Hacemos juegos." no "Nos apasiona crear juegos."
- Numeración de secciones — `(01)`, `§ 00`, `I / II / III`. La marca se comporta
  como un documento, no como un folleto.
- Datos concretos antes que adjetivos. "07 años · 02 disciplinas · 01 estudio."
- **Nunca**: "soluciones", "pasión", "innovador", "sinergia", signos de exclamación.
- Firma: `Buenos Aires · MMXXVI` — el año en romanos es marca.

LUX baja un tono más: casi institucional, frío, en tercera persona del plural.
"Entregamos sistemas, no archivos sueltos."

---

## 7. Accesibilidad

Contraste medido sobre el fondo de cada tema (AA de texto = 4.5:1):

| Token | Obscuro | Gamecrafting | LUX |
|---|---|---|---|
| `--ob-fg` | 17.98 ✅ | 16.94 ✅ | 21.0 ✅ |
| `--ob-fg-muted` | 8.89 ✅ | 8.31 ✅ | 5.33 ✅ |
| `--ob-fg-subtle` | 4.94 ✅ | 5.38 ✅ | 5.32 ✅ |
| `--ob-fg-faint` | 2.46 ❌ | 2.30 ❌ | 1.83 ❌ |
| `--ob-accent` (oro) | 8.85 ✅ | 9.09 ✅ | — |

- **`--ob-fg-faint` no cumple AA en ningún tema.** Es decorativo por definición
  (corchetes del logo, líneas de grilla). Nunca información necesaria.
- El oro llega a ~8.9:1 sobre negro: seguro para texto. **Negro sobre oro** da
  ~2.4:1 — solo para elementos no textuales o texto de 24px+.
- En LUX, `muted` y `subtle` casi coinciden (5.33 / 5.32): sobre blanco queda
  poco rango tonal que siga cumpliendo AA. Es deliberado — LUX saca su jerarquía
  del tamaño y del aire, no del tono.
- El gris histórico de LUX era `#888` (3.54:1, **no cumple**). Se reemplazó por
  `#6b6b6b`, que conserva la frialdad y llega a 5.33:1.
- Todo el movimiento respeta `prefers-reduced-motion`. El VHS se apaga entero.
- Los overlays (grain, VHS, scrims) llevan `aria-hidden` y `pointer-events: none`.

---

## 8. Inventario de componentes

Lo que ya existe en el código, en `shared.jsx` salvo aclaración:

| Componente | Estado | Nota |
|---|---|---|
| `LogoMark` | ✅ | 3 variantes × 4 tamaños |
| `Grain` | ✅ | overlay CSS/SVG |
| `VHSFrame` | ✅ | solo Gamecrafting |
| `Marquee` | ✅ | ticker horizontal |
| `BgVideo` | ✅ | video de fondo |
| `Placeholder` | ✅ | usa `#0f0f0f`/`#f5f4ef` hardcodeados → migrar a tokens |
| `useReveal` / `useLuxReveal` | ✅ | duplicados → unificar |
| `CGridLines` | `lux-c.jsx` | grilla de hairlines |
| Chip / botón | ⚠️ | inline en cada página → extraído a `.ob-chip` |
| Sección + eyebrow | ⚠️ | inline → extraído a `.ob-section` / `.ob-eyebrow` |

**Deuda conocida:** todos los estilos son objetos inline por página. La migración
a tokens es incremental — empezar por color y tipografía, que es donde está
la divergencia.

---

## 9. Datos de la marca

```
Estudio    Obscuro Mediaworks
Ciudad     Buenos Aires, Argentina
Fundación  MMXIX (2019)
Sitio      obscuromediaworks.com.ar
LUX        lux@obscuromediaworks.com.ar
itch.io    obscuro.itch.io
```
