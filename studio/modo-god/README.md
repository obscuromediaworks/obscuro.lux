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
**No sale a internet sin auth adelante.** Estado (2026-08-12): publicado y protegido.

1. ✅ Proyecto Pages `modo-god`, deployado con `npx wrangler pages deploy studio/modo-god/dist
   --project-name modo-god`.
2. ✅ Custom domain **`god.obscuromediaworks.com.ar`** atado al proyecto.
3. ✅ **Auth propia, no Cloudflare Access** — Access pide tarjeta desde que Cloudflare movió
   Zero Trust a un plan que la requiere incluso en el tier gratis. En cambio: `_worker.js` pone el
   proyecto en Pages "Advanced Mode" (intercepta toda request antes de servir el bundle) y hace
   **HTTP Basic Auth** contra un mapa `{"usuario": "password"}` guardado en el secret
   `MODOGOD_USERS` del proyecto — comparación timing-safe (hash SHA-256 + comparación constante),
   sin passwords en el código ni en el repo. Sin credenciales válidas: 401. Con ellas: sirve el
   bundle normal.

### Agregar o sacar gente

El secret es el único lugar donde vive quién tiene acceso. Para agregar a alguien (o cambiar una
contraseña), armá el JSON completo de nuevo — **pisa** el secret anterior, no lo mergea:

```bash
printf '{"roi":"<password-de-roi>","lucas":"<password-nueva>"}' | \
  npx wrangler pages secret put MODOGOD_USERS --project-name modo-god
```

**No hace falta redeploy** — el Worker lee `env.MODOGOD_USERS` en cada request, el secret se
actualiza al toque. Para sacar a alguien, volvé a correr el comando con esa persona afuera del
JSON.

Generar una password random rápida: `python -c "import secrets,string;
print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(20)))"`.

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
