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
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import collect

HERE = os.path.dirname(os.path.abspath(__file__))
DECISIONS_PATH = os.path.join(HERE, "decisions.json")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    def do_GET(self):
        if self.path.split("?")[0].rstrip("/") in ("/api/snapshot", "api/snapshot"):
            return self.serve_snapshot()
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0].rstrip("/") in ("/api/decide", "api/decide"):
            return self.handle_decide()
        self.send_response(404)
        self.end_headers()

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

    def handle_decide(self):
        # Único endpoint que escribe: guarda la elección de Roi en decisions.json.
        # Solo existe en la consola local -- el espejo publicado es estático y no lo tiene.
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            decision_id = payload.get("id")
            option_index = payload.get("option_index")
            note = (payload.get("note") or "").strip() or None
            if not decision_id:
                raise ValueError("falta id")

            with open(DECISIONS_PATH, "r", encoding="utf-8") as f:
                doc = json.load(f)

            entry = next((d for d in doc.get("decisions", []) if d.get("id") == decision_id), None)
            if entry is None:
                raise ValueError("no existe la decisión: " + str(decision_id))

            chosen = {}
            if isinstance(option_index, int):
                opts = entry.get("options") or []
                if not (0 <= option_index < len(opts)):
                    raise ValueError("option_index fuera de rango")
                chosen["option_index"] = option_index
                chosen["label"] = opts[option_index]["label"]
            if note:
                chosen["note"] = note
            if not chosen:
                raise ValueError("falta option_index o note")

            entry["status"] = "decided"
            entry["decided_at"] = datetime.now(timezone.utc).isoformat()
            entry["decision"] = chosen

            with open(DECISIONS_PATH, "w", encoding="utf-8") as f:
                json.dump(doc, f, ensure_ascii=False, indent=2)
                f.write("\n")

            body = json.dumps({"ok": True}, ensure_ascii=False).encode("utf-8")
            code = 200
        except Exception as e:
            body = json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False).encode("utf-8")
            code = 400

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
