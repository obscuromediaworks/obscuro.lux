#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- tablero de Publish (cola de contenido para redes).

Estado (14/8/2026): Discord (webhook), YouTube (Data API v3, OAuth device flow) y X (API v2,
OAuth2 + PKCE) disparan de verdad. TikTok también llama a la API real (Content Posting API,
OAuth2 + PKCE), pero con una salvedad real: hasta que TikTok apruebe la revisión de la app, todo
lo que suba queda forzado a `privacy_level=SELF_ONLY` (privado, solo la cuenta que autorizó lo
ve) -- lo impone TikTok del lado del servidor, no es un límite de este código. Ver
`tiktok_oauth_setup.py` para el detalle completo. Reddit queda AFUERA por decisión explícita de
Roi -- no hay código ni entradas para esa red acá.

Mismo patrón que qa_board.py: vive junto al resto de Modo God, lo sirve modo-god.py, y el disparo
real (`POST /api/publish/fire`) es **exclusivo de la consola local** -- el Worker público
(`_worker.js`) no tiene esta ruta ni la de `/publish`, igual que `/api/decide` y `/api/qa/mark`
(ver STUDIO.md §8 y la regla de que el espejo público nunca escribe).

    GET  /publish[?project=<slug>][&network=<discord|youtube|x|tiktok>][&status=<draft|queued|posted|failed|dropped>][&archived=1]
                                           -> el tablero, filtros combinables. Sin `archived=1`
                                              NO se muestran los items archivados (ver campo
                                              `archived` más abajo); con `archived=1` se ve
                                              SOLO los archivados.
    POST /api/publish/fire                -> {"id": "<item-id>"} dispara un item auto
                                              (discord/youtube/x/tiktok)
    POST /api/publish/archive             -> {"id": "<item-id>", "archived": true|false} marca o
                                              desmarca un item como archivado. Campo independiente
                                              de `status`: archivar NO cambia si se posteó o no,
                                              solo lo saca de la vista default (ruido de items ya
                                              disparados) -- ver `archive()`.
"""

import json
import os

import qa_board  # reusa resolve_project() -- ya sabe mapear slug -> repo_path contra registry.json
import social_publisher as sp

HERE = os.path.dirname(os.path.abspath(__file__))
QUEUE_PATH = os.path.join(HERE, "publish-queue.json")
SCHEDULE_PATH = os.path.join(HERE, "publish-schedule.json")

AUTO_NETWORKS = ("discord", "youtube", "x", "tiktok")
ASSISTED_NETWORKS = ()


# ── Cola: leer/escribir ───────────────────────────────────────────────────────

def load_queue():
    if not os.path.isfile(QUEUE_PATH):
        return {"items": []}
    with open(QUEUE_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_queue(doc):
    tmp = QUEUE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, QUEUE_PATH)


def load_schedule():
    if not os.path.isfile(SCHEDULE_PATH):
        return {}
    with open(SCHEDULE_PATH, encoding="utf-8") as f:
        return json.load(f)


def resolve_media_path(item):
    """media_path en la cola es relativo al repo del proyecto (ej. 'docs/gifs/x.gif'), salvo que
    ya sea absoluto. Sin esto cada item tendría que repetir G:\\Github\\MOBAWarmup a mano."""
    media = item.get("media_path")
    if not media:
        return None
    if os.path.isabs(media):
        return media
    repo, _name = qa_board.resolve_project(item.get("project"))
    if not repo:
        return media
    return os.path.join(repo, media)


def now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# ── Disparo real (solo discord/youtube) ──────────────────────────────────────

def fire(item_id):
    """Dispara un item auto. Devuelve {"ok": bool, ...}. Escribe el resultado en
    publish-queue.json pase lo que pase (posted o failed), para que quede rastro de qué se
    intentó -- nunca se borra silenciosamente un intento fallido."""
    doc = load_queue()
    item = next((it for it in doc.get("items", []) if it.get("id") == item_id), None)
    if item is None:
        return {"ok": False, "error": "no existe el item: " + str(item_id)}

    network = item.get("network")
    if network not in AUTO_NETWORKS:
        return {"ok": False, "error": "'{}' es una red asistida -- no hay disparo automático, copiá el texto y abrí la página a mano.".format(network)}
    if item.get("status") == "posted":
        return {"ok": False, "error": "este item ya está marcado como posteado -- si hace falta repetirlo, cambiá el status a mano primero."}

    creds = sp.load_credentials()
    try:
        if network == "discord":
            result = _fire_discord(item, creds)
        elif network == "youtube":
            result = _fire_youtube(item, creds)
        elif network == "x":
            result = _fire_x(item, creds)
        else:
            result = _fire_tiktok(item, creds)
    except Exception as e:
        result = {"ok": False, "error": str(e)}

    if result.get("ok"):
        item["status"] = "posted"
        item["posted_at"] = now_iso()
    else:
        item["status"] = "failed"
    item["result"] = result
    save_queue(doc)
    return result


def archive(item_id, archived=True):
    """Marca (o desmarca) un item como archivado. NO toca `status` -- un item posteado sigue
    posteado, un draft sigue draft; `archived` solo decide si aparece en la vista default de
    /publish. Es un toggle: llamar de nuevo con archived=False desarchiva."""
    doc = load_queue()
    item = next((it for it in doc.get("items", []) if it.get("id") == item_id), None)
    if item is None:
        return {"ok": False, "error": "no existe el item: " + str(item_id)}
    item["archived"] = bool(archived)
    save_queue(doc)
    return {"ok": True, "archived": item["archived"]}


def _fire_discord(item, creds):
    webhook = (creds.get("discord") or {}).get("webhook_url")
    media_path = resolve_media_path(item)
    return sp.post_discord(webhook, item.get("text") or "", file_path=media_path)


def _fire_youtube(item, creds):
    yt = creds.get("youtube") or {}
    missing = [k for k in ("client_id", "client_secret", "refresh_token")
               if sp._looks_like_placeholder(yt.get(k))]
    if missing:
        return {"ok": False, "error": "falta(n) {} en publish-credentials.json -- correr youtube_oauth_setup.py primero.".format(", ".join(missing))}

    media_path = resolve_media_path(item)
    if not media_path:
        return {"ok": False, "error": "el item no tiene media_path -- YouTube necesita un archivo de video."}
    if not os.path.isfile(media_path):
        return {"ok": False, "error": "no existe el archivo: " + media_path}

    upload_path = media_path
    if media_path.lower().endswith(".gif"):
        try:
            upload_path = sp.gif_to_mp4(media_path)
        except Exception as e:
            return {"ok": False, "error": "no pude convertir el gif a mp4: " + str(e)}

    try:
        access_token = sp.youtube_refresh_access_token(yt["client_id"], yt["client_secret"], yt["refresh_token"])
    except Exception as e:
        return {"ok": False, "error": str(e)}

    target = item.get("target") or {}
    return sp.youtube_upload_video(
        access_token, upload_path,
        title=target.get("title") or (item.get("text") or "")[:95],
        description=item.get("text") or "",
        tags=target.get("tags"),
        privacy_status=target.get("privacy_status", "unlisted"),
    )


def _fire_x(item, creds):
    x = creds.get("x") or {}
    missing = [k for k in ("client_id", "client_secret", "access_token", "refresh_token")
               if sp._looks_like_placeholder(x.get(k))]
    if missing:
        return {"ok": False, "error": "falta(n) {} en publish-credentials.json -- correr x_oauth_setup.py primero.".format(", ".join(missing))}

    # X rota el refresh_token en cada uso -- refrescar SIEMPRE antes de postear (el access_token
    # dura 2hs, más corto que el intervalo típico entre disparos) y persistir el par nuevo antes
    # de intentar el post, así un fallo de x_post_tweet() no deja credenciales vencidas guardadas.
    try:
        access_token, new_refresh = sp.x_refresh_access_token(x["client_id"], x["client_secret"], x["refresh_token"])
    except Exception as e:
        return {"ok": False, "error": str(e)}
    if new_refresh:
        creds["x"]["refresh_token"] = new_refresh
        sp.save_credentials(creds)

    text = item.get("text") or ""
    media_path = resolve_media_path(item)
    media_id = None
    if media_path:
        if not os.path.isfile(media_path):
            return {"ok": False, "error": "no existe el archivo: " + media_path}
        # Si falla el upload, NO se postea el tweet a secas -- el pedido de Roi (14/8) fue
        # justamente que un post con media adjunta no salga silenciosamente sin ella. Mejor
        # "failed" y reintentar que un tweet de texto que no era la intención.
        upload_result = sp.x_upload_media(access_token, media_path)
        if not upload_result.get("ok"):
            upload_result.setdefault("error", "no pude subir el media a X")
            upload_result["error"] = "media upload: " + upload_result["error"]
            return upload_result
        media_id = upload_result.get("media_id")

    return sp.x_post_tweet(access_token, text, media_id=media_id)


def _fire_tiktok(item, creds):
    tk = creds.get("tiktok") or {}
    missing = [k for k in ("client_key", "client_secret", "access_token", "refresh_token")
               if sp._looks_like_placeholder(tk.get(k))]
    if missing:
        return {"ok": False, "error": "falta(n) {} en publish-credentials.json -- correr tiktok_oauth_setup.py primero.".format(", ".join(missing))}

    media_path = resolve_media_path(item)
    if not media_path:
        return {"ok": False, "error": "el item no tiene media_path -- TikTok necesita un archivo de video."}
    if not os.path.isfile(media_path):
        return {"ok": False, "error": "no existe el archivo: " + media_path}
    upload_path = media_path
    if media_path.lower().endswith(".gif"):
        try:
            upload_path = sp.gif_to_mp4(media_path)
        except Exception as e:
            return {"ok": False, "error": "no pude convertir el gif a mp4: " + str(e)}

    try:
        access_token, new_refresh = sp.tiktok_refresh_access_token(tk["client_key"], tk["client_secret"], tk["refresh_token"])
    except Exception as e:
        return {"ok": False, "error": str(e)}
    if new_refresh:
        creds["tiktok"]["refresh_token"] = new_refresh
        sp.save_credentials(creds)

    target = item.get("target") or {}
    return sp.tiktok_upload_video(
        access_token, upload_path,
        title=target.get("title") or item.get("text") or "",
        privacy_level=target.get("privacy_level", "SELF_ONLY"),
    )


# ── Tablero HTML ──────────────────────────────────────────────────────────────

PAGE = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Publish · Modo God</title>
<style>
  :root { color-scheme: dark;
    --ink-900:#070504; --ink-800:#0a0a0a; --ink-700:#0f0f0f; --ink-600:#161513;
    --cream:#f5e9d4; --gold:#c9a96e; --gold-dim:#a1854f; --rec:#ff1f3e;
    --ok:#6ab04c; --warn:#e2b33c; --line:rgba(201,169,110,.18);
  }
  * { box-sizing:border-box; }
  body { margin:0 auto; padding:2.2rem 1.2rem 5rem; max-width:78ch;
    background:var(--ink-900); color:var(--cream);
    font:400 1rem/1.6 "Space Grotesk","Helvetica Neue",Arial,sans-serif; }
  a.back { font:500 .74rem/1 ui-monospace,Consolas,monospace; letter-spacing:.1em;
    text-transform:uppercase; color:var(--gold); text-decoration:none; }
  h1 { font:300 2.2rem/1.1 "Cormorant Garamond",Georgia,serif; margin:.8rem 0 .3rem; }
  .lede { margin:0 0 1.6rem; max-width:64ch; color:#a9a094; font-size:.92rem; }
  h2 { margin:2rem 0 .6rem; font:500 .72rem/1 ui-monospace,Consolas,monospace; letter-spacing:.18em;
    text-transform:uppercase; color:var(--gold); border-bottom:1px solid var(--line); padding-bottom:.4rem; }
  .filters { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.4rem; }
  .filters a { font:500 .7rem/1 ui-monospace,Consolas,monospace; text-transform:uppercase;
    letter-spacing:.06em; color:#8a8175; border:1px solid var(--line); padding:.35rem .7rem; text-decoration:none; }
  .filters a.on { color:var(--gold); border-color:var(--gold-dim); }

  .item { position:relative; background:var(--ink-700); border:1px solid var(--line);
    padding:1rem 1.1rem; margin-bottom:.8rem; }
  .item.posted { border-color:rgba(106,176,76,.5); }
  .item.failed { border-color:var(--rec); }
  .item.dropped { border-color:var(--line); opacity:.6; }
  .item.archived { opacity:.55; }
  .head { display:flex; flex-wrap:wrap; align-items:center; gap:.5rem; margin-bottom:.5rem; }
  .tag { font:500 .66rem/1.5 ui-monospace,Consolas,monospace; letter-spacing:.1em; text-transform:uppercase;
    border:1px solid currentColor; padding:.1rem .5rem; white-space:nowrap; }
  .tag.net-discord { color:#7289da; }
  .tag.net-youtube { color:#ff4444; }
  .tag.net-x { color:var(--cream); }
  .tag.net-tiktok { color:#69c9d0; }
  .tag.mode-auto { color:var(--gold); }
  .tag.mode-assisted { color:#8a8175; }
  .tag.status-draft { color:#8a8175; }
  .tag.status-queued { color:var(--warn); }
  .tag.status-posted { color:var(--ok); }
  .tag.status-failed { color:var(--rec); }
  .tag.status-dropped { color:#8a8175; text-decoration:line-through; }
  .proj { font:500 .78rem/1 ui-monospace,Consolas,monospace; color:var(--gold); margin-left:auto; }

  .text { font-size:.94rem; line-height:1.55; white-space:pre-wrap; margin:0 0 .5rem; color:var(--cream); }
  .meta { font:400 .78rem/1.6 ui-monospace,Consolas,monospace; color:#8a8175; margin:0 0 .7rem; }
  .meta code { color:var(--gold-dim); }
  .result { font:400 .78rem/1.5 ui-monospace,Consolas,monospace; margin:.5rem 0 0; padding:.5rem .7rem;
    border-left:2px solid var(--line); white-space:pre-wrap; }
  .result.ok { border-color:var(--ok); color:#a9c99a; }
  .result.err { border-color:var(--rec); color:#e79a9a; }

  .actions { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.4rem; }
  button, .btnlink { appearance:none; cursor:pointer; font:500 .72rem/1 ui-monospace,Consolas,monospace;
    letter-spacing:.06em; text-transform:uppercase; background:transparent; color:var(--gold);
    border:1px solid var(--gold-dim); padding:.5rem .9rem; text-decoration:none; display:inline-block; }
  button:hover, .btnlink:hover { background:var(--gold); color:var(--ink-900); }
  button:disabled { opacity:.4; cursor:default; background:transparent; color:var(--gold); }
  .btn-fire { border-color:var(--gold); }
  .btn-copy.done { color:var(--ok); border-color:var(--ok); }
  .btn-archive { color:#8a8175; border-color:var(--line); }
  .btn-archive:hover { background:#8a8175; color:var(--ink-900); }

  .empty { font-family:ui-monospace,Consolas,monospace; font-size:.85rem; color:#8a8175;
    border:1px dashed var(--line); padding:1rem; }
  footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line);
    font-size:.85rem; color:#8a8175; }
</style></head>
<body>
  <a class="back" href="/">&larr; Modo God</a>
  <h1>Publish</h1>
  <p class="lede">Cola de contenido para redes. Discord, YouTube y X disparan de verdad desde acá
    (webhook / Data API v3 / API v2 con OAuth). TikTok también dispara de verdad (Content Posting
    API), pero sale privado (solo vos lo ves) hasta que TikTok apruebe la revisión de la app --
    ver <code>tiktok_oauth_setup.py</code>. Sin credenciales cargadas, "Disparar" devuelve el
    detalle de qué falta en vez de intentarlo.</p>
  <div class="filters">__ARCHIVED_FILTERS__</div>
  <div class="filters">__STATUS_FILTERS__</div>
  <div class="filters">__FILTERS__</div>
  <div class="filters">__NETWORK_FILTERS__</div>
  <div id="items">__ITEMS__</div>
  <footer>El disparo real (Discord/YouTube/X/TikTok) es exclusivo de esta consola local -- el
    espejo público de Modo God no tiene este endpoint. Las credenciales viven en
    <code>publish-credentials.json</code>, gitignoreado.</footer>

<script>
function fire(id, btn) {
  if (!confirm("¿Disparar este post de verdad? No hay vuelta atrás.")) return;
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Publicando…";
  fetch("api/publish/fire", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({id})
  }).then(r => r.json()).then(data => {
    location.reload();
  }).catch(err => {
    btn.disabled = false;
    btn.textContent = original;
    alert("Fallo de red disparando el post: " + err.message);
  });
}

function toggleArchive(id, btn) {
  const archiving = btn.getAttribute("data-archived") === "0";
  if (!confirm(archiving ? "¿Archivar este post?" : "¿Desarchivar este post?")) return;
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = archiving ? "Archivando…" : "Desarchivando…";
  fetch("api/publish/archive", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({id, archived: archiving})
  }).then(r => r.json()).then(data => {
    location.reload();
  }).catch(err => {
    btn.disabled = false;
    btn.textContent = original;
    alert("Fallo de red archivando el post: " + err.message);
  });
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    window.prompt("No pude copiar solo -- copiá a mano:", text);
    return;
  }
  const original = btn.textContent;
  btn.textContent = "✓ Copiado";
  btn.classList.add("done");
  setTimeout(() => { btn.textContent = original; btn.classList.remove("done"); }, 1500);
}

document.getElementById("items").addEventListener("click", (e) => {
  const fireBtn = e.target.closest("[data-fire]");
  const copyBtn = e.target.closest("[data-copy]");
  const archiveBtn = e.target.closest("[data-archive]");
  if (fireBtn) fire(fireBtn.getAttribute("data-fire"), fireBtn);
  else if (copyBtn) copyText(copyBtn.getAttribute("data-copy"), copyBtn);
  else if (archiveBtn) toggleArchive(archiveBtn.getAttribute("data-archive"), archiveBtn);
});
</script>
</body></html>
"""

NETWORK_LABEL = {"discord": "Discord", "youtube": "YouTube", "x": "X", "tiktok": "TikTok"}

# Etiquetas lindas para los status conocidos -- igual que NETWORK_LABEL, la lista de status que
# efectivamente aparece como filtro sale de la cola en sí (ver render_page), esto solo pone
# texto legible en vez del valor crudo cuando lo reconoce.
STATUS_LABEL = {
    "draft": "Pendientes", "queued": "En cola", "posted": "Posteado",
    "failed": "Fallido", "dropped": "Descartado",
}

COMPOSE_URL = {
    "x": lambda text: "https://twitter.com/intent/tweet?text=" + _urlenc(text),
    "tiktok": lambda text: "https://www.tiktok.com/upload?lang=en",
}


def _urlenc(s):
    from urllib.parse import quote
    return quote(s or "", safe="")


def _esc(s):
    if s is None:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def _item_html(item):
    network = item.get("network", "?")
    status = item.get("status", "draft")
    mode = "auto" if network in AUTO_NETWORKS else "assisted"
    is_archived = bool(item.get("archived"))
    text = item.get("text") or ""
    media = item.get("media_path")
    # Slot de la rotación semanal (publish_rotation.py) sin llenar todavía -- o cualquier item sin
    # contenido real por otro motivo. Nunca se puede disparar (post_discord/youtube_upload_video
    # rechazan texto+media vacíos), así que ni se muestra el botón: evita un click que solo daría error.
    is_empty = not text and not media

    tags = [
        '<span class="tag net-{n}">{label}</span>'.format(n=_esc(network), label=_esc(NETWORK_LABEL.get(network, network))),
        '<span class="tag mode-{m}">{m}</span>'.format(m=mode),
        '<span class="tag status-{s}">{s}</span>'.format(s=_esc(status)),
    ]
    if item.get("slot"):
        tags.append('<span class="tag" style="color:#8a8175">slot · {b}</span>'.format(b=_esc(item.get("bucket") or "?")))
    if is_archived:
        tags.append('<span class="tag" style="color:#8a8175">📁 archivado</span>')

    meta_bits = []
    if item.get("suggested_at"):
        meta_bits.append("sugerido " + _esc(item["suggested_at"]))
    if media:
        meta_bits.append("archivo <code>" + _esc(media) + "</code>")
    if item.get("source"):
        meta_bits.append("fuente: " + _esc(item["source"]))
    meta_html = " · ".join(meta_bits)

    actions = []
    if is_empty:
        actions.append('<span class="tag" style="color:#8a8175">sin contenido todavía — lo llena una corrida de Marketing (o a mano), después se aprueba como cualquier item</span>')
    elif mode == "auto":
        disabled = " disabled" if status == "posted" else ""
        actions.append('<button class="btn-fire" type="button" data-fire="{id}"{dis}>Disparar</button>'.format(
            id=_esc(item.get("id")), dis=disabled))
    else:
        actions.append('<button class="btn-copy" type="button" data-copy="{text}">Copiar texto</button>'.format(text=_esc(text)))
        url_fn = COMPOSE_URL.get(network)
        if url_fn:
            actions.append('<a class="btnlink" href="{url}" target="_blank" rel="noopener">Abrir compose ↗</a>'.format(
                url=_esc(url_fn(text))))

    # Archivar/desarchivar -- toggle, disponible siempre (item vacío, auto o asistido). No es
    # excluyente con "Disparar"/"Copiar texto": archivar solo saca el item de la vista default,
    # no cambia status ni impide re-disparar si hiciera falta.
    actions.append('<button class="btn-archive" type="button" data-archive="{id}" data-archived="{archived}">{label}</button>'.format(
        id=_esc(item.get("id")), archived="1" if is_archived else "0",
        label=("📂 Desarchivar" if is_archived else "📁 Archivar")))

    result_html = ""
    r = item.get("result")
    if r:
        ok = r.get("ok")
        cls = "ok" if ok else "err"
        detail = json.dumps(r, ensure_ascii=False, indent=None)
        result_html = '<div class="result {cls}">{detail}</div>'.format(cls=cls, detail=_esc(detail))

    return """
  <article class="item {status}{archived_cls}" data-id="{id}">
    <div class="head">{tags}<span class="proj">{project}</span></div>
    <p class="text">{text}</p>
    <p class="meta">{meta}</p>
    <div class="actions">{actions}</div>
    {result}
  </article>""".format(
        status=_esc(status), archived_cls=" archived" if is_archived else "",
        id=_esc(item.get("id")), tags="".join(tags),
        project=_esc(item.get("project") or ""), text=_esc(text) or "&mdash;", meta=meta_html,
        actions="".join(actions), result=result_html,
    )


def _filter_href(project=None, network=None, status=None, archived=None):
    """Arma /publish con los query params que estén presentes, para que cambiar un filtro
    (proyecto, red, status o archivado) preserve los otros tres -- ej.
    /publish?project=moba-warmup&network=x&status=draft&archived=1."""
    from urllib.parse import quote
    params = []
    if project:
        params.append("project=" + quote(project))
    if network:
        params.append("network=" + quote(network))
    if status:
        params.append("status=" + quote(status))
    if archived:
        params.append("archived=" + quote(archived))
    return "/publish" + ("?" + "&".join(params) if params else "")


def render_page(project_filter=None, network_filter=None, status_filter=None, archived_filter=None):
    doc = load_queue()
    all_items = doc.get("items", [])
    items = all_items
    if project_filter:
        items = [it for it in items if it.get("project") == project_filter]
    if network_filter:
        items = [it for it in items if it.get("network") == network_filter]
    if status_filter:
        items = [it for it in items if it.get("status") == status_filter]
    # Default: sacar los archivados de la vista para bajar el ruido (pedido de Roi, 14/8) --
    # ?archived=1 los muestra a ELLOS, no "todo incluido archivados": si hace falta ver un
    # archivado puntual junto a los activos, combinar con project/network/status en vez de
    # este filtro, que es binario a propósito (más simple que un tercer estado "todo").
    if archived_filter:
        items = [it for it in items if it.get("archived")]
    else:
        items = [it for it in items if not it.get("archived")]

    projects = sorted({it.get("project") for it in all_items if it.get("project")})
    filters = ['<a href="{href}"{on}>todos</a>'.format(
        href=_esc(_filter_href(network=network_filter, status=status_filter, archived=archived_filter)),
        on=" class=\"on\"" if not project_filter else "")]
    for p in projects:
        on = " class=\"on\"" if p == project_filter else ""
        filters.append('<a href="{href}"{on}>{p}</a>'.format(
            href=_esc(_filter_href(project=p, network=network_filter, status=status_filter, archived=archived_filter)),
            on=on, p=_esc(p)))

    # Networks sacadas de la cola en sí, no hardcodeadas -- así se banca que mañana se sume una
    # red nueva sin tocar este archivo.
    networks = sorted({it.get("network") for it in all_items if it.get("network")})
    network_filters = ['<a href="{href}"{on}>todas</a>'.format(
        href=_esc(_filter_href(project=project_filter, status=status_filter, archived=archived_filter)),
        on=" class=\"on\"" if not network_filter else "")]
    for n in networks:
        on = " class=\"on\"" if n == network_filter else ""
        network_filters.append('<a href="{href}"{on}>{label}</a>'.format(
            href=_esc(_filter_href(project=project_filter, network=n, status=status_filter, archived=archived_filter)),
            on=on, label=_esc(NETWORK_LABEL.get(n, n))))

    # Statuses sacados de la cola en sí, mismo criterio que projects/networks -- no hardcodear
    # qué valores existen. "draft" (pendientes) va primero si está presente: es el filtro que
    # más se usa (STUDIO.md / pedido de Roi 14/8), el resto en orden alfabético detrás.
    statuses = sorted({it.get("status") for it in all_items if it.get("status")})
    if "draft" in statuses:
        statuses.remove("draft")
        statuses.insert(0, "draft")
    status_filters = ['<a href="{href}"{on}>todos</a>'.format(
        href=_esc(_filter_href(project=project_filter, network=network_filter, archived=archived_filter)),
        on=" class=\"on\"" if not status_filter else "")]
    for s in statuses:
        on = " class=\"on\"" if s == status_filter else ""
        status_filters.append('<a href="{href}"{on}>{label}</a>'.format(
            href=_esc(_filter_href(project=project_filter, network=network_filter, status=s, archived=archived_filter)),
            on=on, label=_esc(STATUS_LABEL.get(s, s))))

    # Archivado: binario a propósito (activas/archivadas) -- ver comentario del filtro arriba.
    archived_filters = [
        '<a href="{href}"{on}>📂 activas</a>'.format(
            href=_esc(_filter_href(project=project_filter, network=network_filter, status=status_filter)),
            on=" class=\"on\"" if not archived_filter else ""),
        '<a href="{href}"{on}>📁 archivadas</a>'.format(
            href=_esc(_filter_href(project=project_filter, network=network_filter, status=status_filter, archived="1")),
            on=" class=\"on\"" if archived_filter else ""),
    ]

    if not items:
        empty_bits = []
        if project_filter:
            empty_bits.append("proyecto " + _esc(project_filter))
        if network_filter:
            empty_bits.append("red " + _esc(NETWORK_LABEL.get(network_filter, network_filter)))
        if status_filter:
            empty_bits.append("status " + _esc(STATUS_LABEL.get(status_filter, status_filter)))
        if archived_filter:
            empty_bits.append("archivadas")
        suffix = (" para " + " · ".join(empty_bits)) if empty_bits else ""
        items_html = '<div class="empty">Nada en la cola' + suffix + '. Agregar entradas a mano en publish-queue.json.</div>'
    else:
        # draft/queued/failed primero -- lo que necesita atención; posted y dropped al final.
        order = {"queued": 0, "draft": 1, "failed": 2, "posted": 3, "dropped": 4}
        items = sorted(items, key=lambda it: order.get(it.get("status"), 1))
        items_html = "".join(_item_html(it) for it in items)

    return (PAGE.replace("__ARCHIVED_FILTERS__", "".join(archived_filters))
                .replace("__STATUS_FILTERS__", "".join(status_filters))
                .replace("__FILTERS__", "".join(filters))
                .replace("__NETWORK_FILTERS__", "".join(network_filters))
                .replace("__ITEMS__", items_html))
