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
