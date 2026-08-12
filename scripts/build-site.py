#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arma site-dist/: lo que se sube a Cloudflare Pages.

    site-dist/
      index.html            el sitio (deploy/index.html, self-contained)
      favicon-*, assets/    resto del bundle del sitio
      modo-god/index.html   el tablero, con su snapshot inlineado
      robots.txt  _headers  higiene: /modo-god fuera de los buscadores

Un solo proyecto de Pages sirve las dos cosas, y por eso el tablero queda en
obscuromediaworks.com.ar/modo-god sin necesidad de un Worker que proxee la ruta.

    python scripts/build-site.py

⚠️ /modo-god NO se protege desde acá. Lo protege Cloudflare Access, y es un paso
manual en el dashboard. Sin eso, el tablero es público para quien adivine la URL.
"""

import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_SITE = os.path.join(ROOT, "deploy")
MODO_GOD = os.path.join(ROOT, "studio", "modo-god")
OUT = os.path.join(ROOT, "site-dist")

ROBOTS = """User-agent: *
Disallow: /modo-god
"""

# Pages aplica estos headers por ruta. El noindex es para los buscadores;
# el control de acceso real es Cloudflare Access.
HEADERS = """/modo-god/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
  X-Frame-Options: DENY

/*
  X-Content-Type-Options: nosniff
"""


def main():
    if not os.path.isdir(SRC_SITE):
        sys.exit("No existe deploy/ -- no hay sitio que subir")

    # 1. Regenerar el bundle del tablero para que el snapshot sea de ahora
    print("-> generando el bundle de Modo God...")
    r = subprocess.run([sys.executable, "publish.py"], cwd=MODO_GOD)
    if r.returncode != 0:
        sys.exit("publish.py falló; corto acá para no subir un tablero viejo")

    # 2. Sitio
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(SRC_SITE, OUT)

    # 3. Tablero adentro, en /modo-god
    dst = os.path.join(OUT, "modo-god")
    os.makedirs(dst, exist_ok=True)
    shutil.copy2(os.path.join(MODO_GOD, "dist", "index.html"), os.path.join(dst, "index.html"))

    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(ROBOTS)
    with open(os.path.join(OUT, "_headers"), "w", encoding="utf-8") as f:
        f.write(HEADERS)

    n = sum(len(fs) for _, _, fs in os.walk(OUT))
    mb = sum(
        os.path.getsize(os.path.join(d, f))
        for d, _, fs in os.walk(OUT) for f in fs
    ) / (1024 * 1024)
    print("\nsite-dist/ listo -- {} archivos, {:.1f} MB".format(n, mb))
    print("  /            el sitio")
    print("  /modo-god    el tablero  <-- protegelo con Cloudflare Access")


if __name__ == "__main__":
    main()
