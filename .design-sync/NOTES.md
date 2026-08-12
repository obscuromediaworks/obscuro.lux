# Notas de design-sync — Obscuro Mediaworks

## Por qué el converter estándar no aplica

`obscuro.lux` no tiene `package.json`, lockfile, `dist/`, ni Storybook: es JSX
interpretado por Babel standalone en el navegador, sin build. El converter de
la skill descubre componentes desde los `.d.ts` de un `dist/` compilado — acá
hubiera dado `[ZERO_MATCH]` de entrada.

Alcance acordado con el usuario: **fundaciones CSS-first**, no una migración
del sitio. Se escribieron 15 primitivas nuevas en `design-system/src/index.jsx`
sobre `design-system/tokens.css`. **No se tocó** `shared.jsx` ni ningún archivo
del sitio existente — el usuario descartó explícitamente esa opción.

## Generador off-script

`.ds-sync/obscuro-build.mjs` produce el mismo layout que el converter oficial
(bundle IIFE con header `@ds-bundle`, `.d.ts`/`.prompt.md`/`.html` por
componente, `_ds_sync.json`, `.stories-map.json`) pero por otra vía, que es lo
que la skill autoriza para repos fuera de su envelope. Reutiliza
`lib/sync-hashes.mjs` (`sourceKeyFor`, `renderHashFor`, `KEY_RECIPE`) para que
las claves de grade y los render hashes sean compatibles con
`package-capture.mjs` / `package-validate.mjs` sin fork.

Comando: `node .ds-sync/obscuro-build.mjs` (config: `buildCmd` en config.json).

## Decisiones de esta corrida

- **`cardMode: "column"` en TODAS las tarjetas** (no por componente): el
  sistema es tipográfico — el display serif llega a 96-280px — y en una grilla
  de celdas de 320px casi todo desborda. La contact-sheet inicial mostró texto
  recortado en Display/Title/LogoMark/Grain/Section antes de este cambio.
  Está hardcodeado en el generador, no en `cfg.overrides`, porque aplica a la
  totalidad del set.
- **React 18.3.1, no 19**, para el `_vendor/`: React 19 dejó de publicar los
  builds UMD (`react/umd/react.development.js`) que las tarjetas cargan por
  `<script>`. Coincide con la versión que usa el sitio real.
- **Grain se reautoró.** La primera preview mostraba el overlay sobre negro
  casi puro (`#070504`/`#0a0a0a`) — un grano al 6-14% ahí es invisible, la
  tarjeta no demostraba nada. Se reescribió sobre un degrade con medios tonos
  (comparación con/sin + barrido de intensidades 0.06/0.14/0.4), que es
  también el uso honesto: en el sitio real el grano va sobre video, no sobre
  negro plano.
- **`--ob-fg-muted` de LUX bajó de `#888` a `#6b6b6b`** durante la fase previa
  (armado de `tokens.css`), no en esta sync — se documenta acá porque el grade
  de `Body/Claro` la verifica (5.33:1, antes 3.54:1, no cumplía AA).
- Sin `_ds_bundle.css`: no hay CSS de componente aparte de `tokens.css` (que
  entra por `styles.css`). Es CSS-first por diseño, no un `[CSS_RUNTIME]` a
  investigar.

## Cobertura

15/15 componentes con preview autorada, 27/27 celdas calificadas `good`.
No hay floor cards en este sync — el alcance completo (fundaciones) se
autoró de una.

## Riesgos de re-sync — qué puede quedar desactualizado

- **El generador es un fork manual del layout, no el converter oficial.** Si
  una futura versión de la skill cambia el contrato del `<Name>.html`
  (`.ds-grid`/`.ds-cell`/mounts `id^="r"`) o el header `@ds-bundle`,
  `obscuro-build.mjs` hay que actualizarlo a mano — no hereda fixes del
  converter.
- **Las props (`PROPS` en el generador) están escritas a mano**, no
  extraídas de un `.d.ts` real. Si `design-system/src/index.jsx` cambia una
  firma, hay que actualizar `PROPS`/`USAGE`/`RULES` en paralelo — no hay
  chequeo automático de que coincidan (sí se valida que los nombres citados
  en `conventions.md` existan, pero no que la firma completa sea correcta).
- **`design-system/src/index.jsx` es una copia nueva**, no una extracción de
  `shared.jsx`. Si el sitio real (`shared.jsx`, `page-games.jsx`, `lux/*.jsx`)
  cambia sus componentes equivalentes (`LogoMark`, `Grain`, etc.), este
  sistema **no se entera** — son dos implementaciones independientes que
  comparten intención de diseño pero no código. Migrar el sitio a consumir
  `design-system/src/` sería el siguiente paso natural, pero es una decisión
  aparte (se descartó explícitamente para esta corrida).
- **`ts-morph` no está instalado** en `.ds-sync/node_modules` — el chequeo de
  parseo de `.d.ts` se saltea (`(.d.ts parse check skipped)`). Los `.d.ts`
  están escritos a mano y no se validó que sean TypeScript válido más allá de
  la inspección visual.
- **Sin Storybook ni referencia real**: todo grade es absoluto (rúbrica
  estilado/completo/plausible), no comparado contra un render de referencia.
