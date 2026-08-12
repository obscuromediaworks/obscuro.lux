#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- consola local.

Sirve el tablero en http://localhost:5080 y recolecta el estado de git EN VIVO:
cada carga de /api/snapshot vuelve a interrogar los repos. La versión publicada en
obscuromediaworks.com.ar/modo-god lee un snapshot.json congelado; ésta no.

    python modo-god.py            -> levanta en 5080 y abre el navegador
    python modo-god.py --port 90  -> otro puerto
    python modo-god.py --no-open  -> no abre el navegador
"""

import json
import os
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import collect

HERE = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    def do_GET(self):
        if self.path.split("?")[0].rstrip("/") in ("/api/snapshot", "api/snapshot"):
            return self.serve_snapshot()
        return super().do_GET()

    def serve_snapshot(self):
        try:
            body = json.dumps(collect.build_snapshot(), ensure_ascii=False).encode("utf-8")
            code = 200
        except Exception as e:  # el tablero no se cae por un repo roto
            body = json.dumps({"error": str(e)}, ensure_ascii=False).encode("utf-8")
            code = 500
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # SimpleHTTPRequestHandler manda text/html SIN charset y rompe los acentos
        if self.path.endswith(".html") or self.path.rstrip("/") == "":
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        t = super().guess_type(path)
        if t == "text/html":
            return "text/html; charset=utf-8"
        return t

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""):
            return
        super().log_message(fmt, *args)


def main():
    port = 5080
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])
    url = "http://localhost:{}/".format(port)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("Modo God en " + url + "   (Ctrl+C para cortar)")
    if "--no-open" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nchau")


if __name__ == "__main__":
    main()
