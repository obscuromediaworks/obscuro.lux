#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- disparo real de posteo en redes.

Estado (14/8/2026): Discord, YouTube y X disparan de verdad. TikTok también llama a la API real
(Content Posting API), pero con una salvedad que no es cosmética: hasta que TikTok apruebe la
revisión de la app, todo lo que suba queda forzado a `privacy_level=SELF_ONLY` (solo lo ve la
cuenta que autorizó) -- lo impone TikTok del lado del servidor, no hay flag que lo evite. Ver
`README.md` y `tiktok_oauth_setup.py` para el detalle completo. Reddit queda AFUERA de esta pasada
por decisión explícita de Roi (no invertir tiempo ahí todavía).

Solo stdlib (`urllib`), sin dependencias nuevas -- mismo criterio que el resto de Modo God
(`collect.py`, `qa_board.py`): nada de pip install para levantar la consola local.

Las credenciales NUNCA viven acá ni en el repo -- se leen de `publish-credentials.json`
(gitignoreado). Ver `publish-credentials.example.json` para el formato.
"""

import base64
import hashlib
import http.server
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

X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize"
X_TOKEN_URL = "https://api.x.com/2/oauth2/token"
X_TWEETS_URL = "https://api.x.com/2/tweets"
X_SCOPE = "tweet.read tweet.write users.read offline.access"

TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/"
TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
TIKTOK_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/"
TIKTOK_STATUS_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/"
TIKTOK_SCOPE = "video.publish"


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


# ── Callback local de OAuth (X, TikTok -- authorization code flow) ──────────
# YouTube usa device flow (sin redirect, ver youtube_device_auth_start más abajo). X y TikTok son
# authorization code flow clásico: necesitan un redirect_uri que reciba el `code` de vuelta. Un
# server HTTP mínimo, para UN solo request, vive acá porque lo comparten x_oauth_setup.py y
# tiktok_oauth_setup.py -- no tiene sentido duplicarlo.

def pkce_pair():
    """PKCE (RFC 7636): code_verifier al azar + code_challenge = SHA256(code_verifier) en
    base64url sin padding. Tanto X como TikTok piden method S256, no 'plain'."""
    verifier = base64.urlsafe_b64encode(os.urandom(40)).rstrip(b"=").decode("ascii")
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("ascii")).digest()).rstrip(b"=").decode("ascii")
    return verifier, challenge


def random_state(n_bytes=16):
    return base64.urlsafe_b64encode(os.urandom(n_bytes)).rstrip(b"=").decode("ascii")


def _add_basic_auth(req, user, password):
    token = base64.b64encode("{}:{}".format(user, password).encode("utf-8")).decode("ascii")
    req.add_header("Authorization", "Basic " + token)


def wait_for_oauth_redirect(port, path="/oauth/callback", timeout=300):
    """Levanta un HTTPServer en 127.0.0.1:<port>, atiende UN solo GET a `path` y devuelve sus
    query params como dict plano (último valor si hay repetidos). Sirve una página HTML mínima de
    vuelta para que el navegador no quede colgado con un error de conexión -- nadie más la ve."""
    result = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path != path:
                self.send_response(404)
                self.end_headers()
                return
            result.update(urllib.parse.parse_qs(parsed.query))
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                "<html><body style='font-family:sans-serif;padding:2rem'>"
                "Listo, ya podés cerrar esta pestaña y volver a la terminal."
                "</body></html>".encode("utf-8")
            )

        def log_message(self, fmt, *args):
            pass  # silencioso -- el script que llama a esto imprime su propio progreso

    server = http.server.HTTPServer(("127.0.0.1", port), Handler)
    server.timeout = timeout
    server.handle_request()  # bloquea hasta el primer (y único) request, o hasta el timeout
    server.server_close()
    return {k: v[0] for k, v in result.items()}


# ── X (ex-Twitter) API v2 -- OAuth 2.0 Authorization Code + PKCE ─────────────

def x_build_authorize_url(client_id, redirect_uri, state, code_challenge):
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": X_SCOPE,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    return X_AUTHORIZE_URL + "?" + urllib.parse.urlencode(params)


def x_exchange_code(client_id, client_secret, code, redirect_uri, code_verifier, timeout=20):
    """Canjea el authorization code por access_token + refresh_token (scope offline.access).
    X trata la app como 'confidential client' (tiene client_secret): exige HTTP Basic Auth con
    client_id:client_secret ADEMÁS de mandar client_id en el body -- las dos cosas, según la doc."""
    data = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "code_verifier": code_verifier,
        "client_id": client_id,
    }).encode("utf-8")
    req = urllib.request.Request(X_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    _add_basic_auth(req, client_id, client_secret)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"error": "HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace"))}


def x_refresh_access_token(client_id, client_secret, refresh_token, timeout=20):
    """A diferencia de Google, X ROTA el refresh_token en cada uso -- devuelve (access_token,
    refresh_token_nuevo_o_None). El caller (publish_board._fire_x) tiene que persistir el nuevo
    refresh_token o el próximo refresh va a fallar con 'invalid_grant'."""
    data = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": client_id,
    }).encode("utf-8")
    req = urllib.request.Request(X_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    _add_basic_auth(req, client_id, client_secret)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError("no pude refrescar el token de X: HTTP {}: {}".format(
            e.code, e.read().decode("utf-8", "replace")))
    token = body.get("access_token")
    if not token:
        raise RuntimeError("X no devolvió access_token: " + json.dumps(body, ensure_ascii=False))
    return token, body.get("refresh_token")


def x_post_tweet(access_token, text, timeout=25):
    """POST /2/tweets -- pay-per-use, lo paga Roi del lado de su cuenta de X (ver Asana
    1217475928610505 para el pricing vigente: $0,015 texto plano / $0,20 si el tweet lleva un
    link). Esta función no maneja billing en absoluto, solo llama al endpoint con el access_token
    vigente -- si falta saldo/billing configurado, X devuelve un HTTPError que se propaga tal cual
    en el 'error' del resultado.

    SIN media todavía: adjuntar imagen/gif necesita el endpoint de media upload (chunked,
    api.x.com/2/media/upload, con scope media.write aparte), que es un flujo distinto de éste y no
    está implementado en esta pasada. Si el item de la cola trae media_path, se postea solo el
    texto y se avisa en el resultado en vez de fallar en silencio."""
    if not text or not text.strip():
        return {"ok": False, "error": "nada para postear: el texto está vacío"}
    body = json.dumps({"text": text}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(X_TWEETS_URL, data=body, method="POST")
    req.add_header("Authorization", "Bearer " + access_token)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": "HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace"))}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    tweet_id = (data.get("data") or {}).get("id")
    return {
        "ok": bool(tweet_id),
        "tweet_id": tweet_id,
        "url": ("https://x.com/i/web/status/" + tweet_id) if tweet_id else None,
        "error": None if tweet_id else "X no devolvió id de tweet: " + json.dumps(data, ensure_ascii=False),
    }


# ── TikTok Content Posting API -- OAuth 2.0 (authorization code + PKCE) ──────
#
# OJO -- diferencia real con X/YouTube, ver README.md: pedir el scope video.publish mete la app
# en la cola de revisión manual de TikTok (1-4 semanas, sin forma de pagar para acelerar). Hasta
# que aprueben, TODO lo que suba esta API queda forzado a privacy_level=SELF_ONLY (solo lo ve la
# cuenta que autorizó, no es público) -- lo impone TikTok del lado del servidor, el código no
# tiene control sobre eso. El flujo sirve igual para el video demo que TikTok pide junto con la
# solicitud de revisión (ver README).

def tiktok_build_authorize_url(client_key, redirect_uri, state, code_challenge):
    params = {
        "client_key": client_key,
        "response_type": "code",
        "scope": TIKTOK_SCOPE,
        "redirect_uri": redirect_uri,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    return TIKTOK_AUTHORIZE_URL + "?" + urllib.parse.urlencode(params)


def tiktok_exchange_code(client_key, client_secret, code, redirect_uri, code_verifier, timeout=20):
    data = urllib.parse.urlencode({
        "client_key": client_key,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
        "code_verifier": code_verifier,
    }).encode("utf-8")
    req = urllib.request.Request(TIKTOK_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    req.add_header("Cache-Control", "no-cache")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"error": "HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace"))}


def tiktok_refresh_access_token(client_key, client_secret, refresh_token, timeout=20):
    """TikTok también rota el refresh_token en cada uso -- mismo trato que x_refresh_access_token."""
    data = urllib.parse.urlencode({
        "client_key": client_key,
        "client_secret": client_secret,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }).encode("utf-8")
    req = urllib.request.Request(TIKTOK_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError("no pude refrescar el token de TikTok: HTTP {}: {}".format(
            e.code, e.read().decode("utf-8", "replace")))
    token = body.get("access_token")
    if not token:
        raise RuntimeError("TikTok no devolvió access_token: " + json.dumps(body, ensure_ascii=False))
    return token, body.get("refresh_token")


def tiktok_upload_video(access_token, file_path, title, privacy_level="SELF_ONLY", timeout=600):
    """Content Posting API, flujo FILE_UPLOAD directo (un solo chunk -- alcanza para clips cortos;
    PULL_FROM_URL es la alternativa si el archivo ya está en una URL pública, no hace falta acá).
    Dos pasos:
      1. POST /video/init/ -- declara tamaño, TikTok devuelve upload_url + publish_id.
      2. PUT al upload_url con los bytes del video.

    privacy_level default SELF_ONLY porque es el ÚNICO valor que aceptan las apps sin auditar --
    si el video sube con otro valor antes de la aprobación, TikTok lo fuerza a SELF_ONLY igual del
    lado de ellos. El día que Roi mande la solicitud y la aprueben, este default hay que
    revisarlo (pasar a PUBLIC_TO_EVERYONE o el valor que corresponda).

    SIN VERIFICAR contra la API real todavía -- mismo estado que youtube_upload_video antes de
    correr el setup: sigue developers.tiktok.com/doc/content-posting-api-reference-direct-post,
    pero falta la prueba end to end contra una app real."""
    if not os.path.isfile(file_path):
        return {"ok": False, "error": "no existe el archivo de video: " + file_path}
    size = os.path.getsize(file_path)

    init_body = json.dumps({
        "post_info": {
            "title": (title or "")[:150],
            "privacy_level": privacy_level,
            "disable_duet": False,
            "disable_comment": False,
            "disable_stitch": False,
        },
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": size,
            "chunk_size": size,
            "total_chunk_count": 1,
        },
    }, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(TIKTOK_INIT_URL, data=init_body, method="POST")
    req.add_header("Authorization", "Bearer " + access_token)
    req.add_header("Content-Type", "application/json; charset=UTF-8")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            init_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": "init HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace"))}
    except Exception as e:
        return {"ok": False, "error": "init: " + str(e)}

    info = init_data.get("data") or {}
    upload_url = info.get("upload_url")
    publish_id = info.get("publish_id")
    if not upload_url or not publish_id:
        return {"ok": False, "error": "TikTok no devolvió upload_url/publish_id: " + json.dumps(init_data, ensure_ascii=False)}

    with open(file_path, "rb") as f:
        video_bytes = f.read()
    put_req = urllib.request.Request(upload_url, data=video_bytes, method="PUT")
    put_req.add_header("Content-Type", "video/mp4")
    put_req.add_header("Content-Range", "bytes 0-{}/{}".format(size - 1, size))
    try:
        with urllib.request.urlopen(put_req, timeout=timeout):
            pass
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": "upload HTTP {}: {}".format(e.code, e.read().decode("utf-8", "replace")), "publish_id": publish_id}
    except Exception as e:
        return {"ok": False, "error": "upload: " + str(e), "publish_id": publish_id}

    return {
        "ok": True,
        "publish_id": publish_id,
        "note": "Subido con privacy_level={} -- revisar el estado con /v2/post/publish/status/fetch/ "
                "(publish_id) o en la app de TikTok, bandeja de borradores/privados.".format(privacy_level),
    }


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
