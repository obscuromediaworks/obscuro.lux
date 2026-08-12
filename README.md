# Obscuro Mediaworks — Site

Sitio del estudio. Dos marcas bajo el mismo proyecto:

- **/** — Obscuro Gamecrafting (homepage)
- **/#/lux** — LUX (sub-práctica de identidad y diseño digital)
- **/#/mediaworks** — Landing combinado heredado (fallback)

## Stack

HTML estático + React 18 + Babel standalone (sin build step). Todo se renderiza en el cliente desde `<script type="text/babel">` tags. Fonts vía Google Fonts. Sin dependencias de npm.

## Estructura

```
site.html                  Source — entry HTML, importa todos los .jsx
design-canvas.html         Comparador de exploración de diseño. NO es el sitio.
                           (se llamaba index.html: servirlo dejaba el dominio en negro)
shared.jsx                 Utilidades + LogoMark + datos compartidos
site-app.jsx               Routing (hash router) + detección desktop/mobile
page-games.jsx             Obscuro Gamecrafting (desktop)
page-games-mobile.jsx      Obscuro Gamecrafting (mobile)
variation-b.jsx            Landing Mediaworks heredado (desktop)
variation-b-mobile.jsx     Landing Mediaworks heredado (mobile)
lux/
  lux-shared.jsx           Datos + utilidades LUX
  lux-c.jsx                LUX — variación elegida ("minimal grotesk")
  lux-a.jsx, lux-b.jsx     Variaciones descartadas (atelier, etéreo) — archivo
  design-canvas.jsx        Starter para la pantalla de exploración
LUX Exploration.html       Comparador de las 3 variaciones de LUX
assets/                    Video de fondo del hero de Games (LE2)
deploy/                    Bundle listo para deploy
  index.html               Self-contained, todo inlineado
  favicon-*.{png,svg}      Favicons (raíz)
  site.webmanifest
```

## Deploy

```bash
npm run deploy
```

Sube `deploy/` al Worker `obscuro-lux-site`, que tiene los tres dominios.
**Todo el detalle, las trampas y cómo hacer rollback están en [DEPLOY.md](DEPLOY.md)** — leerlo
antes de tocar el deploy.

Regla corta: **`deploy/index.html` es el sitio; `index.html` de la raíz NO** (es el comparador de
exploración, y servirlo deja el dominio en negro).

Para regenerar el bundle (cualquier IDE / proyecto):

```bash
# desde el proyecto activo, usar super_inline_html (helper interno).
# si lo haces a mano, conviene servir site.html con un static server
# y dejar los .jsx + assets/ relativos.
```

## Routing

```
/             → Obscuro Gamecrafting
/#/lux        → LUX
/#/mediaworks → landing combinado heredado
```

Mobile/desktop se decide con `matchMedia('(max-width: 720px)')`. Cambio en vivo (sin reload).

## Pendiente

- [ ] Mobile dedicado para LUX (hoy es responsive vía CSS de emergencia, no tuneado a mano)
- [ ] OG image / metadata por ruta

## Marca

- Obscuro: `#0a0a0a` background, `#f5e9d4` cream text, accent oro `#c9a96e`. JetBrains Mono + Cormorant + Space Grotesk. VHS overlay para piezas de Games.
- LUX: blanco puro, negro `#000`, hairlines `rgba(0,0,0,0.14)`. Geist Light + JetBrains Mono. Sin imagery — solo tipografía y aire.

— Buenos Aires · MMXXVI
