# Dossier — OBSCUROMEDIAWORKS · Sitio + Design System + Estudio

| | |
|---|---|
| **Repo** | `G:\Github\obscuro.lux` — `obscuromediaworks/obscuro.lux` |
| **Asana** | **OBSCUROMEDIAWORKS — Sitio & Estudio**, gid `1217424610945968` |
| **Trigger** | "vamos con OBSCUROMEDIAWORKS" |
| **Público** | https://obscuromediaworks.com.ar · `www.` · `lux.` |
| **Stack** | HTML estático + React 18 + Babel standalone, servido por un Worker de assets |
| **Workflow** | Claude Code + Design. Roi diseña, Claude implementa y deploya **cuando Roi lo pide** |

## Qué contiene

- El **sitio del estudio** — `/` Obscuro Gamecrafting · `/#/lux` LUX · `/#/mediaworks` landing heredado.
- El **design system de la marca paraguas** — `design-system/tokens.css` (un set de tokens, tres
  temas) + `BRAND.md`. Preview local en el puerto 5070.
- **`studio/`** — el sistema de agentes y el Modo God. Esta carpeta.

## Deploy

```bash
npm run deploy
```

Sube `deploy/` al Worker `obscuro-lux-site`. **Todo el detalle en `DEPLOY.md`** — leerlo antes de
tocar nada del deploy. Dos cosas que no se negocian:

- **`deploy/index.html` es el sitio; `index.html` de la raíz NO.** Servir la raíz deja el dominio
  en pantalla negra (el comparador de exploración crashea en React).
- **Cada push a `main` dispara un deploy automático.** Un push publica.

## Reglas

- **`/design-sync` lo corre Roi**, no un agente.
- El design system es **solo para la marca paraguas**. Los juegos tienen identidad propia.
- Móvil de LUX está pendiente: hoy es responsive por CSS de emergencia, no tuneado a mano.
  Bloqueado por la decisión `lux-subdomain-scope` (ver abajo) — no tiene sentido tunear a mano
  algo cuyo alcance todavía no está definido.

## Rutina de arranque (activa acá, ver STUDIO.md §9)

Este es el primer y hoy único proyecto donde corre la rutina automática: al trigger, se refresca
`asana-cache.json`, lo ejecutable se reparte a los roles, y lo que depende de una decisión de Roi
queda en `studio/modo-god/decisions.json` para resolver desde `/modo-god` (o acá, si preguntás).

## Zips para hosting estático desde Windows

`Compress-Archive`, `tar` y `ZipFile` generan paths con `\` y rompen el hosting.
**Único método seguro:** `ZipArchive` low-level escribiendo las entradas con `Replace('\','/')`.

## itch.io — perfil del estudio (propuesta, 13/8/2026)

**Estado: propuesta para iterar con Roi. Nada de esto está aplicado — no hay acceso a la
cuenta de itch.io desde acá.** Alcance: `obscuro.itch.io`, el perfil de **creador/estudio**,
no la página de MOBA Warmup (`obscuro.itch.io/mobawarmup`), que tiene su propia identidad
Hextech y no se toca.

Assets generados, en el repo: `design-system/applications/itch-profile/`
- `banner-1920x480.png` + `banner-source.html` (el HTML que lo genera)
- `grain-tile-160x160.png` + `grain-tile-source.html` (tile de grain seamless, mismo shader
  que `Grain` de `shared.jsx`) + `grain-tile-preview-960x400.png` (prueba de que tilea sin costura)

Método: HTML real con los fonts de Google Fonts de la marca, capturado a PNG con Playwright
(headless Chromium, ya instalado en `.ds-sync/node_modules` — **no se tocó ni se corrió
`package-*.mjs` de design-sync**, solo se usó el Chromium disponible desde un script propio
y descartable). Contraste medido con la fórmula WCAG, no estimado.

### 1. Qué permite itch.io hoy en un perfil de creador (con fuente)

Confirmado bajando el HTML/CSS real de `obscuro.itch.io` hoy y la documentación oficial
(`itch.io/docs/creators/design`, `itch.io/docs/creators/css-guide`, blog post
`itch.io/blog/1068635/customizing-your-profile-page`):

- **El perfil ya tiene un tema propio activo**, no es el default de itch. El HTML trae un
  `<style id="user_theme">` inline con: fondo `#141414`, panel `#2c2c2c`, texto `#a9a9a9`,
  link `#cfcfcf`, fuente `Lato` al 130%, `border-radius: 10px`, y un **background tileado**
  (`https://img.itch.zone/aW1nLzEzMTk4MjU0LmpwZw==/original/e4qvUC.jpg`, textura genérica de
  stock). Nada de esto es de la marca — es lo que dejó el editor de temas de itch en algún
  momento, sin curar.
- **Banner**: el `<div class="image_header"><img class="profile_banner"/></div>` existe en el
  markup pero **está vacío hoy** — no hay banner subido. Sin banner, itch muestra el nombre
  como `<h1>` plano (hoy dice "OBSCURO"). El editor de temas ("Edit theme", visible arriba de
  la página cuando estás logueado como dueño) permite subir banner (PNG con transparencia o
  GIF) y fondo, con controles de repetición.
- **Fuentes: NO están limitadas a una lista curada.** La doc oficial dice explícito: *"we make
  available every font that is on Google Fonts"*. Esto quiere decir que **JetBrains Mono,
  Space Grotesk y Cormorant Garamond son seleccionables desde el editor de temas**, sin pedir
  nada — el perfil actual usa Lato porque nadie lo cambió, no porque itch lo obligue.
- **Colores**: el editor expone 4-6 roles (BG, BG2, Text, Link, Buttons, Headers) + alpha del
  panel + `border-radius`. No es el sistema completo de tokens (no hay `--ob-fg-muted/subtle/
  faint` independientes, todo es un solo color de texto), pero alcanza para fondo `#0a0a0a`,
  texto crema, acento oro y esquina viva (`border-radius: 0`).
- **Bio**: campo de texto enriquecido ("Edit profile"), soporta un subconjunto de HTML
  (párrafos, saltos de línea, negrita, links). No soporta clases custom salvo que tengas CSS
  habilitado (ver limitación abajo).
- **CSS custom SÍ existe en perfiles** (no solo en páginas de juego) — la guía lista
  explícitamente *"Project pages, Jam pages, **Profile pages**"* como superficies con editor
  de CSS. Pero es **opt-in por cuenta, a pedido**: hay que escribirle a soporte de itch
  describiendo qué se quiere lograr que el editor de temas no permita, confirmar que no se va
  a romper accesibilidad ni el UI del sitio, y esperar la aprobación (según la doc, puede
  tardar días o semanas). **No es un feature pago** — la cuenta de Obscuro además ya calificaría
  (no está vacía: tiene MOBA Warmup + Bloodline EP1 publicados), pero sigue siendo un pedido
  externo con tiempo de espera indefinido, no algo que se resuelve hoy.
- **Ancho de columna**: `.inner_column` mide `max-width: 960px` (confirmado en el CSS real,
  y corroborado por un admin de itch en el foro). El banner, en cambio, vive *fuera* de esa
  columna (`.image_header` no tiene max-width propio, solo el `<img>` con
  `max-width:100%; max-height:1024px`), así que se muestra centrado a su tamaño natural sin
  estirarse — de ahí que la práctica recomendada (y la que se siguió acá) sea diseñarlo ancho
  (1920px) para que se vea nítido en pantallas grandes y se escale hacia abajo sin perder nada
  crítico, porque la composición está centrada.

### 2. Banner propuesto — APROBADO por Roi (13/8/2026)

`design-system/applications/itch-profile/banner-1920x480.png` (1920×480, fondo `--ob-ink-800`
`#0a0a0a`, tema `obscuro`).

**Revisión 13/8:** la primera versión usaba el wordmark (ver historial de este archivo). Roi
pidió sumar el isotipo (el triángulo) y, ante la regla de `BRAND.md` de que isotipo y wordmark
nunca conviven en la misma composición, eligió explícitamente que el isotipo **reemplace** al
wordmark en vez de convivir con él — la pieza queda alineada con la regla tal como está escrita,
no es una excepción.

Composición: `isotipo-dark.jpg` (matchea exacto el fondo `#0a0a0a` del tema `obscuro`, sin
recuadro visible — el 10% de resguardo ya viene horneado en el archivo) a 260px de alto,
centrado, + hairline + firma en mono dorado `GAME STUDIO · BUENOS AIRES · MMXXVI`. Grain al 6%
(`--ob-grain-opacity` del tema obscuro) sin cambios. Render vía Playwright headless
(`.ds-sync/node_modules`, mismo mecanismo que usó Arte, script descartable ya borrado) sobre
`banner-source.html`, que quedó actualizado en el repo con el `<img>` en vez del lockup de texto.

### 3. Avatar propuesto

No hace falta generar nada nuevo: usar `design-system/assets/isotipo-master.png` (2048×2048,
alpha) tal cual. Es exactamente el caso de uso que describe `BRAND.md` para el isotipo
("avatar de red"), y el PNG con transparencia es la opción segura porque no sabemos el color
exacto del marco que itch le pone al avatar en su propio UI. Si itch exige opaco (no siempre
aceptan alpha en avatares), el fallback es `isotipo-dark.jpg` (compuesto sobre `#0a0a0a`, que
es casi idéntico al fondo propuesto).

Advertencia real: no confirmé si itch recorta el avatar en círculo o en cuadrado con esquina
redondeada — no encontré el avatar propio renderizado en el HTML público (solo aparece en
UI que requiere estar logueado). El isotipo ya trae ~10% de resguardo horneado, así que
tolera un recorte cuadrado con esquina redondeada sin problema; un recorte circular agresivo
sí podría comerse las puntas del triángulo — **a confirmar visualmente subiendo el archivo**,
no algo que se pueda verificar sin acceso a la cuenta.

### 4. Fondo del perfil (opcional, sin pedir CSS)

`grain-tile-160x160.png`, seamless, para setear como "background image" con repeat en el
editor de temas — mismo grain que usa el sitio (6%, shader `feTurbulence` idéntico al de
`Grain` en `shared.jsx`). `grain-tile-preview-960x400.png` prueba que tilea sin costura visible
a 960px (el ancho real de la columna de itch). Es un detalle chico pero es la diferencia entre
"plano #0a0a0a" y algo con la textura atmosférica de la marca — y no requiere pedir nada a
soporte de itch, es 100% editor de temas nativo.

Configuración de tema sugerida (todo dentro del editor "Edit theme" nativo, sin CSS access):
| Control | Valor |
|---|---|
| BG | `#0a0a0a` |
| BG2 (panel de contenido) | `#0f0f0f` (`--ob-ink-700`, "elevado") |
| Text | `#f5f4ef` |
| Link / Buttons | `#c9a96e` |
| Headers (fuente) | JetBrains Mono |
| Body (fuente) | Geist |
| Border radius | `0` (esquina viva — la única excepción del sistema son los chips, que acá no aplican) |
| Background image | `grain-tile-160x160.png`, repeat |
| Banner | `banner-1920x480.png` |

### 5. Bio propuesta

La bio actual (en inglés, ya publicada) usa exactamente el lenguaje que `BRAND.md` prohíbe:
*"passionate about creating immersive experiences"*, *"We love what we do"*, *"push our ideas
to new horizons"* — adjetivos antes que datos, tono de folleto. Reescritura siguiendo el tono
(frases cortas afirmativas, datos concretos, sin "pasión/soluciones/innovador", firma
`Buenos Aires · MMXXVI`). Se mantiene en **inglés** porque es el idioma dominante de la
audiencia de itch.io (la bio vigente ya está en inglés, y el estudio publica juegos/redes en
inglés) — si Roi prefiere español, es una decisión de una línea, no de estructura:

```
Game studio — Buenos Aires, Argentina. Founded MMXIX.

Two titles shipped here: MOBA Warmup Gym, Bloodline EP 1.
Audio and sound design (Wwise) on Bony's Quest and Labyrinth Encounters.

Mechanics, sound, and everything holding them together.

obscuromediaworks.com.ar
Buenos Aires · MMXXVI
```

**Display name — decidido por Roi (13/8/2026): "OBSCURO GAMECRAFTING".** Ni "OBSCURO" a secas ni
"Obscuro Mediaworks" — la división de juegos, no la marca paraguas entera. Es lo que va a salir en
la pestaña del navegador y en `og:title`/`twitter:title` una vez que Roi lo cambie en Account →
Profile (paso manual, no bloqueante).

### 6. Limitaciones reales — sin suavizar

- **El editor de temas de itch NO es el sistema de tokens completo.** Un solo color de texto,
  no los cuatro niveles de opacidad (`--ob-fg-muted/subtle/faint`); un solo par de fuentes
  (body + headers), no los cuatro roles tipográficos (display/sans/alt/mono) conviviendo; sin
  jerarquía por opacidad fina. El resultado se va a "sentir" Obscuro, pero no va a ser
  pixel-igual al sitio.
- **Sin CSS access no hay VHS, no hay marquee, no hay control de spacing/grilla, no hay
  `.ob-chip`/`.ob-eyebrow` reales** — son componentes del sitio, no existen en itch. Tampoco
  aplica: son recursos de Gamecrafting, no del tema `obscuro`, así que no se pierde nada que
  correspondiera acá igual.
- **Pedir CSS access es una decisión aparte, con tiempo de espera fuera de nuestro control**
  (días a semanas, y depende de que soporte de itch apruebe el pedido). No es algo para
  resolver en esta pasada ni algo que un agente pueda gestionar — es un trámite que hace Roi
  si decide que vale la pena ir más allá del editor de temas.
- **El banner no se estira a full-bleed**: itch lo centra a tamaño natural (con tope de
  1024px de alto), no lo fuerza a ocupar todo el ancho de pantalla. Diseñarlo a 1920px de
  ancho es la mitigación estándar, no una garantía — en monitores ultra-anchos puede quedar
  con aire a los costados. Eso ya es intencional en la composición (todo centrado).
- **No hay forma de que un agente aplique nada de esto.** No hay acceso a la cuenta
  `obscuro.itch.io` desde acá, y aunque lo hubiera, esto se define iterando con Roi, no
  ejecutando directo — así lo pidió explícitamente.

### 7. Qué falta para aplicar esto

Todo lo de acá arriba queda en propuesta. Para que exista en itch.io, Roi tiene que, desde su
cuenta:
1. Entrar a `obscuro.itch.io` logueado como dueño → botón **"Edit theme"**.
2. Subir `banner-1920x480.png` como banner.
3. Subir `isotipo-master.png` (o `isotipo-dark.jpg`) como avatar/imagen de perfil, desde
   **Account → Profile**.
4. Setear los colores/fuentes/radius de la tabla de §4, y opcionalmente `grain-tile-160x160.png`
   como background image con repeat.
5. Reemplazar el texto de "Edit profile" por la bio de §5 (o la versión que Roi prefiera).
6. Cambiar el display name a "OBSCURO GAMECRAFTING" (decidido 13/8). Opcional, no bloqueante:
   pedir CSS access a itch si más adelante hace falta ir más allá del editor de temas.

Ningún paso de estos lo puede hacer un agente — todos requieren la sesión logueada de Roi
en itch.io.
