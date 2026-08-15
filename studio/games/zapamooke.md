# Dossier — ZAPAMOoKE! *(producto, no juego)*

| | |
|---|---|
| **Repo** | `G:\Github\Zapamooke` (privado) — `obscuromediaworks/zapamooke` (rama `main`) |
| **Asana** | [ZAPAMOoKE!](https://app.asana.com/1/1214757798996025/project/1217507207653240) — gid `1217507207653240` |
| **Trigger** | "Sigamos con Zapamooke" |
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

**R1 corrido y PASA.** Experimento automatizado de punta a punta (Playwright + Chromium headless,
micrófono falso, sin nadie mirando una pestaña), 20 minutos continuos reales (1199.885 s medidos
por la propia app), evidencia en `experiments/r1-vorbis-encode/RESULTS.md` +
`experiments/r1-vorbis-encode/results/` (reporte JSON de 1405 muestras, log con timestamps).

- `overrunCount = 0` en toda la corrida (la señal dura de pérdida real de audio).
- Real-time factor medio 0.006, máximo puntual 0.0116, peor chunk individual con RTF≈0.111 —
  muy por debajo del umbral de la spec (<1) y del que codifica el propio scaffold (<0.5).
- Corrido en hardware de escritorio de 2014 (i7-4790), no el equipo más rápido del estudio.
- Hallazgo documentado en `RESULTS.md`: el contador `underrunCount` del scaffold sube todo el
  tiempo por diseño del polling (5 ms de reintento contra ~85 ms por chunk), no porque el
  encoder se atrase — se cruza con `overrunCount=0` y RTF estable para descartar que sea señal
  real de starvation. No se redondeó el resultado: se documentó el matiz con los números.
- **Implicación de roadmap:** no hace falta el plan B (Opus + transcodificación server-side,
  spec §12 R1) para este riesgo. Sigue pendiente la prueba de Fase 1 completa (dos ciudades, con
  NINJAM real) porque necesita gateway + scheduler que todavía no existen — R1 destrababa esa
  construcción, no la reemplaza.
- Sigue **sin verificar** C2 de OBSCUROSTUDIO (FLAC en paralelo al Vorbis) — es un experimento
  relacionado pero no idéntico a R1; no se corrió acá.

Scaffold base (`experiments/r1-vorbis-encode/`), sin cambios de fondo desde el bootstrap:

- AudioWorklet de captura (plain JS, sin dependencias — ver nota de Vite abajo) → ring buffer
  lock-free sobre `SharedArrayBuffer` → Worker que codifica con un encoder Vorbis **real**
  compilado a WASM (`wasm-media-encoders`, no un stub).
- `vite.config.ts` sirve COOP/COEP en dev y preview. **Verificado con `curl -I`**: los headers
  salen.
- Verificado con `npx tsc --noEmit` (sin errores) y `npx vite build` (build limpio) — re-verificado
  después de agregar el harness de automatización.

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

Board creado 14/8/2026: [ZAPAMOoKE!](https://app.asana.com/1/1214757798996025/project/1217507207653240)
(gid `1217507207653240`), workspace `1214757798996025` / team `1214757798996027`, mismo espacio
que el resto del estudio. Secciones por riesgo (spec §12 / `docs/INDEX.md`, no por fase/feature):
R1 (crítico, bloqueante) → R2–R5 → R9/R10 → Fase 2 (Producto, no arranca hasta que R1 esté
resuelto con evidencia) → R13–R18 → Backlog/Parked (incluye OBSCUROSTUDIO).

## Estado R2–R5 + gateway (15/8/2026)

Todo con evidencia automática (Playwright/Chromium headless o tests contra un `ninjamsrv` real en
Docker), re-verificada antes de cerrar la sesión, no solo la corrida original:

- **R2 (deriva de reloj) — MATIZADO, no bloquea.** Veredicto sin cambios respecto del 14/8 (ver
  arriba). Esta pasada además: reescribió el análisis en vivo de saltos/parada a un método por
  ventanas de 20 s (mediana de ppm) — más robusto que el umbral por muestra, que daba falsos
  positivos con audio real conectado; **no cambia el veredicto**, que salió de analizar a mano
  `boundaries[]`, no de esa vista en vivo. Y corrió un A/B `idle` vs `active` (3 min cada uno) para
  probar la hipótesis de causa raíz de los 11 saltos de la corrida de 20 min: el número que le
  importa a la mitigación (peor residual por intervalo) es igual en los dos modos (49.0 ms vs
  50.6 ms), pero el lag total concentrado en "paradas" es mucho menor en `active` (2.3 ms vs
  70.8 ms) — apunta hacia throttling de un `AudioContext` idle, sin confirmarlo con certeza (muestra
  chica, no se repitió a la escala de 150 intervalos). Ver `experiments/r2-clock-drift/RESULTS.md`.
- **R3 (loopback de intervalo) — RESUELTO.** La corrida del 14/8 fallaba su propio umbral (5/36
  intervalos con 10.688 ms de error, causa: el `AudioBufferSourceNode` se creaba y agendaba recién
  al terminar de grabar el intervalo, con margen cero antes de su propio deadline). Fix aplicado y
  **confirmado con dos corridas nuevas** de 5 min cada una: 0.042 ms de error máximo, 0/36
  mismatches, ambas idénticas. Ver `experiments/r3-interval-loopback/RESULTS.md`.
- **R4 (headers COOP/COEP en hosting real) — PASA en emulación local, reconfirmado.** `wrangler
  pages dev` (mismo runtime/mecanismo `_headers` que un deploy real de Cloudflare Pages, sin
  publicar nada afuera) sirve los headers, `crossOriginIsolated` da `true`, y el pipeline real de
  R1 corre sin overruns a través de ese host — corrido dos veces, mismo resultado ambas. **Deploy
  público real sigue sin probarse a propósito**: necesita el OK explícito de Roi (`STUDIO.md` §7),
  queda anotado como decisión pendiente, no como trabajo técnico pendiente.
  Ver `experiments/r4-coop-coep-hosting/RESULTS.md`.
- **R5 (Safari/iOS) — diferido correctamente, documentado, sin código a propósito.** La spec dice
  literal "Fase 2, no antes" (§12) — no es ambiguo. `experiments/r5-safari-ios-deferred/NOTE.md`
  documenta por qué R1–R4 corrieron solo en Chromium a propósito.
- **Gateway mínimo (`gateway/`, del 14/8)** — relay transparente WS⇄TCP, sin capa de auth/sesión
  propia. Tests re-corridos esta sesión, ambos pasan: fidelidad de bytes C2S contra un mock TCP
  (37/37 bytes) y fidelidad S2C contra un `ninjamsrv` **real** en Docker (el Auth Challenge de
  1221 bytes llega intacto). **No probado todavía:** un handshake de auth completo (solo se
  confirmó que el Challenge inicial pasa; la respuesta con el hash SHA1 del usuario no se armó ni
  se probó), audio Vorbis real de punta a punta a través del gateway, ni el canal de chat.

## ¿Listo para la prueba de Fase 1 completa (dos ciudades, NINJAM real)? Todavía no.

Cada pieza por separado tiene evidencia sólida (R1 encoder, R2 deriva, R3 mecanismo de intervalo,
R4 hosting, gateway relay de bytes), pero **falta la integración**, que es justo lo que pide el
criterio de salida de §11 Fase 1 ("20 minutos de zapada continua... con menos de 1% de intervalos
perdidos", dos personas, dos ciudades). Concretamente, sin verificar todavía:

1. Un cliente único que junte R1 (encoder) + R2 (corrección de deriva) + R3 (loopback de
   intervalo) en una sola app — hoy son 4 scaffolds separados, no una experiencia integrada.
2. El handshake de auth completo contra `ninjamsrv` a través del gateway (solo el primer paso está
   confirmado).
3. Audio Vorbis real viajando por el gateway de punta a punta (cliente → gateway → `ninjamsrv` →
   gateway → otro cliente).
4. El canal de chat que pide §11 para el gateway mínimo — no se tocó en ninguna sesión.
5. Una corrida real con dos clientes distintos (dos procesos como mínimo; "dos ciudades" idealmente
   con latencia real, no localhost).

## Pendiente inmediato

Confirmado por Roi (14/8): repo/slug `zapamooke`, trigger "Sigamos con Zapamooke", y
OBSCUROSTUDIO **espera** a que R1 esté validado antes de bootstrapear su propio repo/setup.

1. ~~Correr el experimento R1 20 minutos y decidir con evidencia.~~ **Hecho 14/8/2026 — R1 pasa.**
2. ~~R2–R5 + gateway mínimo.~~ **Hecho 14–15/8/2026 — ver sección arriba.** R3 se arregló y se
   reconfirmó; R2 sigue matizado (no bloquea); R4 pasa en emulación local; R5 diferido a propósito.
3. Próximo paso real: integrar las piezas en un cliente único y correr el handshake de auth +
   audio de punta a punta por el gateway, antes de intentar el criterio de salida de Fase 1 (dos
   ciudades, 20 min, NINJAM real).
4. C2 de OBSCUROSTUDIO (FLAC en paralelo al Vorbis) sigue sin correrse — no es lo mismo que R1,
   queda pendiente cuando arranque ese trabajo puntual.
5. Actualizar el board de Asana (secciones R2–R5) a mano — esta sesión tampoco tuvo el conector de
   Asana disponible.
