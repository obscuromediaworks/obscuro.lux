#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- generador del espejo público.

Toma el estado actual y escribe dist/index.html: UN solo archivo con el snapshot
inlineado. Sin fetch, sin JSON suelto, sin posibilidad de que la página y los datos
queden desincronizados.

    python publish.py          -> escribe dist/index.html
    python publish.py --deploy -> además imprime el comando de wrangler (no lo corre)

El deploy a Cloudflare NO se hace desde acá a propósito: publicar hacia afuera es
decisión de Roi, y wrangler necesita un login OAuth que caduca cada ~24 h.
"""

import json
import os
import sys

import collect

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, "dist")

DEPLOY_CMD = (
    'npx wrangler pages deploy studio/modo-god/dist '
    '--project-name modo-god --branch main --commit-dirty=true'
)


def main():
    with open(os.path.join(HERE, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()

    snap = collect.build_snapshot()
    snap["published"] = True
    payload = json.dumps(snap, ensure_ascii=False).replace("</", "<\\/")
    inject = '<script>window.__SNAPSHOT__ = {};</script>\n'.format(payload)

    if "</head>" not in html:
        sys.exit("index.html no tiene </head>; no sé dónde inyectar el snapshot")
    html = html.replace("</head>", inject + "</head>", 1)

    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    # Cloudflare Access es la protección real; esto es solo higiene de crawlers.
    with open(os.path.join(DIST, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nDisallow: /\n")

    kb = os.path.getsize(out) / 1024
    print("dist/index.html escrito -- {:.1f} KB, {} proyectos".format(kb, len(snap["projects"])))
    print("\nEste bundle expone rutas locales, fechas de lanzamiento y nombres de tareas.")
    print("NO lo publiques sin Cloudflare Access adelante.")
    if "--deploy" in sys.argv:
        print("\nDesde G:\\Github\\obscuro.lux, con `npx wrangler login` hecho:\n  " + DEPLOY_CMD)


if __name__ == "__main__":
    main()
