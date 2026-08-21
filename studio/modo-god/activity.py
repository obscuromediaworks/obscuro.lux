#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- actividad en vivo de agentes (Claude Code corriendo en esta máquina).

Fuente real, no inventada -- verificada leyendo el disco mientras se armaba este archivo:

  ~/.claude/sessions/<pid>.json     Un archivo por proceso de Claude Code corriendo ahora mismo
                                     (interactivo o `sdk-cli`/subagente). Trae sessionId, cwd,
                                     name, startedAt. Puede quedar huérfano si el proceso murió
                                     sin limpiar -- no alcanza solo, ver mtime más abajo.

  ~/.claude/locks/<repo>-<hash>.json  Un lock por repo que una sesión tiene tomado (hook
                                     project-lock.mjs, corre en SessionStart/PreToolUse/
                                     SessionEnd). Trae sessionId, root (repo_path) y heartbeat.
                                     Útil para saber QUÉ repo toca cada sesión sin tener que
                                     adivinar por cwd, pero una sesión puede estar activa sin
                                     tener ningún lock (ej. solo lectura, o cwd = home).

  ~/.claude/projects/<cwd-codificado>/<sessionId>.jsonl  El transcript de la sesión: una línea
                                     JSON por evento (mensaje, tool_use, tool_result...),
                                     apendeada en vivo a medida que la sesión corre. La mtime de
                                     este archivo es la señal real de "está trabajando ahora" --
                                     se toca en cada línea nueva, streaming incluido. Es la misma
                                     fuente que graba las transcripciones de todas las sesiones
                                     (interactivas o lanzadas en background); no hay un mecanismo
                                     separado de "logs de tareas" en el estudio.

Ninguna de las tres alcanza sola. Esta consola local (modo-god.py, no el espejo público) las
cruza: sesión "viva" = tiene sessions/<pid>.json Y su transcript se tocó hace poco.

    GET /api/activity -> { ok, active, generated_at, sessions: [...] }

`active` es lo que decide el polling del frontend: si ninguna sesión está dentro de LIVE_WINDOW_S,
no hay nada corriendo ahora mismo y el tablero deja de pedir refrescos.
"""

import glob
import json
import os
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(HERE)
REGISTRY_PATH = os.path.join(STUDIO, "registry.json")
CLAUDE_HOME = os.path.join(os.path.expanduser("~"), ".claude")
SESSIONS_DIR = os.path.join(CLAUDE_HOME, "sessions")
PROJECTS_DIR = os.path.join(CLAUDE_HOME, "projects")

LIVE_WINDOW_S = 90     # transcript tocado hace menos de esto -> "trabajando ahora" (dispara polling)
RECENT_WINDOW_S = 900  # más viejo que esto: la sesión se descarta (huérfana o cerrada hace rato)
MAX_LINES = 12         # últimas líneas de log legibles a devolver por sesión
TAIL_BYTES = 300_000   # cuánto se lee desde el final del .jsonl -- evita releer archivos de varios MB en cada poll


def _read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def _load_registry_projects():
    doc = _read_json(REGISTRY_PATH) or {}
    return doc.get("projects", [])


def _project_for_path(path, projects):
    """Empareja el cwd de la sesión contra repo_path del registry (case-insensitive, Windows)."""
    if not path:
        return None
    norm = path.replace("\\", "/").rstrip("/").lower()
    for p in projects:
        rp = (p.get("repo_path") or "").replace("\\", "/").rstrip("/").lower()
        if rp and (norm == rp or norm.startswith(rp + "/")):
            return p.get("name") or p.get("slug")
    return None


def _list_session_files():
    """Un dict por ~/.claude/sessions/<pid>.json -- procesos de Claude Code vivos ahora."""
    out = []
    if not os.path.isdir(SESSIONS_DIR):
        return out
    for fn in os.listdir(SESSIONS_DIR):
        if not fn.endswith(".json"):
            continue
        data = _read_json(os.path.join(SESSIONS_DIR, fn))
        if data and data.get("sessionId"):
            out.append(data)
    return out


def _find_transcript(session_id):
    """El .jsonl de la sesión vive en projects/<cwd-codificado>/<sessionId>.jsonl -- el nombre de
    la subcarpeta depende de cómo se codificó el cwd, así que se busca por sessionId, no por cwd."""
    matches = glob.glob(os.path.join(PROJECTS_DIR, "*", session_id + ".jsonl"))
    if matches:
        return matches[0]
    matches = glob.glob(os.path.join(PROJECTS_DIR, "**", session_id + ".jsonl"), recursive=True)
    return matches[0] if matches else None


def _summarize_content_item(item):
    """Reduce un bloque de `content` a una línea humana. None si es ruido interno (thinking,
    reminders de sistema) -- no aporta a "qué está haciendo" y satura el panel."""
    t = item.get("type")
    if t == "text":
        text = (item.get("text") or "").strip().replace("\n", " ")
        if not text:
            return None
        # sin cap acá, un task-notification de un subagente (resumen de deploy, etc.) puede
        # traer miles de caracteres en un solo bloque de texto -- rompe el panel y pesa en
        # cada poll de 5s.
        if len(text) > 220:
            text = text[:217] + "..."
        return ("dice", text)
    if t == "tool_use":
        name = item.get("name") or "?"
        inp = item.get("input") or {}
        hint = (inp.get("command") or inp.get("file_path") or inp.get("pattern") or
                inp.get("description") or inp.get("skill") or inp.get("prompt") or "")
        hint = str(hint).strip().replace("\n", " ")
        if len(hint) > 90:
            hint = hint[:87] + "..."
        return ("tool", "{}({})".format(name, hint) if hint else name)
    if t == "tool_result":
        content = item.get("content")
        if isinstance(content, list):
            text = " ".join(str(c.get("text", "")) for c in content if isinstance(c, dict))
        else:
            text = str(content or "")
        text = text.strip().replace("\n", " ")
        if not text:
            return None
        if len(text) > 140:
            text = text[:137] + "..."
        return ("result", text)
    return None


def _tail_transcript(path, max_lines):
    """Lee solo los últimos TAIL_BYTES del archivo (los transcripts pesan varios MB en sesiones
    largas) y extrae las últimas `max_lines` entradas legibles."""
    try:
        with open(path, "rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            chunk = min(size, TAIL_BYTES)
            f.seek(size - chunk)
            data = f.read(chunk)
    except OSError:
        return []

    raw_lines = data.decode("utf-8", errors="replace").splitlines()
    if chunk < size:
        raw_lines = raw_lines[1:]  # la primera línea del chunk puede venir cortada a la mitad

    out = []
    for raw in raw_lines[-400:]:  # margen: no todas las líneas del jsonl aportan texto visible
        raw = raw.strip()
        if not raw:
            continue
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        msg = entry.get("message") or {}
        role = msg.get("role") or entry.get("type")
        content = msg.get("content")
        if isinstance(content, str):
            content = [{"type": "text", "text": content}]
        if not isinstance(content, list):
            continue
        ts = entry.get("timestamp")
        for item in content:
            if not isinstance(item, dict):
                continue
            summary = _summarize_content_item(item)
            if not summary:
                continue
            kind, text = summary
            out.append({"ts": ts, "role": role, "kind": kind, "text": text})

    return out[-max_lines:]


def build_activity():
    projects = _load_registry_projects()
    now = datetime.now(timezone.utc)

    sessions_out = []
    seen_ids = set()  # varios ~/.claude/sessions/<pid>.json pueden compartir sessionId (ej. la
    # ventana se reabrió y quedó un pid huérfano apuntando al mismo id) -- una entrada por sesión.
    for sess in _list_session_files():
        session_id = sess.get("sessionId")
        if not session_id or session_id in seen_ids:
            continue
        seen_ids.add(session_id)
        transcript = _find_transcript(session_id)
        if not transcript:
            continue
        try:
            mtime = datetime.fromtimestamp(os.path.getmtime(transcript), tz=timezone.utc)
        except OSError:
            continue
        age_s = (now - mtime).total_seconds()
        if age_s > RECENT_WINDOW_S:
            continue  # transcript viejo: sesión huérfana o cerrada hace rato, se ignora

        cwd = sess.get("cwd")
        sessions_out.append({
            "session_id": session_id,
            "name": sess.get("name"),
            "cwd": cwd,
            "project": _project_for_path(cwd, projects),
            "kind": sess.get("kind"),
            "entrypoint": sess.get("entrypoint"),
            "started_at": sess.get("startedAt"),
            "age_s": round(age_s, 1),
            "live": age_s <= LIVE_WINDOW_S,
            "lines": _tail_transcript(transcript, MAX_LINES),
        })

    sessions_out.sort(key=lambda s: s["age_s"])
    active = any(s["live"] for s in sessions_out)
    return {
        "ok": True,
        "active": active,
        "generated_at": now.isoformat(),
        "sessions": sessions_out,
    }


if __name__ == "__main__":
    print(json.dumps(build_activity(), ensure_ascii=False, indent=2))
