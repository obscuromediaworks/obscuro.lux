#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- disparo real de posteo en redes.

Foco de esta pasada (13/8/2026, pedido explícito de Roi): Discord y YouTube lo más completo
posible. X/TikTok quedan en modo asistido (copiar texto + abrir la página de compose, sin API) --
ver `publish_board.py`. Reddit queda AFUERA de esta pasada por decisión explícita de Roi (no
invertir tiempo ahí todavía).

Solo stdlib (`urllib`), sin dependencias nuevas -- mismo criterio que el resto de Modo God
(`collect.py`, `qa_board.py`): nada de pip install para levantar la consola local.

Las credenciales NUNCA viven acá ni en el repo -- se leen de `publish-credentials.json`
(gitignoreado). Ver `publish-credentials.example.json` para el formato.
"""

import json
import mimetypes
import os
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_PATH = os.path.join(HERE, "publish-credentials.json")

DISCORD_WEBHOOK_PREFIXES = ("https://discord.com/api/webhooks/", "https://discordapp.com/api/webhooks/")

YT_DEVICE_CODE_URL = "https://oauth2.googleapis.com/device/code"
YT_TOKEN_URL = "https://oauth2.googleapis.com/token"
YT_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
YT_SCOPE = "https://www.googleapis.com/auth/youtube.upload"


# ── Credenciales ─────────────────────────────────────────────────────────────

def load_credentials():
    """Lee publish-credentials.json. {} si no existe todavía -- cada caller reporta qué falta,
    no revienta acá con un traceback críptico."""
    if not os.path.isfile(CREDENTIALS_PATH):
        return {}
    with open(CREDENTIALS_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_credentials(doc):
    tmp = CREDENTIALS_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, CREDENTIALS_PATH)


def _looks_like_placeholder(value):
    return not value or not str(value).strip() or str(value).upper().startswith("REPLACE_ME")


# ── Discord (webhook, sin OAuth) ─────────────────────────────────────────────

def _form_data_multipart(fields, files):
    """multipart/form-data clásico -- lo que espera el endpoint de webhooks de Discord cuando
    va un archivo adjunto junto al JSON (`payload_json` + `file[0]`)."""
    boundary = uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(
            ('--{}\r\nContent-Disposition: form-data; name="{}"\r\n\r\n{}\r\n'
             .format(boundary, name, value)).encode("utf-8")
        )
    for name, (filename, data, content_type) in files.items():
        parts.append(
            ('--{}\r\nContent-Disposition: form-data; name="{}"; filename="{}"\r\n'
             'Content-Type: {}\r\n\r\n'.format(boundary, name, filename, content_type)).encode("utf-8")
            + data + b"\r\n"
        )
    parts.append(("--{}--\r\n".format(boundary)).encode("utf-8"))
    return b"".join(parts), boundary


def post_discord(webhook_url, content, file_path=None, username=None, timeout=25):
    """POST directo al webhook -- sin OAuth, sin costo. `?wait=true` para que Discord devuelva el
    mensaje creado (message_id), así queda algo verificable en publish-queue.json en vez de un
    204 vacío."""
    if _looks_like_placeholder(webhook_url):
        return {"ok": False, "error": "falta discord.webhook_url en publish-credentials.json"}
    if not any(webhook_url.startswith(p) for p in DISCORD_WEBHOOK_PREFIXES):
        return {"ok": False, "error": "webhook_url no tiene forma de webhook de Discord (esperado " + DISCORD_WEBHOOK_PREFIXES[0] + "...)"}
    if not content and not file_path:
        return {"ok": False, "error": "nada para postear: falta texto y archivo"}

    url = webhook_url + ("&" if "?" in webhook_url else "?") + "wait=true"
    payload = {}
    if content:
        payload["content"] = content
    if username:
        payload["username"] = username

    try:
        if file_path:
            if not os.path.isfile(file_path):
                return {"ok": False, "error": "no existe el archivo: " + file_path}
            with open(file_path, "rb") as f:
                data = f.read()
            filename = os.path.basename(file_path)
            content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
            body, boundary = _form_data_multipart(
                {"payload_json": json.dumps(payload, ensure_ascii=False)},
                {"file[0]": (filename, data, content_type)},
            )
            req = urllib.request.Request(url, data=body, method="POST")
            req.add_header("Content-Type", "multipart/form-data; boundary=" + boundary)
        else:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            req = urllib.request.Request(url, data=body, method="POST")
            req.add_header("Content-Type", "application/json")

        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", "replace")
            message = json.loads(raw) if raw.strip() else {}
            return {
                "ok": True,
                "status": resp.status,
                "message_id": message.get("id"),
                "channel_id": message.get("channel_id"),
            }
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        return {"ok": False, "error": "HTTP {}: {}".format(e.code, detail)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ── YouTube Data API v3 (OAuth device/installed-app flow) ───────────────────

def youtube_device_auth_start(client_id, timeout=20):
    """Paso 1 del device flow (RFC 8628 / "TV and Limited Input" de Google): pide un
    device_code + user_code. El usuario confirma en verification_url desde CUALQUIER navegador
    (no hace falta un redirect local ni un puerto abierto -- por eso es el flujo indicado para
    algo que corre en un server local sin UI propia de callback)."""
    data = urllib.parse.urlencode({"client_id": client_id, "scope": YT_SCOPE}).encode("utf-8")
    req = urllib.request.Request(YT_DEVICE_CODE_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def youtube_device_auth_poll(client_id, client_secret, device_code, timeout=20):
    """Paso 2: un solo intento de poll contra el token endpoint. Devuelve el JSON crudo de
    Google -- incluye `error: "authorization_pending"` mientras el usuario no confirmó todavía,
    eso lo maneja el caller (youtube_oauth_setup.py) reintentando cada `interval` segundos."""
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "device_code": device_code,
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
    }).encode("utf-8")
    req = urllib.request.Request(YT_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode("utf-8"))


def youtube_refresh_access_token(client_id, client_secret, refresh_token, timeout=20):
    """El refresh_token no expira (salvo revocación) -- esto es lo que corre en cada disparo real,
    no el device flow completo (eso es un paso único que hace Roi con youtube_oauth_setup.py)."""
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }).encode("utf-8")
    req = urllib.request.Request(YT_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError("no pude refrescar el token de YouTube: HTTP {}: {}".format(
            e.code, e.read().decode("utf-8", "replace")))
    token = body.get("access_token")
    if not token:
        raise RuntimeError("Google no devolvió access_token: " + json.dumps(body, ensure_ascii=False))
    return token


def gif_to_mp4(gif_path, out_path=None, timeout=120):
    """YouTube no acepta .gif como contenedor de video -- lo convierte con ffmpeg (ya está
    instalado en esta máquina, ver `ffmpeg -version`). Mudo, resolución par (requisito de h264),
    yuv420p para máxima compatibilidad. No se llama sola -- youtube_upload_video()/publish_board.fire()
    la invocan solo cuando el media_path del item termina en .gif."""
    if out_path is None:
        out_path = os.path.splitext(gif_path)[0] + ".mp4"
    cmd = [
        "ffmpeg", "-y", "-i", gif_path,
        "-movflags", "faststart",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        out_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except FileNotFoundError:
        raise RuntimeError("ffmpeg no está en el PATH -- no se puede convertir " + gif_path)
    except subprocess.TimeoutExpired:
        raise RuntimeError("ffmpeg tardó más de {}s convirtiendo {}".format(timeout, gif_path))
    if result.returncode != 0 or not os.path.isfile(out_path):
        raise RuntimeError("ffmpeg falló convirtiendo {}: {}".format(gif_path, result.stderr[-800:]))
    return out_path


def _related_multipart(parts, timeout_note=None):
    """multipart/related -- el formato que pide `videos.insert` de Google (metadata JSON + bytes
    del video, sin Content-Disposition, solo Content-Type por parte). Distinto del form-data de
    Discord a propósito: son dos APIs con dos convenciones de multipart distintas."""
    boundary = uuid.uuid4().hex
    chunks = []
    for content_type, content in parts:
        chunks.append(("--{}\r\nContent-Type: {}\r\n\r\n".format(boundary, content_type)).encode("utf-8"))
        chunks.append(content.encode("utf-8") if isinstance(content, str) else content)
        chunks.append(b"\r\n")
    chunks.append(("--{}--\r\n".format(boundary)).encode("utf-8"))
    return b"".join(chunks), boundary


def youtube_upload_video(access_token, file_path, title, description, tags=None,
                          privacy_status="unlisted", category_id="20", timeout=600):
    """`videos.insert` vía multipart simple (no resumable) -- alcanza de sobra para Shorts
    (bien por debajo del límite de ~un par de minutos que soporta un POST simple antes de que
    convenga el protocolo resumable). category_id 20 = Gaming.

    SIN VERIFICAR contra la API real todavía -- no hay client_id/client_secret/refresh_token
    cargados (Roi no corrió youtube_oauth_setup.py). El código sigue la doc oficial de Google
    (Content-Type multipart/related, snippet+status en la parte JSON) pero falta la prueba end
    to end contra una cuenta real."""
    if file_path.lower().endswith(".gif"):
        raise ValueError("YouTube no acepta .gif -- convertir con gif_to_mp4() antes de llamar esto")
    if not os.path.isfile(file_path):
        return {"ok": False, "error": "no existe el archivo de video: " + file_path}

    snippet = {"title": (title or "")[:100], "description": description or ""}
    if tags:
        snippet["tags"] = tags
    if category_id:
        snippet["categoryId"] = category_id
    metadata = {
        "snippet": snippet,
        "status": {"privacyStatus": privacy_status, "selfDeclaredMadeForKids": False},
    }
    with open(file_path, "rb") as f:
        video_bytes = f.read()
    content_type = mimetypes.guess_type(file_path)[0] or "video/mp4"

    body, boundary = _related_multipart([
        ("application/json; charset=UTF-8", json.dumps(metadata, ensure_ascii=False)),
        (content_type, video_bytes),
    ])

    url = YT_UPLOAD_URL + "?uploadType=multipart&part=snippet,status"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", "Bearer " + access_token)
    req.add_header("Content-Type", "multipart/related; boundary=" + boundary)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": "HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace"))}
    except Exception as e:
        return {"ok": False, "error": str(e)}

    vid = data.get("id")
    return {
        "ok": bool(vid),
        "video_id": vid,
        "url": ("https://youtube.com/shorts/" + vid) if vid else None,
        "error": None if vid else "Google no devolvió id de video: " + json.dumps(data, ensure_ascii=False),
    }
