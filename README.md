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

## Deploy — Cloudflare Pages

```powershell
.\scripts\deploy-site.ps1              # produccion
.\scripts\deploy-site.ps1 -Preview     # URL de preview, no toca el sitio vivo
.\scripts\deploy-site.ps1 -BuildOnly   # arma site-dist/ y no sube nada
```

`scripts/build-site.py` arma `site-dist/` = el bundle del sitio (`deploy/`) **más** el tablero de
operaciones en `/modo-god`. Un solo proyecto de Pages (`obscuro-mediaworks`) sirve las dos cosas,
así que la ruta `/modo-god` sale gratis: no hace falta un Worker que la proxee.

`site-dist/` es generado — no se versiona, no se edita a mano.

### ⚠️ Antes del primer deploy

1. **`npx wrangler login` con permisos de Pages.** El token actual de la cuenta
   `obscuromediaworks@gmail.com` **no tiene scope de Pages**: `whoami` anda pero
   `pages project list` responde "Not logged in". Hay que re-loguear y aceptar Pages.
2. **Dominio.** El apex ya está proxeado por Cloudflare, pero apunta a otro origen. Atarlo al
   proyecto Pages es un cambio de producción, y **los custom domains se agregan por dashboard o
   API REST, no por wrangler**. Conviene probar antes con `-Preview`.
3. **Proteger `/modo-god` con Cloudflare Access** (Zero Trust → Access → Applications), acotado a
   hostname + path `/modo-god`. El `robots.txt` y el `_headers` con `noindex` que genera el build
   son higiene de crawlers, **no** son seguridad.

### Deploy manual (el método anterior)

Subir el contenido de `deploy/` a la raíz del hosting. `deploy/index.html` es self-contained (assets, fonts y scripts inlineados).

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
