#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- tablero de QA embebido.

Ex-`~/.claude/skills/qa/qa-board.py`, portado para vivir junto al resto de Modo God en vez de
ser un `http.server` aparte que había que invocar a mano con `--repo`. La diferencia real: el
repo ya no es un flag, se resuelve por `slug` contra `studio/registry.json` -- así el tablero de
QA de cualquier proyecto del estudio cuelga de la misma consola (`localhost:5080`) que ya sabe
qué juego es cuál.

El circuito POST-veredicto-a-disco es EL MISMO que en el script original, sin tocar: cada marca
se escribe al instante en `<repo>/docs/qa/runs/<build>.json` (atómico, vía os.replace) y dispara
una línea en `<repo>/docs/qa/runs/<build>.events.log` -- ese archivo es lo que un Monitor de
Claude sigue con `grep FALLA` mientras la pasada está en curso. Ni el formato del JSON ni el del
.events.log cambiaron: son los mismos que ya usa `docs/qa-log.md` y el skill `qa`.

Rutas que sirve `modo-god.py` usando este módulo (solo en la consola LOCAL -- el Worker público
de `god.obscuromediaworks.com.ar` no las tiene, ver `_worker.js`):

    GET  /qa                       -> selector de proyecto (los que tienen docs/qa/items.json)
    GET  /qa?project=<slug>[&build=<sha>]
                                    -> el tablero, resuelto por registry.json
    POST /api/qa/mark?project=<slug>&build=<sha>
                                    -> escribe un veredicto (mismo payload {id, verdict, note})
"""

import json
import os
import subprocess
import threading
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(HERE)
REGISTRY_PATH = os.path.join(STUDIO, "registry.json")

# ── Plantilla del tablero ────────────────────────────────────────────────────
# Paleta Hextech (guia de estilo LoL 2016), la misma que usaba el script standalone. Es la
# identidad visual de MOBA Warmup, no la del estudio -- generalizarla a un tema por proyecto
# queda como decisión abierta (ver decisions.json: "qa-board-palette-per-project").
PAGE = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA · __TITLE__</title>
<style>
  :root {
    color-scheme: dark;
    --ink:#010A13; --panel:#091428; --panel2:#0C1B33;
    --gold1:#F0E6D2; --gold2:#C8AA6E; --gold3:#C89B3C; --gold4:#785A28;
    --grey:#A09B8C; --teal:#0AC8B9; --alarm:#D4623F;
    --line:rgba(120,90,40,.45);
  }
  * { box-sizing:border-box; }
  body {
    margin:0 auto; padding:2.2rem 1.2rem 5rem; max-width:78ch;
    background:var(--ink); color:var(--gold1);
    font:400 1rem/1.65 ui-sans-serif,"Segoe UI",system-ui,sans-serif;
  }
  .back { display:inline-block; margin-bottom:1rem; font:500 .74rem/1 ui-monospace,Consolas,monospace;
          letter-spacing:.1em; text-transform:uppercase; color:var(--gold4); text-decoration:none; }
  .back:hover { color:var(--gold2); }
  .eyebrow { font:500 .72rem/1 ui-monospace,Consolas,monospace; letter-spacing:.22em;
             text-transform:uppercase; color:var(--gold4); }
  h1 { margin:.6rem 0 0; font:400 clamp(1.8rem,5vw,2.6rem)/1.1 Georgia,serif;
       letter-spacing:.06em; text-transform:uppercase; text-wrap:balance; }
  .lede { margin:.6rem 0 0; max-width:62ch; color:var(--grey); }
  .build { margin-top:1.3rem; padding:.8rem 1rem; display:flex; flex-wrap:wrap; gap:.3rem 1.4rem;
           border-left:2px solid var(--gold4);
           background:linear-gradient(90deg,rgba(200,155,60,.07),transparent 70%);
           font:400 .84rem/1.5 ui-monospace,Consolas,monospace; color:var(--grey); }
  .build b { color:var(--gold2); font-weight:500; }

  .meter { position:sticky; top:0; z-index:5; padding:.9rem 0; background:var(--ink);
           display:flex; align-items:center; flex-wrap:wrap; gap:.5rem .9rem; }
  .track { flex:1 1 8rem; height:3px; background:rgba(120,90,40,.35); display:flex; }
  .b-ok { height:100%; width:0; background:var(--teal); transition:width .28s ease; }
  .b-bad{ height:100%; width:0; background:var(--alarm); transition:width .28s ease; }
  .tally { font:500 .78rem/1 ui-monospace,Consolas,monospace; letter-spacing:.08em;
           color:var(--grey); font-variant-numeric:tabular-nums; white-space:nowrap; }
  .tally .ok{color:var(--teal)} .tally .bad{color:var(--alarm)}
  .sync { font:500 .72rem/1 ui-monospace,Consolas,monospace; color:var(--gold4); }
  .sync.live { color:var(--teal); }
  .sync.err  { color:var(--alarm); }

  h2 { margin:2.2rem 0 .3rem; font:400 1.2rem/1.25 Georgia,serif; letter-spacing:.12em;
       text-transform:uppercase; color:var(--gold3); }
  .sub { margin:0 0 1.1rem; max-width:64ch; font-size:.92rem; color:var(--grey); }

  .item { position:relative; padding:1rem 1.1rem; margin-bottom:.7rem;
          background:var(--panel); border:1px solid var(--line); }
  .item::before { content:""; position:absolute; inset:4px;
                  border:1px solid rgba(200,170,110,.13); pointer-events:none; }
  .item.ok   { border-color:rgba(10,200,185,.4); }
  .item.fail { border-color:var(--alarm); }
  .item.ok .what { color:var(--grey); }
  .head { display:flex; flex-wrap:wrap; align-items:baseline; gap:.55rem; }
  .id { font:500 .74rem/1 ui-monospace,Consolas,monospace; letter-spacing:.1em; color:var(--gold4); }
  .what { font-weight:500; }
  .how { margin:.45rem 0 0; font-size:.92rem; color:var(--grey); }
  .tag { padding:.12rem .5rem; font:500 .66rem/1.5 ui-monospace,Consolas,monospace;
         letter-spacing:.12em; text-transform:uppercase; border:1px solid currentColor;
         color:var(--gold4); white-space:nowrap; }
  .tag.pub { color:var(--alarm); }

  .verdict { margin-top:.8rem; display:flex; gap:.5rem; }
  .vote { appearance:none; cursor:pointer; padding:.32rem .95rem; background:transparent;
          border:1px solid var(--gold4); font:500 .72rem/1.4 ui-monospace,Consolas,monospace;
          letter-spacing:.12em; text-transform:uppercase; color:var(--grey); }
  .vote:hover { border-color:var(--gold2); color:var(--gold1); }
  .vote:focus-visible { outline:2px solid var(--teal); outline-offset:2px; }
  .item.ok   .vote[data-v="ok"]   { background:var(--teal);  border-color:var(--teal);  color:var(--ink); }
  .item.fail .vote[data-v="fail"] { background:var(--alarm); border-color:var(--alarm); color:var(--ink); }

  .why { margin-top:.7rem; display:none; }
  .item.fail .why { display:block; }
  .why label { display:block; margin-bottom:.35rem; font:500 .68rem/1 ui-monospace,Consolas,monospace;
               letter-spacing:.14em; text-transform:uppercase; color:var(--alarm); }
  .why textarea { width:100%; min-height:3.6rem; padding:.55rem .7rem; background:var(--ink);
                  color:var(--gold1); border:1px solid var(--gold4); resize:vertical;
                  font:400 .9rem/1.5 ui-sans-serif,"Segoe UI",system-ui,sans-serif; }
  .why textarea:focus-visible { outline:2px solid var(--alarm); outline-offset:1px; }

  footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line);
           font-size:.87rem; color:var(--grey); }
  code { font:.86em/1.4 ui-monospace,Consolas,monospace; color:var(--gold2); }
  @media (prefers-reduced-motion:reduce){ *{transition:none!important} }
</style></head>
<body>
  <a class="back" href="/">&larr; Modo God</a><br>
  <span class="eyebrow">__PROJECT__ · pasada en vivo</span>
  <h1>__TITLE__</h1>
  <p class="lede">Marcá cada ítem. Cada marca se escribe al toque en el repo -- Claude la lee del
    otro lado, así que una falla con su nota le llega sin que copies nada.</p>

  <div class="build">
    <span><b>build</b> __BUILD__</span>
    <span><b>repo</b> __REPO__</span>
    <span><b>archivo</b> docs/qa/runs/__BUILD__.json</span>
  </div>

  <div class="meter">
    <div class="track"><div class="b-ok" id="bok"></div><div class="b-bad" id="bbad"></div></div>
    <span class="tally"><b class="ok" id="nok">0</b> ok · <b class="bad" id="nbad">0</b> falla ·
      <b id="npend">0</b> sin ver</span>
    <span class="sync" id="sync">guardado</span>
  </div>

  <div id="groups"></div>

  <footer>
    <p>Cuando termines, avisale a Claude por el chat. El estado vive en el archivo, así que podés
      cerrar esta pestaña y volver: se retoma donde ibas.</p>
  </footer>

<script>
const DATA = __DATA__;
const MARK_URL = __MARK_URL__;
const groupsEl = document.getElementById("groups");
const sync = document.getElementById("sync");
let state = DATA.state || {};
let items = [];

DATA.groups.forEach(g => {
  const h = document.createElement("h2"); h.textContent = g.name; groupsEl.appendChild(h);
  if (g.note) { const p = document.createElement("p"); p.className = "sub"; p.textContent = g.note; groupsEl.appendChild(p); }
  g.items.forEach(it => { groupsEl.appendChild(card(it)); items.push(it); });
});

function card(it) {
  const el = document.createElement("div");
  el.className = "item"; el.dataset.id = it.id;

  const head = document.createElement("div"); head.className = "head";
  const id = document.createElement("span"); id.className = "id"; id.textContent = it.id;
  const what = document.createElement("span"); what.className = "what"; what.textContent = it.what;
  head.append(id, what);
  if (it.scope) {
    const t = document.createElement("span");
    // El scope no es decoración: "itch" marca lo que llega al build público.
    t.className = "tag" + (it.scope === "itch" ? " pub" : "");
    t.textContent = it.scope; head.appendChild(t);
  }
  el.appendChild(head);

  if (it.how) { const p = document.createElement("p"); p.className = "how"; p.textContent = it.how; el.appendChild(p); }

  const row = document.createElement("div"); row.className = "verdict";
  [["ok","Ok"],["fail","Falla"]].forEach(([v,label]) => {
    const b = document.createElement("button");
    b.className = "vote"; b.type = "button"; b.dataset.v = v; b.textContent = label;
    b.setAttribute("aria-label", label + " — " + it.id);
    // Volver a tocar el voto activo lo deja sin ver: sin esto no hay forma de
    // deshacer un click equivocado.
    b.onclick = () => mark(it.id, (state[it.id]||{}).v === v ? null : v);
    row.appendChild(b);
  });
  el.appendChild(row);

  const why = document.createElement("div"); why.className = "why";
  const lab = document.createElement("label"); lab.textContent = "Qué pasó";
  lab.htmlFor = "n-" + it.id;
  const ta = document.createElement("textarea"); ta.id = "n-" + it.id;
  ta.placeholder = "Qué viste y dónde. Esto es lo que hace arreglable la falla.";
  let timer;
  ta.oninput = () => { clearTimeout(timer); timer = setTimeout(() => note(it.id, ta.value), 700); };
  ta.onblur = () => { clearTimeout(timer); note(it.id, ta.value); };
  why.append(lab, ta); el.appendChild(why);

  return el;
}

function mark(id, v) {
  state[id] = state[id] || {};
  state[id].v = v;
  render();
  push({id, verdict: v, note: state[id].note || ""});
  if (v === "fail") { const t = document.getElementById("n-" + id); if (t) t.focus(); }
}

function note(id, text) {
  state[id] = state[id] || {};
  if (state[id].note === text) return;
  state[id].note = text;
  push({id, verdict: state[id].v || null, note: text});
}

function push(payload) {
  sync.textContent = "guardando…"; sync.className = "sync";
  fetch(MARK_URL, {method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify(payload)})
    .then(r => { if (!r.ok) throw new Error(r.status);
                 sync.textContent = "guardado ✓"; sync.className = "sync live"; })
    .catch(() => { sync.textContent = "SIN GUARDAR — ¿se cerró el server?"; sync.className = "sync err"; });
}

function render() {
  let ok = 0, bad = 0;
  items.forEach(it => {
    const el = groupsEl.querySelector('.item[data-id="' + it.id + '"]');
    const s = state[it.id] || {};
    el.classList.toggle("ok", s.v === "ok");
    el.classList.toggle("fail", s.v === "fail");
    const ta = el.querySelector("textarea");
    if (ta && document.activeElement !== ta && ta.value !== (s.note || "")) ta.value = s.note || "";
    if (s.v === "ok") ok++; else if (s.v === "fail") bad++;
  });
  const n = items.length;
  document.getElementById("bok").style.width  = (ok/n*100) + "%";
  document.getElementById("bbad").style.width = (bad/n*100) + "%";
  document.getElementById("nok").textContent = ok;
  document.getElementById("nbad").textContent = bad;
  document.getElementById("npend").textContent = n - ok - bad;
}

render();
</script>
</body></html>
"""

PICKER_PAGE = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA · Modo God</title>
<style>
  :root { color-scheme: dark; --ink:#070504; --cream:#f5e9d4; --gold:#c9a96e; --line:rgba(201,169,110,.18); }
  body { margin:0 auto; padding:2.2rem 1.2rem 5rem; max-width:60ch; background:var(--ink); color:var(--cream);
         font:400 1rem/1.6 "Space Grotesk","Helvetica Neue",Arial,sans-serif; }
  a.back { font:500 .74rem/1 ui-monospace,Consolas,monospace; letter-spacing:.1em; text-transform:uppercase;
           color:var(--gold); text-decoration:none; }
  h1 { font:300 2.2rem/1.1 "Cormorant Garamond",Georgia,serif; margin:.8rem 0 1.4rem; }
  ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.6rem; }
  li a { display:block; padding:.9rem 1.1rem; border:1px solid var(--line); color:var(--cream);
         text-decoration:none; font-size:.95rem; }
  li a:hover { border-color:var(--gold); color:var(--gold); }
  li span { display:block; font:500 .72rem/1 ui-monospace,Consolas,monospace; color:#8a8175; margin-top:.3rem; }
  .empty { color:#8a8175; font-size:.9rem; }
</style></head>
<body>
  <a class="back" href="/">&larr; Modo God</a>
  <h1>QA · elegir proyecto</h1>
  __LIST__
</body></html>
"""


def load_registry():
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def resolve_project(slug):
    """(repo_path, name) para un slug de registry.json, o (None, None) si no existe."""
    reg = load_registry()
    for p in reg.get("projects", []):
        if p.get("slug") == slug:
            return p.get("repo_path"), p.get("name")
    return None, None


def items_path_for(repo):
    return os.path.join(repo, "docs", "qa", "items.json")


def qa_projects():
    """Proyectos del registry que tienen docs/qa/items.json -- para el selector."""
    reg = load_registry()
    out = []
    for p in reg.get("projects", []):
        repo = p.get("repo_path")
        if repo and os.path.isfile(items_path_for(repo)):
            out.append(p)
    return out


def short_head(repo):
    try:
        out = subprocess.run(["git", "-C", repo, "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or "sin-git"
    except Exception:
        return "sin-git"


def now():
    return datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S")


class Board:
    """Estado de la pasada + persistencia. Escribe en CADA marca, no al cerrar: el punto de todo
    esto es que Claude pueda leer la pasada mientras ocurre. Portado sin cambios de qa-board.py --
    el formato de runs/<build>.json y runs/<build>.events.log es el mismo que ya lee el skill qa
    y el Monitor de Claude."""

    def __init__(self, repo, spec, build):
        self.repo, self.spec, self.build = repo, spec, build
        self.runs = os.path.join(repo, "docs", "qa", "runs")
        os.makedirs(self.runs, exist_ok=True)
        self.json_path = os.path.join(self.runs, build + ".json")
        self.log_path = os.path.join(self.runs, build + ".events.log")
        self.lock = threading.Lock()
        self.state = {}
        if os.path.isfile(self.json_path):
            try:
                with open(self.json_path, encoding="utf-8") as f:
                    self.state = json.load(f).get("items", {})
            except Exception:
                self.state = {}

    def labels(self):
        out = {}
        for g in self.spec["groups"]:
            for it in g["items"]:
                out[it["id"]] = it["what"]
        return out

    def mark(self, item_id, verdict, note):
        with self.lock:
            prev = self.state.get(item_id, {})
            self.state[item_id] = {"verdict": verdict, "note": note, "at": now()}
            changed_verdict = prev.get("verdict") != verdict
            self._write()
            if changed_verdict:
                self._event(item_id, verdict, note)
            elif verdict == "fail" and prev.get("note") != note:
                # La nota de una falla es el contenido util: si cambia, vale un evento
                # aunque el veredicto sea el mismo.
                self._event(item_id, verdict, note)

    def _write(self):
        labels = self.labels()
        total = len(labels)
        ok = sum(1 for v in self.state.values() if v.get("verdict") == "ok")
        bad = sum(1 for v in self.state.values() if v.get("verdict") == "fail")
        doc = {
            "build": self.build,
            "title": self.spec.get("title", "Pasada de QA"),
            "project": self.spec.get("project", os.path.basename(self.repo)),
            "updatedAt": now(),
            "summary": {"total": total, "ok": ok, "fail": bad, "pending": total - ok - bad},
            "items": self.state,
            "labels": labels,
        }
        tmp = self.json_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.json_path)  # atomico: Claude nunca lee un archivo a medio escribir

    def _event(self, item_id, verdict, note):
        label = self.labels().get(item_id, item_id)
        tag = {"fail": "FALLA", "ok": "OK"}.get(verdict, "SIN VER")
        line = f"[{now()}] {tag} {item_id} — {label}"
        if verdict == "fail":
            line += " :: " + (note.replace("\n", " ").strip() or "(sin detalle todavia)")
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(line + "\n")
            f.flush()


_boards = {}
_boards_lock = threading.Lock()


def get_board(repo, spec, build):
    """Cachea el Board en memoria por (repo, build) -- evita releer el JSON en cada POST y
    mantiene un único lock por pasada mientras el proceso de Modo God sigue vivo."""
    key = (os.path.abspath(repo), build)
    with _boards_lock:
        board = _boards.get(key)
        if board is None:
            board = Board(repo, spec, build)
            _boards[key] = board
        return board


class SpecNotFound(Exception):
    pass


def load_spec(repo):
    path = items_path_for(repo)
    if not os.path.isfile(path):
        raise SpecNotFound(path)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def render_board_page(project_name, repo, spec, build, mark_url):
    payload = {"groups": spec["groups"]}
    board = get_board(repo, spec, build)
    payload["state"] = {
        k: {"v": v.get("verdict"), "note": v.get("note", "")} for k, v in board.state.items()
    }
    board._write()  # deja el archivo creado desde que se abre el tablero, igual que el script original
    html = (PAGE
            .replace("__DATA__", json.dumps(payload, ensure_ascii=False))
            .replace("__MARK_URL__", json.dumps(mark_url))
            .replace("__TITLE__", spec.get("title", "Pasada de QA"))
            .replace("__PROJECT__", spec.get("project", project_name or os.path.basename(repo)))
            .replace("__BUILD__", build)
            .replace("__REPO__", os.path.basename(repo)))
    return html


def render_picker_page():
    projects = qa_projects()
    if not projects:
        items_html = '<p class="empty">Ningún proyecto tiene docs/qa/items.json todavía.</p>'
    else:
        rows = []
        for p in projects:
            rows.append(
                '<li><a href="/qa?project={slug}">{name}</a>'
                '<span>{repo}</span></li>'.format(
                    slug=p["slug"], name=p["name"], repo=p.get("repo_path", "")
                )
            )
        items_html = "<ul>" + "".join(rows) + "</ul>"
    return PICKER_PAGE.replace("__LIST__", items_html)


def not_found_page(message):
    return (
        "<!doctype html><meta charset='utf-8'>"
        "<body style='background:#070504;color:#f5e9d4;font-family:sans-serif;padding:2rem'>"
        "<p><a href='/qa' style='color:#c9a96e'>&larr; QA</a></p>"
        "<h1>404</h1><p>" + message + "</p></body>"
    )
