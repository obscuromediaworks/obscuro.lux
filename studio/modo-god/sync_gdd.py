#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- sincronizador de GDDs.

Copia el GDD canónico de cada proyecto (el path "gdd" en registry.json, dentro
de SU repo) a studio/modo-god/gdd/<slug>.html, para que el tablero los pueda
mostrar sin ir repo por repo. Los .html ya son documentos self-contained y se
copian tal cual; los .md se envuelven en una página con el tema visual de
Modo God, porque no hay renderer de markdown instalado (el estudio evita
dependencias en esta carpeta).

No es en vivo: correr esto de nuevo cuando un GDD cambie. collect.py solo lee
lo que haya en gdd/, no toca los repos.

    python sync_gdd.py
"""

import html
import json
import os
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(HERE)
REGISTRY = os.path.join(STUDIO, "registry.json")
GDD_DIR = os.path.join(HERE, "gdd")

MD_TEMPLATE = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — GDD</title>
<style>
  :root{{
    --ink-900:#070504; --ink-700:#0f0f0f; --cream:#f5e9d4; --gold:#c9a96e;
    --line:rgba(201,169,110,.18); --font-mono:"JetBrains Mono",ui-monospace,monospace;
    --font-sans:"Space Grotesk","Helvetica Neue",Arial,sans-serif;
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ink-900);color:var(--cream);font-family:var(--font-sans);
       font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:860px;margin:0 auto;padding:32px 24px 80px}}
  .badge{{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
         color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:24px;display:block}}
  pre{{white-space:pre-wrap;word-wrap:break-word;font-family:var(--font-mono);font-size:13px;
      line-height:1.7;color:var(--cream);margin:0}}
</style>
</head>
<body>
<div class="wrap">
  <span class="badge">{title} · notas de diseño (fuente: {source_rel})</span>
  <pre>{body}</pre>
</div>
</body>
</html>
"""


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def sync_one(project):
    slug = project["slug"]
    gdd_rel = project.get("gdd")
    if not gdd_rel:
        return None

    src = os.path.join(project["repo_path"], gdd_rel.replace("/", os.sep))
    if not os.path.isfile(src):
        print("  [{}] FALTA: {} no existe".format(slug, src))
        return {"slug": slug, "ok": False}

    dest = os.path.join(GDD_DIR, slug + ".html")
    ext = os.path.splitext(src)[1].lower()

    if ext == ".html":
        with open(src, "r", encoding="utf-8") as f:
            content = f.read()
    elif ext == ".md":
        with open(src, "r", encoding="utf-8") as f:
            raw = f.read()
        content = MD_TEMPLATE.format(
            title=html.escape(project["name"]),
            source_rel=html.escape(gdd_rel),
            body=html.escape(raw),
        )
    else:
        print("  [{}] formato no soportado: {}".format(slug, ext))
        return {"slug": slug, "ok": False}

    with open(dest, "w", encoding="utf-8") as f:
        f.write(content)

    kb = os.path.getsize(dest) / 1024
    print("  [{}] {} -> gdd/{}.html ({:.1f} KB)".format(slug, gdd_rel, slug, kb))
    return {"slug": slug, "ok": True, "kb": kb}


def main():
    registry = load_json(REGISTRY)
    os.makedirs(GDD_DIR, exist_ok=True)

    print("Sincronizando GDDs...")
    results = [sync_one(p) for p in registry.get("projects", [])]
    results = [r for r in results if r is not None]

    ok = sum(1 for r in results if r["ok"])
    print("\n{} de {} sincronizados. {}".format(
        ok, len(results), datetime.now(timezone.utc).isoformat()))
    if ok < len(results):
        sys.exit(1)


if __name__ == "__main__":
    main()
