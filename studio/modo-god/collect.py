#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- recolector de estado del estudio.

Lee studio/registry.json, interroga a git en cada repo y escribe un snapshot JSON.
No toca la red: no hace fetch, no llama a Asana. Lo de Asana entra por asana-cache.json,
que escribe un agente de Claude (el conector de Asana es MCP, no HTTP).

    python collect.py                 -> escribe snapshot.json
    python collect.py --stdout        -> lo imprime y no escribe nada
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(HERE)
REGISTRY = os.path.join(STUDIO, "registry.json")
SNAPSHOT = os.path.join(HERE, "snapshot.json")
ASANA_CACHE = os.path.join(HERE, "asana-cache.json")


def git(repo, *args):
    """Corre git en repo y devuelve stdout limpio, o None si falla."""
    try:
        out = subprocess.run(
            ["git", "-C", repo] + list(args),
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if out.returncode != 0:
        return None
    return out.stdout.strip()


def repo_state(path):
    """Estado de git de un repo. Sin red: ahead/behind es contra el remote-tracking local."""
    if not os.path.isdir(path):
        return {"ok": False, "error": "no existe el directorio"}
    if git(path, "rev-parse", "--git-dir") is None:
        return {"ok": False, "error": "no es un repo git"}

    state = {"ok": True}
    state["branch"] = git(path, "rev-parse", "--abbrev-ref", "HEAD") or "?"

    porcelain = git(path, "status", "--porcelain") or ""
    lines = [l for l in porcelain.splitlines() if l.strip()]
    state["dirty"] = len([l for l in lines if not l.startswith("??")])
    state["untracked"] = len([l for l in lines if l.startswith("??")])

    # ahead/behind contra el upstream configurado, si lo hay
    state["ahead"] = state["behind"] = None
    upstream = git(path, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
    if upstream:
        state["upstream"] = upstream
        counts = git(path, "rev-list", "--left-right", "--count", "@{u}...HEAD")
        if counts:
            try:
                behind, ahead = counts.split()
                state["behind"], state["ahead"] = int(behind), int(ahead)
            except ValueError:
                pass
    else:
        state["upstream"] = None

    last = git(path, "log", "-1", "--format=%h%x1f%s%x1f%an%x1f%aI")
    if last and "\x1f" in last:
        h, subject, author, iso = last.split("\x1f")
        state["last_commit"] = {"hash": h, "subject": subject, "author": author, "date": iso}
    else:
        state["last_commit"] = None

    # cuántos commits en los últimos 7 y 30 días -- pulso del proyecto
    for label, since in (("commits_7d", "7 days ago"), ("commits_30d", "30 days ago")):
        c = git(path, "rev-list", "--count", "--since=" + since, "HEAD")
        state[label] = int(c) if c and c.isdigit() else None

    branches = git(path, "for-each-ref", "--format=%(refname:short)", "refs/heads")
    state["branches"] = branches.splitlines() if branches else []

    return state


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def build_snapshot():
    registry = load_json(REGISTRY)
    if registry is None:
        sys.exit("No pude leer " + REGISTRY)

    asana = load_json(ASANA_CACHE) or {}
    asana_by_slug = asana.get("projects", {})

    projects = []
    for p in registry.get("projects", []):
        entry = {k: p.get(k) for k in (
            "slug", "name", "kind", "status", "priority", "repo", "repo_path",
            "main_branch", "asana_project_gid", "asana_project_name", "trigger",
            "engine", "ships_on", "public_url", "socials", "roles",
        )}
        entry["git"] = repo_state(p["repo_path"])
        entry["asana"] = asana_by_slug.get(p["slug"])
        projects.append(entry)

    projects.sort(key=lambda e: e.get("priority") or 999)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_on": os.environ.get("COMPUTERNAME") or os.uname().nodename,
        "studio": registry.get("studio", {}),
        "roles": registry.get("roles", []),
        "projects": projects,
        "unclassified_repos": registry.get("unclassified_repos", []),
        "unclassified_asana": registry.get("unclassified_asana", []),
        "asana_cache": {
            "present": bool(asana),
            "generated_at": asana.get("generated_at"),
            "note": asana.get("note"),
        },
    }


def main():
    snap = build_snapshot()
    text = json.dumps(snap, indent=2, ensure_ascii=False)
    if "--stdout" in sys.argv:
        print(text)
        return
    with open(SNAPSHOT, "w", encoding="utf-8") as f:
        f.write(text + "\n")
    ok = sum(1 for p in snap["projects"] if p["git"].get("ok"))
    print("snapshot.json escrito -- {} proyectos, {} con git legible".format(
        len(snap["projects"]), ok))


if __name__ == "__main__":
    main()
