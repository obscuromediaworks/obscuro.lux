# Modo God

Tablero de operaciones de Obscuro Mediaworks: estado de git de todos los repos, tareas abiertas en
Asana, GDDs y el dossier de cada proyecto en una pantalla.

## Las dos formas de verlo

### Consola local — en vivo, lee el disco

```bash
python studio/modo-god/modo-god.py
```

Levanta `http://localhost:5080`. Cada carga vuelve a interrogar a git en los repos de
`registry.json`: lo que ves es el disco en este momento (incluye sin commitear/sin pushear, algo
que nadie remoto puede ver). **Es la versión que vale para decidir.** También tiene
`POST /api/decide`, así que acá funciona el botón "Elegir" del panel de decisiones.

**Tablero de Publish (cola de contenido para redes).** `http://localhost:5080/publish` — la cola
vive en `publish-queue.json` (mismo espíritu que `decisions.json`): cada item tiene proyecto, red,
texto, archivo opcional, horario sugerido y `status` (`draft` → `queued` → `posted`/`failed`).
**Discord, YouTube y X disparan de verdad** desde el botón "Disparar" (`POST /api/publish/fire`,
ver `publish_board.py` + `social_publisher.py`). **TikTok también dispara de verdad** (Content
Posting API), con una salvedad real, no cosmética: sale **privado** (`privacy_level=SELF_ONLY`,
solo lo ve la cuenta que autorizó) hasta que TikTok apruebe la revisión de la app — lo impone
TikTok del lado del servidor, el código no tiene forma de evitarlo. **Reddit queda afuera de esta
pasada** por decisión explícita de Roi (no hay código ni entradas de cola para esa red).

Las credenciales viven en `publish-credentials.json` — **gitignoreado, nunca al repo**, mismo
criterio que `ASANA_TOKEN` o la `service_role` key de Supabase. Ver
`publish-credentials.example.json` para el formato completo. Sin las credenciales de una red
cargadas, el botón "Disparar" no falla en silencio: `publish_board.py` devuelve exactamente qué
campo falta y qué script correr para completarlo.

### Discord — webhook, sin OAuth

Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL → pegarla en
`discord.webhook_url` de `publish-credentials.json`. Sin costo, sin expiración salvo que se borre
el webhook a mano.

### YouTube — Data API v3, OAuth device flow

Ver `youtube_oauth_setup.py` (docstring completo con los pasos de Google Cloud Console). Resumen:
crear proyecto en Google Cloud Console → habilitar "YouTube Data API v3" → OAuth consent screen en
modo Testing con la cuenta de @MOBAWarmup como test user → credencial tipo "TVs and Limited Input
devices" → `python youtube_oauth_setup.py --client-id ... --client-secret ...` (Roi confirma desde
cualquier navegador con el código de 8 caracteres, sin puerto local).

### X (ex-Twitter) — OAuth 2.0 + PKCE, pay-per-use

Ver `x_oauth_setup.py` (docstring completo con los pasos de developer.x.com). Resumen: crear
proyecto + app en developer.x.com → "User authentication settings" con permisos **Read and
write** y tipo **"Web App, Automated App or Bot"** (da client_secret) → Callback URI
`http://127.0.0.1:8721/oauth/callback` (tiene que matchear exacto con lo que usa el script) →
copiar Client ID/Secret de la pestaña "Keys and tokens" (sección OAuth 2.0, NO el API Key/Secret
de arriba que es OAuth 1.0a) → `python x_oauth_setup.py --client-id ... --client-secret ...`.

Scopes: `tweet.read tweet.write users.read offline.access`. Flujo: authorization code + PKCE
(`social_publisher.x_build_authorize_url`/`x_exchange_code`) contra `x.com/i/oauth2/authorize` +
`api.x.com/2/oauth2/token`, con un server HTTP local temporal (`wait_for_oauth_redirect()`) que
atiende el redirect y se cierra solo. El posteo real (`x_post_tweet`, `POST /2/tweets`) es
**pay-per-use** — ver Asana `1217475928610505` para el pricing vigente ($0,015 texto plano /
$0,20 con link al momento de escribir esto). El billing lo paga Roi directo en developer.x.com,
este código solo llama al endpoint con el access_token vigente; sin billing configurado, X
devuelve un HTTP error que el tablero muestra tal cual. El access_token expira a las 2hs —
`publish_board._fire_x()` lo refresca solo antes de cada disparo. X **rota el refresh_token en
cada uso** (a diferencia de Google): el código persiste el nuevo automáticamente, Roi no tiene
que volver a correr el script salvo revocación manual.

**Media (imagen/gif adjunto), agregado 14/8/2026.** `x_upload_media()` sube el archivo con el
endpoint de media v2 chunked (`api.x.com/2/media/upload/{initialize,append,finalize}`, doc oficial
`docs.x.com/x-api/media/quickstart/media-upload-chunked`), consigue un `media_id`, y recién
después `_fire_x()` postea el tweet con `media.media_ids: [media_id]`. GIF animado sube nativo
(`media_category=tweet_gif`), sin convertir a mp4 como sí hace falta para YouTube/TikTok.

**SIN VERIFICAR contra la API real todavía** — implementado siguiendo la doc oficial, pero sin una
prueba end-to-end (cuesta dinero por request disparar de verdad). Dos cosas concretas antes de
confiar en esto a ciegas:
1. **El scope `media.write` se sumó a `X_SCOPE`, pero el `access_token` ya guardado en
   `publish-credentials.json` fue emitido ANTES de ese cambio.** X fija los scopes al momento de
   autorizar, y refrescar un `refresh_token` viejo devuelve el mismo set de scopes original —
   **hace falta que Roi vuelva a correr `x_oauth_setup.py` (re-autorizar la app) antes de que un
   disparo con media tenga chance de funcionar**, si no va a fallar con 403/insufficient_scope.
2. No pude confirmar contra la documentación oficial en vivo si el endpoint v1.1 legado
   (`upload.twitter.com/1.1/media/upload.json`, que exige OAuth 1.0a) sigue siendo obligatorio en
   algún caso, o si el v2 con Bearer OAuth 2.0 alcanza siempre — esta implementación asume v2 +
   Bearer porque es lo que documenta `docs.x.com` según el conocimiento con el que se escribió
   este código, no algo que se haya podido re-chequear en vivo en esta pasada (sin acceso a
   navegación web desde esta sesión). Si el primer disparo real con media falla con un error de
   auth/scope que no se resuelve re-autorizando, es la señal de que hace falta el flujo OAuth 1.0a
   aparte -- avisar antes de improvisar una firma OAuth 1.0a sin probarla.

### TikTok — Content Posting API, OAuth 2.0 + PKCE, gratis pero con revisión pendiente

Ver `tiktok_oauth_setup.py` (docstring completo, incluye el plan para el problema del redirect
URI). Diferencia real con X/YouTube, no un detalle menor: la API es gratis, pero pedir el scope
`video.publish` mete la app en la **cola de revisión manual de TikTok** (1-4 semanas, sin forma de
pagar para acelerar). **Hasta que aprueben, todo lo que suba la API queda forzado a
`privacy_level=SELF_ONLY`** — privado, solo lo ve la cuenta que autorizó, aunque el código
funcione perfecto. No es un bug si un post "no aparece" públicamente durante esta ventana.

Registro de cuenta de developer en developers.tiktok.com es instantáneo (sin aprobación previa) —
lo que requiere revisión es específicamente el scope de posteo. Pasos: crear app → agregar
producto "Content Posting API" → configurar redirect URI (**ojo**: a diferencia de X, TikTok en
producción suele exigir domain verification del redirect URI; el plan es probar primero
`http://127.0.0.1:8730/oauth/callback` en modo Sandbox, y si lo rechaza, usar un subpath ya
verificado de `obscuromediaworks.com.ar` como fallback — no armado todavía, se arma si hace
falta) → agregar la cuenta que va a postear como "target user" del Sandbox → copiar Client
Key/Secret → `python tiktok_oauth_setup.py --client-key ... --client-secret ...`.

**Prerequisito real para poder mandar la solicitud de revisión**: TikTok pide, junto con la
solicitud, (1) un **video demo** del flujo OAuth + upload funcionando de punta a punta (privado
está bien para el demo) y (2) una **URL de política de privacidad** pública — hoy probablemente no
existe una para MOBAWarmup/Obscuro, queda pendiente de Roi (o de quien la redacte; no es tarea de
un agente resolverla sola). Construir esta integración ahora es lo que le permite a Roi grabar ese
demo, no es trabajo en el aire.

**Rotación semanal.** `publish-rotation.json` define un ciclo simple (lunes devlog / miércoles
clip de gameplay / viernes engagement de comunidad) para DESPUÉS de la ventana de lanzamiento
fechada en `MOBAWarmup/docs/social-content-calendar.md` (13-21/8). Correr
`python publish_rotation.py [--week YYYY-MM-DD]` agrega a la cola un SLOT vacío (`status: draft`,
`slot: true`, sin texto ni archivo) por cada entrada del ciclo — no genera copy, eso lo llena una
corrida futura de `om-marketing` (o a mano), y recién ahí pasa por la aprobación de Roi como
cualquier item. Un slot vacío nunca se puede disparar (el tablero ni muestra el botón, y
`post_discord()`/`youtube_upload_video()` rechazan texto+media vacíos igual). Idempotente por
semana — correrlo dos veces no duplica.

Exclusivo de la consola local, igual que QA y Decisiones — el Worker público no sirve `/publish`
ni `POST /api/publish/fire` (ver `_worker.js`, `capabilities.publish`). El espejo público jamás
dispara un post real hacia afuera.

**Tablero de QA embebido.** Cada card de juego con `docs/qa/items.json` muestra un botón "▤ QA"
que abre `/qa?project=<slug>` -- el tablero que antes era el script suelto
`~/.claude/skills/qa/qa-board.py` (invocado a mano con `--repo`). Ahora vive en `qa_board.py`,
junto al resto de Modo God, y resuelve el repo por `slug` contra `registry.json` en vez de un
flag. El circuito no cambió: cada veredicto se escribe al instante en
`<repo>/docs/qa/runs/<build>.json` + una línea en `<build>.events.log` (mismo formato de siempre,
es lo que sigue un Monitor de Claude con `grep FALLA`). Exclusivo de la consola local -- el Worker
público no sirve `/qa` ni `POST /api/qa/mark` (ver `_worker.js`, `capabilities.qa`). El skill `qa`
sigue existiendo como script standalone para repos que todavía no están en `registry.json`; ver la
decisión `qa-skill-future` en `decisions.json` sobre si conviene deprecarlo del todo.

También está en `.claude/launch.json` como `modo-god`, así que un agente lo abre con preview.

**Acceso directo del escritorio (sin pasar por Claude Code):** doble-click en
`studio/modo-god/start-modo-god.bat` levanta el server + abre el navegador solo. Hay un acceso
directo "Modo God" ya creado en el escritorio de Roi que apunta ahí — para recrearlo en otra
máquina (o si se borra), correr esto en PowerShell:

```powershell
$s = (New-Object -ComObject WScript.Shell).CreateShortcut("$env:USERPROFILE\Desktop\Modo God.lnk")
$s.TargetPath = "<ruta al repo>\studio\modo-god\start-modo-god.bat"
$s.WorkingDirectory = "<ruta al repo>\studio\modo-god"
$s.IconLocation = "shell32.dll,15"
$s.Save()
```

Si el puerto 5080 ya está ocupado por una instancia previa (ej. se clickeó el ícono dos veces),
`modo-god.py` lo detecta con un connect TCP crudo (no HTTP -- `/api/snapshot` puede tardar, un
GET con timeout corto daba falso negativo) y solo abre el navegador ahí en vez de crashear.

### Espejo público — en vivo, sincroniza contra APIs

**`https://god.obscuromediaworks.com.ar`** — Cloudflare Pages, proyecto `modo-god`, con un Worker
(`_worker.js`) que:

1. Sirve el `index.html` estático (mismo archivo que la consola local, sin nada embebido).
2. `GET /api/snapshot` — devuelve el último snapshot cacheado en KV (`MODOGOD_CACHE`).
3. `POST /api/sync` — pega a la API de GitHub (commits, ramas) y de Asana (si hay `ASANA_TOKEN`)
   por cada proyecto de `registry.json`, trae el GDD de cada repo, arma un snapshot nuevo y lo
   guarda en KV. **No depende del disco local de nadie ni de una sesión de Claude corriendo** — es
   HTTP puro con tokens guardados como secrets del proyecto Pages.

El botón "↻ Sincronizar" del header llama a `/api/sync` y recarga. Sin nadie apretándolo, la
página sigue mostrando el último snapshot cacheado (puede quedar viejo — mirá el timestamp).

**Lo que el espejo público NO puede ver:** archivos sin commitear o sin pushear. Eso es
inherentemente local. El chip de git dice "GitHub — sin ver uncommitted" cuando el dato viene de
ahí, para que no se confunda con el estado real del disco.

### Deploy de código (cuando cambia index.html o _worker.js)

```bash
python studio/modo-god/publish.py     # arma dist/ (index.html + _worker.js + robots.txt)
cd studio/modo-god
npx wrangler pages deploy dist --project-name modo-god
```

**Importante:** correr `wrangler` desde `studio/modo-god/`, no desde la raíz del repo — este
directorio tiene su propio `wrangler.toml` (con el binding de KV `MODOGOD_CACHE`), distinto del
`wrangler.toml` de la raíz (que es del Worker `obscuro-lux-site`, el sitio del estudio).

Esto **ya no hace falta cada vez que cambian los datos** — eso lo resuelve el botón Sincronizar.
Solo hace falta cuando cambia el código del tablero.

## Auth: Basic Auth propia, no Cloudflare Access

Cloudflare Access (Zero Trust) empezó a pedir tarjeta incluso en el tier gratis. En cambio,
`_worker.js` pone el proyecto en Pages "Advanced Mode" (intercepta toda request antes de servir
nada) y hace **HTTP Basic Auth** contra un mapa `{"usuario": "password"}` guardado en el secret
`MODOGOD_USERS` — comparación timing-safe (hash SHA-256 + comparación constante), sin passwords en
el código ni en el repo. Sin credenciales válidas: 401.

### Agregar o sacar gente

El secret es el único lugar donde vive quién tiene acceso. Pisa el JSON completo, no lo mergea:

```bash
printf '{"roi":"<password>","persona":"<password>"}' | \
  npx wrangler pages secret put MODOGOD_USERS --project-name modo-god
```

**No hace falta redeploy** — se lee en cada request. Para sacar a alguien, correr el comando de
nuevo sin esa persona en el JSON.

Password random rápida: `python -c "import secrets,string;
print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(20)))"`.

El `robots.txt`/`noindex` es higiene de crawlers, no la seguridad real.

## Abrir una sesión de Claude Code desde una card

Cada card de juego con `trigger` no-nulo en `registry.json` muestra dos botones:

- **▶ Sesión** — un link `claude-cli://open?q=<trigger>&cwd=<repo_path>`. Es el deep link oficial
  de Claude Code (`code.claude.com/docs/en/deep-links`): el navegador se lo pasa al SO, que lo
  resuelve contra un handler que Claude Code registra solo **al mandar el primer prompt de una
  sesión interactiva** en esa máquina. Si nunca corriste `claude` en modo interactivo ahí, el click
  no hace nada — no hay forma de detectar eso desde la página. El prompt queda precargado pero
  **no se manda solo**: hay que confirmar con Enter en la terminal que se abre. Funciona igual
  desde `localhost:5080` que desde el espejo público — es 100% del lado del cliente, no depende de
  dónde esté hosteada la página.
- **⧉ Copiar trigger** — fallback si el link no abre nada (máquina sin el handler registrado, sin
  Claude Code CLI instalado, o navegador que bloquea `claude-cli://`): copia el trigger al
  portapapeles para pegarlo a mano.

No existe un equivalente para claude.ai/code (versión web): Anthropic cerró como "not planned" el
pedido de precargar prompts ahí por URL (`claude.ai/new?q=` existió para el chat normal y lo
sacaron por riesgo de prompt injection). El deep link `claude-cli://` es el único mecanismo
soportado, y es solo para la CLI local.

## De dónde salen los datos

| Sección | Consola local | Espejo público |
|---|---|---|
| Git (rama, sin commitear, pulso) | `git` sobre `repo_path`, en cada carga | GitHub API (`GITHUB_TOKEN`), solo lo pusheado |
| GDD | `studio/modo-god/gdd/*.html`, sincronizado a mano con `sync_gdd.py` | `raw.githubusercontent.com` en vivo, cada sync |
| Asana | `asana-cache.json`, la escribe **un agente de Claude** | Igual que local, o en vivo si hay `ASANA_TOKEN` (secret opcional — sin él, usa la caché committeada) |
| Proyectos, roles | `studio/registry.json` | `studio/registry.json` vía GitHub raw (rama `main`) |
| Decisiones | `decisions.json` local, con botón "Elegir" | `decisions.json` vía GitHub raw, **de solo lectura** |

`GITHUB_TOKEN` es el token del `gh` CLI ya logueado en esta máquina (`gh auth token`), con scope
`repo` de lectura — suficiente para leer commits, ramas y archivos de los repos privados del
estudio. `ASANA_TOKEN` es un Personal Access Token de Asana, opcional: sin él, el espejo público
muestra la última caché committeada en vez de conteos en vivo.

Ninguno de los dos hace `git fetch` para el "atrás" (ahead/behind): la consola local lo calcula
contra el remote-tracking local (puede estar viejo); el espejo público directamente no lo expone
(no tiene forma de saberlo sin el disco).

## Archivos

```
collect.py        Snapshot local -- interroga git + arma el JSON. Lo usa modo-god.py.
modo-god.py        Server local. Sirve index.html, /api/snapshot, /api/decide, /qa y
                    /api/qa/mark en vivo.
qa_board.py         Tablero de QA embebido (Board + plantilla HTML). Resuelve el repo por
                    slug contra registry.json. Lo usa modo-god.py; no corre solo.
publish_board.py    Tablero de Publish (cola + plantilla HTML + fire()). Lo usa modo-god.py;
                    no corre solo.
social_publisher.py Disparo real: POST a webhook de Discord; OAuth device flow + upload de
                    YouTube Data API v3; OAuth2+PKCE + POST /2/tweets de X; OAuth2+PKCE + upload
                    de TikTok Content Posting API; conversión gif->mp4 con ffmpeg; server HTTP
                    local compartido para capturar el redirect de X/TikTok. Solo stdlib.
youtube_oauth_setup.py  Script standalone -- lo corre Roi UNA vez para autorizar YouTube y
                    escribir el refresh_token en publish-credentials.json.
x_oauth_setup.py    Script standalone -- ídem para X (developer.x.com, OAuth2+PKCE,
                    pay-per-use -- ver Asana 1217475928610505).
tiktok_oauth_setup.py  Script standalone -- ídem para TikTok (developers.tiktok.com,
                    OAuth2+PKCE). Posts salen privados hasta que TikTok apruebe la revisión.
publish_rotation.py Genera slots vacíos (draft) para la rotación semanal de contenido en
                    publish-queue.json, según publish-rotation.json. No corre solo (sin cron).
publish.py         Arma dist/ (index.html + _worker.js + robots.txt) para deployar. Ya no
                    incrusta datos -- el Worker los sirve en vivo.
_worker.js          Worker del espejo público: auth (Basic Auth) + /api/sync + /api/snapshot
                    (backed por KV) + fallback a env.ASSETS.fetch para el resto.
wrangler.toml       Config de ESTE proyecto Pages (modo-god) -- KV binding. No confundir con
                    el wrangler.toml de la raíz del repo (obscuro-lux-site).
sync_gdd.py         Sincroniza los GDD de cada repo a gdd/*.html para la consola LOCAL.
                    El espejo público los trae solo, vía GitHub raw -- esto es solo para local.
index.html          El tablero. Mismo archivo para consola local y espejo público.
decisions.json      Decisiones que un agente no puede resolver solo, con opciones + recomendación.
publish-queue.json  Cola de contenido para redes -- items draft/queued/posted/failed.
publish-schedule.json   Horario sugerido por red (config simple, no un scheduler).
publish-rotation.json   Ciclo semanal de tipos de contenido, para después de la ventana de
                    lanzamiento fechada. Lo consume publish_rotation.py.
publish-credentials.example.json  Plantilla de credenciales -- SI se versiona.
publish-credentials.json          Credenciales reales -- gitignoreado, NUNCA al repo.
asana-cache.json    Caché de Asana. La escribe un agente, no el collector.
gdd/                GDDs sincronizados para la consola local. Generado por sync_gdd.py.
snapshot.json       Salida de `python collect.py`. Generado -- no se versiona.
dist/               Bundle publicable. Generado -- no se versiona.
```
