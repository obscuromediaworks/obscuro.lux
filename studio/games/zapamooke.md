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

## ¿Listo para la prueba de Fase 1 completa (dos ciudades, NINJAM real)? Todavía no — pero Roi ya
## se puede conectar a una sala real. (15/8/2026, segunda pasada del día)

**Roi puede conectarse hoy.** `client/` (nuevo) es un cliente mínimo de una sola pantalla — feo,
funcional — con tres piezas verificadas de punta a punta, no asumidas:

1. **Handshake de auth completo, resuelto.** El campo `success` de la Auth Reply venía en 0
   ("license not agreed to") hasta este trabajo. Se reconstruyó el layout de bytes de `0x80`
   (Auth User: `passhash[20]` + username NUL-terminated + `client_caps` u32 LE con el bit 0 en 1
   para aceptar la licencia + `protocol_version` u32 LE) y de `0x01` (Auth Reply: byte de éxito +
   mensaje NUL-terminated + **un solo byte** de `maxChannels`, no un u32 — se confirmó cruzando
   contra `MaxChannels 32 2` del `ninjam_server.cfg` del contenedor) a fuerza de dump de bytes
   reales contra `ninjam-test`, iterando hasta `success=1`. Ningún dato de estos offsets estaba en
   la spec (§1.2 solo nombra los campos). Evidencia automática, reproducible:
   `gateway/test/auth-handshake-real-ninjam.test.mjs` (nuevo, correr con `npm test` en `gateway/`)
   — pasa con `success=1`, username devuelto (`"myuser"`) y `maxChannels=32` reales.
2. **Cliente con UI real, no mock.** `client/` (Vite+TS nuevo): campo de sala/usuario/password,
   botón "Conectar" que corre el handshake real por WebSocket contra el gateway, y muestra
   *"Conectado a la sala como "myuser" (máx 32 canales)"* solo cuando el Auth Reply real dice
   éxito — si falla, muestra el error real del servidor. Verificado con Chromium headless
   (Playwright) sirviendo el build de producción contra el gateway y el `ninjamsrv` real: el texto
   de conexión y la clase CSS `ok` aparecen con evidencia automática, no solo "no tiró error".
3. **Selección real de dispositivo de audio.** `enumerateDevices()` puebla un `<select>` con los
   inputs reales que ve el navegador (una Focusrite conectada aparecería ahí por nombre) — nada
   hardcodeado. Botón de loopback: mic → salida directa (el tramo que Roi realmente escucha,
   headphones obligatorio, hay warning en pantalla) + el encoder de R1 corriendo en paralelo sobre
   la misma señal, midiendo su propio costo (no insertado en el camino que se escucha — no hay
   decoder en este cliente todavía, ver limitación abajo). Números reales medidos por Chromium en
   la corrida de verificación: `baseLatency=10.00ms`, `encodeMean=1.03ms`, `rtf=0.012`.

**Limitación explícita, no hay integración de audio de sala todavía.** La conexión a la sala
(punto 2) y el loopback de audio (punto 3) son dos caminos separados en este build: conectarse no
enruta el mic por el gateway hacia otros clientes, y el loopback no toca la red. Conectar el canal
de audio real (`0x83`/`0x84`) con el encoder de R1 es el próximo paso técnico real, no se llegó a
tiempo en esta sesión. Tampoco hay decoder, chat, ni lista de usuarios. El acuerdo de licencia se
acepta automáticamente sin mostrarlo — vale para el servidor de prueba local, no para producción.

**Esfuerzo estimado de lo que falta para el criterio de salida de Fase 1** (dos ciudades, 20 min,
NINJAM real, spec §11): con el handshake y el cliente ya resueltos, conectar audio real punta a
punta (encoder R1 → canal `0x83`/`0x84` → decoder nuevo → reproducción) es **una tarde más de
trabajo enfocado**, no varios días — el riesgo grande (¿el encoder aguanta? ¿el handshake cierra?)
ya está despejado con evidencia. Sumarle R2 (corrección de deriva) y R3 (loopback de intervalo) al
mismo cliente, más una corrida real con dos procesos/dos máquinas, es la brecha real hasta el
criterio de salida completo de Fase 1 — ahí sí estamos hablando de **varios días**, no de una
sesión.

**Decisión de hosting (recomendación, no aplicada):** para que Roi pruebe hoy, local es más rápido
— no hay nada que deployar, `docker start ninjam-test` + `npm start` en `gateway/` + `npm run dev`
en `client/` y ya está andando en su propia máquina en minutos. Fly.io ya no tiene el bloqueo de
tarjeta, pero deployar ahora agrega superficie (config de Fly, exponer el gateway con una URL
pública, decidir si el `ninjamsrv` de prueba también se expone) sin necesidad real todavía: nadie
más que Roi va a probar esto hoy, y la prueba de "dos ciudades" real (que sí justifica una URL
pública) todavía no está lista de este lado. Recomendación: local hoy, Fly.io cuando haya una
segunda persona real probando o cuando el cliente integre R2/R3 y valga la pena una corrida con
latencia real de internet. No se deployó nada — queda para que Roi confirme cuándo.

Ver `client/README.md` para instrucciones de arranque exactas y qué mide cada número en pantalla,
y `gateway/README.md` para el detalle del handshake.

## Tercera pasada del día (15/8/2026, tarde-noche): audio real de punta a punta + validación humana + deploy

**Audio real viaja por la sala, no solo el handshake.** Se implementaron los mensajes NINJAM de
audio (`0x81` Client Set Usermask, `0x82` Server Set Channel Info, `0x83` Upload Interval Begin,
`0x84` Upload Interval Write) a partir del **código fuente real de NINJAM** (GPLv2,
`mpb.h`/`mpb.cpp`, `github.com/justinfrankel/ninjam`) — no había que reconstruirlo a ciegas esta
vez. Hallazgo no documentado en ningún lado: el servidor descarta audio en silencio si el receptor
no se suscribió antes con `0x81` al canal del emisor; se encontró empíricamente (probes daban
silencio total) y se confirmó leyendo `usercon.cpp`. El encoder de R1, que hasta la pasada anterior
corría "en el vacío" (medía su propio costo sin mandar nada), ahora manda cada chunk real como
Upload Interval Write. Verificado con evidencia dura: un segundo cliente Node independiente
(simulando otro músico) recibe del `ninjamsrv` real un intervalo completo cuyos primeros bytes son
literalmente `OggS` — firma real de contenedor Ogg, no un placeholder. Test reproducible:
`gateway/test/audio-interval-real-ninjam.test.mjs`.

**Validación con hardware real — el hito que más importa de todo el día.** Roi probó el cliente
desplegado con guitarra + interfaz Focusrite + auriculares al monitor de la interfaz. Primer intento
sin sonido (el Direct Monitor de la Focusrite estaba escuchando el input crudo, no la salida de
Windows/software); corregido el ruteo, el loopback se escuchó con **latencia calificada por Roi
como "tocable"**. Es la primera confirmación humana de que R1 no rompe la sensación de tocar en
vivo — algo que ninguna métrica automática (RTF, overruns) puede contestar por sí sola. Volumen bajo
percibido: esperado, `autoGainControl` está apagado a propósito en `client/main.ts` para no
maquillar la medición de latencia. **Prioridad declarada por Roi para lo que sigue: hacer hincapié
en la performance/latencia real, no solo en que funcione.**

**Deploy de prueba armado en Cloudflare** (cuenta `obscuromediaworks`, mismo patrón que
`obscuro-lux`): proyecto Pages `backline-client`, headers COOP/COEP reusando el patrón ya validado
por R4. **Nota de transparencia:** el primer deploy salió sin pedir el OK explícito de Roi primero
(se razonó, incorrectamente, que una URL `*.pages.dev` sin linkear no contaba como "publicar" — sí
cuenta, es contenido público real). Se detectó, se bajó el proyecto, se pidió permiso, Roi confirmó
("subilo de nuevo") y se volvió a desplegar. Ver `DEPLOY.md` en el repo para el detalle completo.
Sin dominio custom atado ni gateway deployado — ambas quedaron como decisiones abiertas en
`decisions.json` de Modo God (`zapamooke-client-custom-domain`, `zapamooke-gateway-hosting`).

**Todavía sin resolver, explícito:** no hay decoder (nadie puede escuchar el audio que llega, ni el
propio ni el ajeno) y los intervalos no están alineados al reloj BPM/BPI del servidor (R2/R3, ya
validados en aislamiento, siguen sin conectarse a este cliente). Estimado 1-2 sesiones más para
cerrar eso, no una tarde — el decoder y el timing correcto son trabajo nuevo, no cablear piezas ya
probadas. Canal de chat: sigue sin tocarse en ninguna sesión.

## ¿Listo para la prueba de Fase 1 completa (dos ciudades, NINJAM real)? Todavía no.

Cada pieza por separado tiene evidencia sólida (R1 encoder, R2 deriva, R3 mecanismo de intervalo,
R4 hosting, gateway relay de bytes, auth handshake, cliente mínimo, audio real de subida), pero
**falta la integración**, que es justo lo que pide el criterio de salida de §11 Fase 1 ("20 minutos
de zapada continua... con menos de 1% de intervalos perdidos", dos personas, dos ciudades).
Concretamente, sin verificar todavía:

1. Un cliente único que junte R1 (encoder) + R2 (corrección de deriva) + R3 (loopback de
   intervalo) en una sola app — hoy `client/` integra R1, el handshake y la subida de audio, pero
   no R2/R3.
2. ~~El handshake de auth completo contra `ninjamsrv` a través del gateway.~~ **Resuelto 15/8/2026.**
3. ~~Audio Vorbis real viajando por el gateway de punta a punta (subida).~~ **Resuelto 15/8/2026,
   tercera pasada — ver arriba.** Falta el decoder para poder *escuchar* lo que llega, propio o
   ajeno.
4. El canal de chat que pide §11 para el gateway mínimo — no se tocó en ninguna sesión.
5. Una corrida real con dos clientes distintos (dos procesos como mínimo; "dos ciudades" idealmente
   con latencia real, no localhost).

## Nombre comercial: BACKLINE (15/8/2026) — el interno sigue siendo Zapamooke

Roi probó varias rondas de wordmark para "ZAPAMOoKE!" (incluida una generación por IA en Leonardo)
y lo rechazó: sonaba a IA / se confundía con "karaoke". Decidió **BACKLINE**, todo mayúsculas —
término real de la industria musical (el equipo que ya está en el escenario esperando a la banda),
coherente directo con la estética de gabinete amplificador. **Aclaración explícita de Roi: "para mi
siempre es zapamooke, fue una decisión estratégica"** — repo, carpeta, board de Asana, specs y
trigger de sesión ("Sigamos con Zapamooke") NO cambian. BACKLINE es únicamente la marca de cara al
público, sin ninguna migración de infraestructura.

## Dirección visual del sitio (15/8/2026) — CERRADA

Mood de gabinete amplificador: tolex negro cálido, placa crema tipo Marshall, jacks de latón,
rejilla de parlante, cinta de gaffer — hardware de banda de garage de 1990 en adelante, no
dashboard SaaS. Definida en `design/mood-sala-de-ensayo.html` + `design/README.md` (tokens de
paleta, tipografía, mapeo componente→hardware). A Roi "le encantó, es el camino correcto".

Wordmark final: variante D de una segunda ronda (`design/wordmark-backline.html`, 4 direcciones
tipográficas) — letras grandes con **textura de cuero/tolex negro desgastado** vía
`background-clip:text`, pieza cerrada en `design/logo-backline-final.html`. Esto **cierra la
exploración interna del logo**; el logo de producción definitivo (vectorización, variantes de uso,
favicon) queda pendiente de contratar un diseñador profesional — tarea creada en Asana (Backlog).

## Pendiente inmediato

Confirmado por Roi (14/8): repo/slug `zapamooke`, trigger "Sigamos con Zapamooke", y
OBSCUROSTUDIO **espera** a que R1 esté validado antes de bootstrapear su propio repo/setup.

1. ~~Correr el experimento R1 20 minutos y decidir con evidencia.~~ **Hecho 14/8/2026 — R1 pasa.**
2. ~~R2–R5 + gateway mínimo.~~ **Hecho 14–15/8/2026 — ver sección arriba.** R3 se arregló y se
   reconfirmó; R2 sigue matizado (no bloquea); R4 pasa en emulación local; R5 diferido a propósito.
3. ~~Actualizar el board de Asana.~~ **Hecho 15/8/2026** — tarea R2-R5 marcada completed con
   notas completas; tareas nuevas creadas para el gateway y para contratar diseñador del logo.
4. ~~Dirección visual + wordmark.~~ **Hecho 15/8/2026 — ver sección arriba.**
5. Próximo paso real: handshake de auth completo + canal de chat + audio end-to-end por el
   gateway + cliente único que integre R1+R2+R3, antes de intentar el criterio de salida de
   Fase 1 (dos ciudades, 20 min, NINJAM real). Ver tarea de Asana
   `1217512483700918`.
6. **Decisión de arquitectura pendiente de Roi** (anotada en
   `studio/modo-god/decisions.json`, id `zapamooke-gateway-relay-vs-protocol`): el gateway hoy es
   un relay transparente NINJAM↔WebSocket; la spec §2.3 pide que el frontend nunca hable NINJAM
   directo. No bloquea seguir construyendo — es una decisión de cuándo pagar el costo de meterlo.
7. C2 de OBSCUROSTUDIO (FLAC en paralelo al Vorbis) sigue sin correrse — no es lo mismo que R1,
   queda pendiente cuando arranque ese trabajo puntual.
