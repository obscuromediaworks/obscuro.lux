# Dossier — ZAPAMOoKE! *(producto, no juego)*

| | |
|---|---|
| **Repo** | `G:\Github\Zapamooke` (privado) — `obscuromediaworks/zapamooke` (rama `main`) |
| **Asana** | *sin board todavía* — pendiente, ver §"Asana" abajo |
| **Trigger** | "Sigamos con Zapamooke" *(propuesto, a confirmar con Roi)* |
| **Motor** | Navegador: React + Vite + TS · AudioWorklet + WASM (Ogg Vorbis) + `SharedArrayBuffer` (headers COOP/COEP) · protocolo NINJAM · gateway propio (Go/Rust) |
| **Specs** | `docs/spec-zapamooke.md` (v0.4), `docs/spec-obscurostudio.md` (v0.2) e `docs/INDEX.md` dentro del repo — son la fuente de verdad, copiadas de `G:\Claude\_specs\`. Editarlas ahí adentro, no en `_specs` suelto. |

## Qué es

Sala de ensayo musical online que corre **entera en el navegador**, sin instalar nada, sobre
el protocolo NINJAM (audio Ogg Vorbis). Salas **públicas** (gratis, el gancho) y **privadas**
(pago, USD 15/banda/mes — el negocio). El diferencial no es el protocolo (eso ya lo resolvió
NINJAM hace 20 años): es un **portero técnico** obligatorio que no deja que alguien con mal
setup arruine la sala de los demás, y un **contrato de sala** con roles y moderación.

## El orden de trabajo es por riesgo, no por fase

Regla explícita de `docs/INDEX.md` y de §12 de la spec: **no se construye por pantalla ni por
fase**, se ataca primero lo que puede matar el proyecto. La lista completa de riesgos (R1–R18)
está en spec-zapamooke.md §12; los dos que importan ahora:

- **R1 (crítico, decide si el proyecto existe):** codificar Ogg Vorbis en el navegador con la
  performance necesaria para no romper la latencia del ensayo. Va en un **Worker separado del
  AudioWorklet**, alimentado por `SharedArrayBuffer` — eso obliga a servir con headers
  **COOP/COEP**. Si falla: plan B es Opus + transcodificación server-side (cambia arquitectura).
- **C2 de OBSCUROSTUDIO** (codificar FLAC en paralelo al Vorbis sin degradar el audio en vivo)
  es **el mismo experimento de la misma semana** que R1 — no un trabajo aparte.

## Estado (14/8/2026)

Bootstrap del repo hecho. `experiments/r1-vorbis-encode/` tiene el scaffold **funcional y
verificado** para correr el experimento R1:

- AudioWorklet de captura (plain JS, sin dependencias — ver nota de Vite abajo) → ring buffer
  lock-free sobre `SharedArrayBuffer` → Worker que codifica con un encoder Vorbis **real**
  compilado a WASM (`wasm-media-encoders`, no un stub).
- `vite.config.ts` sirve COOP/COEP en dev y preview. **Verificado con `curl -I`**: los headers
  salen.
- Verificado con `npx tsc --noEmit` (sin errores) y `npx vite build` (build limpio).
- **Lo que falta y es trabajo real, no scaffolding:** correr los 20 minutos continuos que pide
  el criterio de salida de Fase 1 (spec §11) y exportar el reporte JSON como evidencia antes de
  marcar R1 como resuelto. Esto no se hizo todavía — sin verificar.

### Gotcha de plataforma encontrado armando el scaffold

Vite tiene bundling de primera clase para `new Worker(new URL(...), { type: "module" })` pero
**no** para `audioWorklet.addModule(new URL(...))`: a ese segundo patrón lo trata como un asset
estático genérico y lo copia byte a byte, **sin transpilar TypeScript ni resolver imports**.
Un `.ts` con `import` ahí adentro se copia crudo al `dist` y es inválido en el navegador
(comprobado con un build real antes del fix). Solución aplicada: el AudioWorklet processor es
plain JavaScript, autocontenido (sin imports), no TypeScript. Ver el comentario en
`experiments/r1-vorbis-encode/src/audio/capture-processor.js`.

## Producto hermano: OBSCUROSTUDIO

**Marca aparte, repo aparte, todavía sin bootstrapear a propósito.** `docs/spec-obscurostudio.md`
(v0.2) es la spec: graba en FLAC lo que la banda toca en una sala de ZAPAMOoKE!, con mezcla y
exportación de stems. Depende de la misma validación técnica que Zapamooke (el C2 mencionado
arriba), pero es un **producto separado** — otra marca (oscura/nocturna vs. lúdica/diurna), otra
pantalla, otro consentimiento explícito por músico. No crear el repo hasta que arranque ese
trabajo puntual; cuando llegue el momento, sigue este mismo patrón (registry.json + dossier +
board de Asana).

## Reglas del proyecto (de la spec, no negociables sin pasar por Roi)

- **No se graba en ZAPAMOoKE!.** Ni la sesión, ni un buffer de moderación. Grabar es
  OBSCUROSTUDIO, con consentimiento individual explícito. Ver spec §13.
- **El gate técnico nunca se puede saltear**, ni para el host ni para nadie (spec §3.1).
- **La reputación es de conducta, nunca de habilidad musical.** Es el riesgo R15/R16: una
  palabra mal elegida en el copy puede cambiar qué cree la gente que se está calificando.
- Servidores propios (Hetzner/OVH/Scaleway/Vultr, tráfico plano), **no** servidores NINJAM
  públicos de terceros en el lanzamiento (spec §9.1).
- Vocabulario fijo: **ensayo** (banda, privado, pago) vs. **zapada** (abierta, gratis, con
  reputación). No mezclar los términos en UI ni en docs.

## Asana

**Pendiente de crear** — no se pudo armar el board desde esta sesión: la creación de
proyectos/tareas requiere el conector MCP de Asana (`mcp__cdc311db-…__*`, cuenta FREE,
`create_tasks`/`create_project` sin `privacy_setting` ni `start_on`), que no estaba disponible
en las tools de esta sesión. Workspace y team a usar son los mismos que el resto del estudio
(`gid 1214757798996025` / `gid 1214757798996027`, confirmar en `registry.json`).

**Estructura propuesta de secciones** (por riesgo, siguiendo spec §12 y el orden de
`docs/INDEX.md` — no por fase/feature):

1. **R1 — Vorbis WASM en tiempo real** (crítico, bloqueante de todo lo demás)
2. **R2–R5 — Riesgos técnicos de Fase 1** (deriva de reloj, onboarding del intervalo,
   COOP/COEP, Safari/iOS diferido)
3. **R9/R10 — Sala vacía y fricción del gate** (mitigación: calendario, no bloquean R1)
4. **Fase 2 — Producto** (cuentas, gate completo, roles, lobby, calendario — no arranca hasta
   que R1 esté resuelto con evidencia)
5. **R13–R18 — Riesgos de negocio y comunidad** (moneda local, reputación, dispersión — Fase 3
   en adelante, spec §8.5)
6. **Backlog / Parked**

Primera tarea a cargar en la sección 1 en cuanto el board exista: *"Correr R1 20 minutos
continuos, exportar reporte, decidir Vorbis-WASM vs. plan B Opus"* — es la que decide si el
resto del roadmap tiene sentido.

## Pendiente inmediato

1. Confirmar con Roi: nombre final del repo/slug (`zapamooke`, propuesto), texto exacto del
   trigger, y si conviene bootstrapear OBSCUROSTUDIO ya o esperar.
2. Crear el board de Asana (requiere el conector MCP en una sesión que lo tenga disponible).
3. Correr el experimento R1 20 minutos y decidir con evidencia.
