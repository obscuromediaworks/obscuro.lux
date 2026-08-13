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
asana-cache.json    Caché de Asana. La escribe un agente, no el collector.
gdd/                GDDs sincronizados para la consola local. Generado por sync_gdd.py.
snapshot.json       Salida de `python collect.py`. Generado -- no se versiona.
dist/               Bundle publicable. Generado -- no se versiona.
```
