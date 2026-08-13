#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- empaqueta el espejo público.

Ya NO inyecta un snapshot congelado: el Worker público (_worker.js) sirve /api/snapshot
en vivo, sincronizando contra GitHub/Asana por su cuenta (ver _worker.js). Este script
solo arma dist/ con el CÓDIGO -- index.html tal cual, _worker.js, robots.txt -- para
deployarlo. Los datos ya no dependen de correr esto: dependen de pegarle a /api/sync,
que no necesita el disco local de nadie ni una sesión de Claude corriendo.

    python publish.py          -> escribe dist/
    python publish.py --deploy -> además imprime el comando de wrangler (no lo corre)

El deploy a Cloudflare NO se hace desde acá a propósito: publicar hacia afuera es
decisión de Roi. Se corre desde studio/modo-god/ (wrangler.toml propio de este proyecto,
con el binding de KV) -- NO desde la raíz del repo, ese wrangler.toml es del sitio.
"""

import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, "dist")
WORKER_SRC = os.path.join(HERE, "_worker.js")

DEPLOY_CMD = "npx wrangler pages deploy dist --project-name modo-god"


def main():
    os.makedirs(DIST, exist_ok=True)

    shutil.copyfile(os.path.join(HERE, "index.html"), os.path.join(DIST, "index.html"))

    with open(os.path.join(DIST, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nDisallow: /\n")

    # _worker.js pone el sitio en Pages "Advanced Mode": intercepta TODO antes de env.ASSETS.fetch.
    # Hace el auth (Basic Auth propio) Y el sync remoto (/api/sync, /api/snapshot). Sin esto el
    # bundle sale público y sin datos.
    if os.path.isfile(WORKER_SRC):
        shutil.copyfile(WORKER_SRC, os.path.join(DIST, "_worker.js"))
        worker_note = "_worker.js copiado -- auth + sync remoto activos."
    else:
        worker_note = "‼ _worker.js NO encontrado -- el bundle saldría SIN auth y SIN datos."

    kb = os.path.getsize(os.path.join(DIST, "index.html")) / 1024
    print("dist/ escrito -- index.html {:.1f} KB (sin snapshot embebido)".format(kb))
    print(worker_note)
    if "--deploy" in sys.argv:
        print("\nDesde studio/modo-god/, con `npx wrangler login` hecho:\n  " + DEPLOY_CMD)


if __name__ == "__main__":
    main()
