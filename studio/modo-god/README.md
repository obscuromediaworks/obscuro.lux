# Modo God

Tablero de operaciones de Obscuro Mediaworks: estado de git de todos los repos, tareas abiertas en
Asana y el dossier de cada proyecto en una pantalla.

## Las dos formas de verlo

### Consola local — en vivo

```bash
python studio/modo-god/modo-god.py
```

Levanta `http://localhost:5080`. Cada carga vuelve a interrogar a git en los repos de
`registry.json`: lo que ves es el disco en este momento. **Es la versión que vale para decidir.**

También está en `.claude/launch.json` como `modo-god`, así que un agente lo abre con preview.

### Espejo público — congelado

```bash
python studio/modo-god/publish.py --deploy
```

Escribe `dist/index.html`: **un solo archivo** con el snapshot inlineado. Sin fetch, sin JSON
suelto, sin chance de que la página y los datos queden desfasados. Imprime el comando de wrangler
pero **no deploya** — publicar hacia afuera lo decide Roi.

La página muestra siempre cuándo se generó, y se marca en rojo si pasó más de un día.

## ⚠️ Antes de publicarlo

El bundle expone rutas locales, nombres de tareas, fechas de lanzamiento y qué está sin verificar.
**No sale a internet sin Cloudflare Access adelante.** Pasos, una sola vez:

1. `npx wrangler login` (el OAuth caduca ~24 h).
2. Crear el proyecto Pages `modo-god` y deployar `dist/` con el comando que imprime `publish.py`.
3. En el dashboard de Cloudflare → **Zero Trust → Access → Applications**: proteger el hostname con
   una policy de un solo email. Sin esto, la URL es pública para cualquiera que la adivine.
4. Ruta. Lo más barato es el subdominio `modogod.obscuromediaworks.com.ar` (CNAME a
   `modo-god.pages.dev`, igual que se hizo con `mobawarmup`). Para que sea
   `obscuromediaworks.com.ar/modo-god` hace falta además un Worker con route
   `obscuromediaworks.com.ar/modo-god*` que proxee al proyecto Pages, porque la raíz del dominio la
   sirve otro hosting.

El `robots.txt` y el `noindex` que genera `publish.py` son higiene de crawlers, **no** son seguridad.

## De dónde salen los datos

| Sección | Fuente | Quién la actualiza |
|---|---|---|
| Git (rama, sin commitear, sin pushear, pulso de commits) | `git` sobre `repo_path` | `collect.py`, en cada carga |
| Proyectos, roles, boards | `studio/registry.json` | a mano, cuando cambia el estudio |
| Asana (abiertas, vencidas, highlights) | `asana-cache.json` | **un agente de Claude** |

`collect.py` **no** llama a Asana: el conector es MCP, no HTTP. La caché la refresca un agente con
`get_projects` (da todos los conteos en una llamada) y, si hacen falta las vencidas, `get_tasks` del
board. La cuenta es FREE: `search_tasks` no funciona.

Tampoco hace `git fetch`. El `↓ atrás` que muestra es contra el remote-tracking local, así que
puede estar viejo. Es deliberado: el tablero no toca la red ni modifica nada.

## Archivos

```
collect.py        Interroga git + arma el snapshot. Importable (lo usa el server).
modo-god.py       Server local. Sirve index.html y /api/snapshot en vivo.
publish.py        Genera dist/index.html self-contained para el espejo público.
index.html        El tablero. Lee window.__SNAPSHOT__, luego /api/snapshot, luego snapshot.json.
asana-cache.json  Caché de Asana. La escribe un agente, no el collector.
snapshot.json     Salida de `python collect.py`. Generado — no se versiona.
dist/             Bundle publicable. Generado — no se versiona.
```
