# Dossier — Obscuro Mediaworks · Sitio + Design System *(interno)*

| | |
|---|---|
| **Repo** | `G:\Github\obscuro.lux` — `obscuromediaworks/obscuro.lux` |
| **Público** | https://obscuromediaworks.com.ar |
| **Stack** | HTML estático + React 18 + Babel standalone. **Sin build step, sin npm.** |

## Qué contiene

- El **sitio del estudio** — `/` Obscuro Gamecrafting · `/#/lux` LUX · `/#/mediaworks` landing heredado.
- El **design system de la marca paraguas** — `design-system/tokens.css` (un set de tokens, tres
  temas) + `BRAND.md`. Preview local en el puerto 5070.
- **`studio/`** — el sistema de agentes y el Modo God. Esta carpeta.

## Deploy

`deploy/index.html` es self-contained (assets, fonts y scripts inlineados). Se sube el contenido de
`deploy/` a la raíz del hosting. Regenerar el bundle antes de subir.

## Reglas

- **`/design-sync` lo corre Roi**, no un agente.
- El design system es **solo para la marca paraguas**. Los juegos tienen identidad propia.
- Móvil de LUX está pendiente: hoy es responsive por CSS de emergencia, no tuneado a mano.

## Zips para hosting estático desde Windows

`Compress-Archive`, `tar` y `ZipFile` generan paths con `\` y rompen el hosting.
**Único método seguro:** `ZipArchive` low-level escribiendo las entradas con `Replace('\','/')`.
