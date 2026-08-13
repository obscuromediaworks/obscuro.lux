# Deploy del sitio

> Este archivo existe porque el 12/8/2026 el dominio estuvo sirviendo una pantalla negra y nadie
> podía saber por qué: el repo no tenía **ni una línea** sobre cómo se publicaba. Si cambiás algo
> del deploy, actualizá esto en el mismo commit.

## El comando

```bash
npm run deploy
```

Eso es todo. Sube `deploy/` al Worker **`obscuro-lux-site`**, que tiene atados:

- `obscuromediaworks.com.ar`
- `www.obscuromediaworks.com.ar`
- `lux.obscuromediaworks.com.ar`

Requiere `npx wrangler login` (el OAuth caduca ~24 h). Cuenta `obscuromediaworks@gmail.com`,
account id `630e82a95b7e0195814dd7891e25fc8c`.

**`lux.` redirige al apex (decidido 12/8, decisions.json id `lux-subdomain-scope`).** El Worker ya
no es solo assets: `src/index.js` intercepta el host `lux.obscuromediaworks.com.ar` y devuelve un
301 a `obscuromediaworks.com.ar/#/lux`; todo lo demás lo sigue sirviendo `deploy/` sin cambios vía
el binding `ASSETS`. Este cambio está commiteado pero **no deployado** hasta el próximo
`npm run deploy`.

## ⚠️ Lo único que no hay que confundir

**El sitio es `deploy/index.html`. En la raíz del repo ya NO hay ningún `index.html`,
y así tiene que quedar.**

| Archivo | `<title>` | Qué es |
|---|---|---|
| `deploy/index.html` | `— Estudio de diseño y desarrollo` | **el sitio**, self-contained, 2,1 MB |
| `design-canvas.html` (raíz) | `— Landing (3 variaciones)` | comparador de exploración de diseño |

Ese comparador **crashea en React** (`DesignCanvas` → `AProjects`) y deja el `<body>` con cero
contenido. Mientras se llamaba `index.html`, cualquier deploy que sirviera la raíz lo publicaba
como si fuera el sitio y el dominio se veía **negro** — fue el incidente del 12/8. Se renombró a
`design-canvas.html` justamente para desactivar la trampa.

**No vuelvas a crear un `index.html` en la raíz.** `wrangler.toml` fija `directory = "./deploy"`,
pero la defensa real es que no haya nada publicable ahí arriba.

**Cómo verificar un deploy en 5 segundos:** mirá el `<title>` de la pestaña, no el status code.

```bash
curl -s https://obscuromediaworks.com.ar/ | grep -o '<title>[^<]*</title>'
```

## Flujo de trabajo

El sitio se hace con **Claude Code + Design**. El fuente son `site.html` + los `.jsx`;
`deploy/index.html` es el **bundle self-contained** (assets, fonts y scripts inlineados) que se
regenera antes de publicar. El deploy lo corre Claude cuando Roi dice **"deployá"** — nunca solo,
y nunca como parte de una rutina de cierre.

## Cómo se regenera `deploy/index.html` (pipeline propio, desde 2026-08-12)

`deploy/index.html` no es HTML plano: es un **bundle self-decompressing**. Adentro tiene un
`<script type="__bundler/manifest">` con blobs de JS/CSS/fuentes comprimidos (gzip + base64)
indexados por UUID, y un script runtime que al cargar los descomprime con `DecompressionStream`,
arma blob URLs, y reemplaza el `<html>` entero vía `DOMParser` — reconstruyendo en el navegador lo
que en origen son `site.html` + los `.jsx` sueltos + las fuentes de Google Fonts.

Hasta el 12/8/2026 no había forma reproducible de generarlo (el helper original, `super_inline_html`,
vive del lado de Claude Design y no corre desde Code). Ahora hay un build propio:

```bash
npm run build-site
```

Corre `scripts/build-site.mjs` (Node, sin dependencias — usa `fetch`/`zlib` nativos) y **reemplaza
`deploy/index.html`**. Toma:

- `site.html` — el documento fuente. Cada `<script src="…jsx" type="text/babel">` se lee del disco
  y se empaqueta como blob `application/javascript`; cada `<script src="https://…">` externo
  (React, ReactDOM, Babel standalone, hoy vía unpkg) se descarga y se empaqueta como
  `text/javascript`; el `<link href="fonts.googleapis.com/css2?…">` de Google Fonts se resuelve
  (con un User-Agent moderno para que sirva `woff2`), cada `.woff2` referenciado se descarga y se
  empaqueta como `font/woff2`, y el `<link>` se reemplaza por un `<style>` con `@font-face` inline
  apuntando a los blobs — sin esto el bundle necesitaría red para tipografía.
- El `<template id="__bundler_thumbnail">` de `site.html` pasa a ser el thumbnail que se ve
  mientras el bundle descomprime (antes de que corra React).
- `assets/` se sincroniza a `deploy/assets/` tal cual (esos archivos se sirven por path relativo,
  **no** se inlinean en el bundle — así referencia el video de fondo `page-games.jsx`).

El shell "unpacker" (el HTML/JS que envuelve el manifest y hace el `DecompressionStream` +
`DOMParser`) está copiado **byte a byte** de la versión que ya sirve producción — el script no
reinventa esa parte, sólo regenera el contenido empaquetado. Verificado con un diff programático
línea por línea contra `deploy/index.html` antes de este cambio.

**Verificación hecha el 12/8/2026 antes de pisar el `deploy/index.html` real:**
generé el bundle a un archivo aparte (`--out=`), y con Chrome headless (`--screenshot`,
`--dump-dom`) confirmé que las tres rutas (`/`, `#/lux`, `#/mediaworks`) renderizan con fuentes,
video de fondo y nav funcionando, sin el banner `[bundle] error` — que sí aparecía al abrir el
`deploy/index.html` viejo de la misma manera (ese archivo ya estaba desactualizado respecto a
`site.html`/`.jsx`, ver el resumen del commit que trajo este cambio). También confirmé que las 51
entradas del manifest coinciden con lo esperado (40 fuentes + 3 libs externas + 8 `.jsx`) y que
cada UUID del manifest aparece referenciado en el template. Con esa evidencia se reemplazó el
`deploy/index.html` real — no quedó como archivo de prueba aparte.

Para probar sin tocar el archivo real:

```bash
node scripts/build-site.mjs --out=deploy/index.build-test.html
```

Requiere acceso a red (unpkg + fonts.googleapis.com/fonts.gstatic.com) al momento de correrlo.

**Pendiente real:** este pipeline no hace nada con `ext_resources` (queda `[]`, como en el bundle
original — hoy nada en `site.html`/`.jsx` lo necesita) ni compila/minifica los `.jsx` — se
empaquetan como fuente cruda, igual que el bundle original, porque Babel standalone los transforma
en el navegador en tiempo de carga.

## Si algo sale mal

Volver a la versión anterior, en un comando:

```bash
npm run versions                    # listar versiones con fecha
npx wrangler rollback <version-id> --name obscuro-lux-site -y
```

Versión de referencia buena: `5d421a84-77de-4e2b-aee2-6b2d5c46aac3` (26/6/2026).

## Historial de incidentes

**2026-08-12 — el dominio en negro.** Un deploy sirvió la raíz del repo en vez de `deploy/`.
Estuvo así ~12 h. Se recuperó con `wrangler rollback` a `5d421a84`. De ahí salieron el
`wrangler.toml` versionado y este documento: antes, la configuración del deploy solo existía en la
sesión que lo había hecho.

Si el Worker tiene además una **integración de Git** (builds automáticos al pushear), ahora es
segura: el build lee este `wrangler.toml` y sirve `deploy/`. Antes no existía el archivo, y por eso
el build automático servía la raíz.
