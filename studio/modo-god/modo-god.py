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
import socket
import sys
import webbrowser
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

import collect
import qa_board

HERE = os.path.dirname(os.path.abspath(__file__))
DECISIONS_PATH = os.path.join(HERE, "decisions.json")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")
        if path in ("/api/snapshot", "api/snapshot"):
            return self.serve_snapshot()
        if path in ("/qa", "qa"):
            return self.serve_qa()
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")
        if path in ("/api/decide", "api/decide"):
            return self.handle_decide()
        if path in ("/api/qa/mark", "api/qa/mark"):
            return self.handle_qa_mark()
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

    def qa_query(self):
        return parse_qs(urlsplit(self.path).query)

    def send_html(self, body, code=200):
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def serve_qa(self):
        # Tablero de QA embebido -- ex-tablero standalone (`~/.claude/skills/qa/qa-board.py`),
        # ver qa_board.py. Solo existe en la consola LOCAL: el Worker público no tiene esta ruta.
        q = self.qa_query()
        slug = (q.get("project") or [None])[0]
        if not slug:
            return self.send_html(qa_board.render_picker_page())

        repo, name = qa_board.resolve_project(slug)
        if not repo:
            return self.send_html(
                qa_board.not_found_page("No encontré el proyecto '" + slug + "' en registry.json."),
                404)
        try:
            spec = qa_board.load_spec(repo)
        except qa_board.SpecNotFound as e:
            return self.send_html(
                qa_board.not_found_page(
                    "No hay lista de items en " + str(e) +
                    " -- crearla antes de abrir el tablero (ver el skill qa)."),
                404)

        build = (q.get("build") or [None])[0] or spec.get("build") or qa_board.short_head(repo)
        mark_url = "api/qa/mark?project={}&build={}".format(slug, build)
        html = qa_board.render_board_page(name, repo, spec, build, mark_url)
        return self.send_html(html)

    def handle_qa_mark(self):
        q = self.qa_query()
        slug = (q.get("project") or [None])[0]
        build = (q.get("build") or [None])[0]
        try:
            if not slug or not build:
                raise ValueError("falta project o build en la query string")
            repo, _name = qa_board.resolve_project(slug)
            if not repo:
                raise ValueError("no existe el proyecto: " + str(slug))
            spec = qa_board.load_spec(repo)
            board = qa_board.get_board(repo, spec, build)

            length = int(self.headers.get("Content-Length", 0) or 0)
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            board.mark(payload["id"], payload.get("verdict"), payload.get("note", ""))
        except Exception as e:
            body = str(e).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

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
        # Bug preexistente (no de esta migración): log_error() llama a este mismo método con
        # args[0] = un código HTTPStatus, no un string -- "in" sobre eso tira TypeError y mata
        # el thread del request. Ahora que /qa devuelve 404 seguido (slug que no existe, o
        # items.json faltante), pasaba más. str() lo hace seguro para los dos casos.
        first = str(args[0]) if args else ""
        if "/api/" in first:
            return
        super().log_message(fmt, *args)


def already_running(port):
    # http.server.HTTPServer trae allow_reuse_address=1: en Windows eso deja bindear un puerto
    # que YA está escuchando (a diferencia de Linux, donde tiraría OSError) -- así que un bind
    # exitoso no alcanza para saber si hay otra instancia. Un connect TCP crudo sí lo confirma
    # (nada de HTTP: /api/snapshot recorre git en TODOS los repos y puede tardar bastante más que
    # un timeout corto, dando falsos negativos).
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False


def main():
    port = 5080
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])
    url = "http://localhost:{}/".format(port)

    if already_running(port):
        # Ya hay una instancia corriendo (ej. se abrió el acceso directo dos veces) -- no hace
        # falta una segunda, solo abrir el navegador a la que ya está.
        print("Modo God ya está corriendo en " + url + "  -- abriendo el navegador ahí.")
        if "--no-open" not in sys.argv:
            webbrowser.open(url)
        return

    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    except OSError as e:
        print("No pude levantar el puerto {}: {}".format(port, e))
        return
    print("Modo God en " + url + "   (Ctrl+C para cortar)")
    if "--no-open" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nchau")


if __name__ == "__main__":
    main()
