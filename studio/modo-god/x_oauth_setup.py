#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup de OAuth de X (ex-Twitter) -- lo corre Roi UNA sola vez, a mano, desde una terminal.

Por qué un script aparte en vez de un botón en Modo God: el authorization code flow necesita que
Roi apruete "Authorize app" desde un navegador logueado con la cuenta de X correcta -- no tiene
sentido automatizar eso desde el server local. Una vez que este script guarda el access_token +
refresh_token, el disparo real desde el tablero de Modo God (`/publish`) ya no necesita este paso
de nuevo (X rota el refresh_token en cada uso, pero el código lo persiste solo).

## Paso 0 -- lo que Roi tiene que armar en developer.x.com (una vez)

1. https://developer.x.com/ -> entrar/registrarse con la cuenta que va a postear (@MOBAWarmupGame
   u otra, según qué cuenta se autorice) -> crear un proyecto + una app (el flujo actual pide los
   dos, la app queda adentro del proyecto).
2. Dentro de la app -> "User authentication settings" -> "Set up":
   - **App permissions: "Read and write"** -- si queda en "Read only", `tweet.write` se rechaza
     al autorizar aunque el scope se pida bien.
   - **Type of App: "Web App, Automated App or Bot"** (esto es lo que hace que X te dé un
     client_secret -- "confidential client". Si elegís "Native App"/"Mobile App" no hay secret y
     el código de acá no aplica tal cual, avisar antes de seguir).
   - **Callback URI / Redirect URL**: pegar EXACTO `http://127.0.0.1:8721/oauth/callback` (o el
     puerto que le pases a `--port`, pero tiene que matchear carácter por carácter con lo que usa
     este script -- X valida el redirect_uri estricto, no tolera trailing slash de más ni de
     menos).
   - Website URL: `https://obscuromediaworks.com.ar` alcanza.
3. Guardar. Ir a la pestaña **"Keys and tokens"** de la app -> sección **"OAuth 2.0 Client ID and
   Client Secret"** -> copiar los dos. (NO son el "API Key and Secret" que aparece arriba de esa
   sección -- esos son de OAuth 1.0a, un flujo distinto que este script no usa.)

## Paso 1 -- correr este script

    python studio/modo-god/x_oauth_setup.py --client-id TU_CLIENT_ID --client-secret TU_CLIENT_SECRET

Abre el navegador (o imprime la URL si no puede abrirlo solo) en la pantalla de autorización de X.
Roi hace click en "Authorize app". El script captura el redirect en un server local temporal que
levanta él mismo en `http://127.0.0.1:8721/oauth/callback` (cambiar con `--port` si ese puerto ya
está ocupado -- pero acordarse de actualizar también el Callback URI del Paso 0 si se cambia acá).
Canjea el code por access_token + refresh_token (PKCE, sin exponer nada por URL salvo el code) y
los guarda en `publish-credentials.json`.

## Pay-per-use, no suscripción

Postear de verdad cuesta por request -- ver la tarea de Asana `1217475928610505` para el pricing
vigente al momento de escribir esto ($0,015 texto plano / $0,20 si el tweet lleva un link, puede
cambiar). Eso lo paga Roi directamente en developer.x.com -> el panel de billing de la app, con su
tarjeta -- este script y `social_publisher.x_post_tweet()` no manejan billing en absoluto, solo
llaman al endpoint con el access_token vigente. Si falta billing configurado o no hay saldo, X
devuelve un HTTP error que el tablero de Publish va a mostrar tal cual en el resultado del item
(no un fallo silencioso).

## Qué guarda y dónde

`studio/modo-god/publish-credentials.json` (gitignoreado, nunca se commitea):
    { "x": {"client_id": "...", "client_secret": "...",
            "access_token": "...", "refresh_token": "..."}, ... }

El access_token de X expira a las 2 horas -- `publish_board._fire_x()` lo refresca solo con el
refresh_token antes de cada disparo, igual que YouTube con el suyo. A diferencia de Google, **X
rota el refresh_token en cada refresh** -- el código guarda el que vuelva cada vez, así que en
uso normal nunca hace falta correr este script de nuevo (solo si se revoca el acceso a mano desde
X -> Settings -> Security and account access -> Apps and sessions).
"""

import argparse
import sys
import webbrowser

import social_publisher as sp


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client-id", required=True, help="OAuth 2.0 Client ID, pestaña 'Keys and tokens'")
    ap.add_argument("--client-secret", required=True, help="OAuth 2.0 Client Secret, misma pestaña")
    ap.add_argument("--port", type=int, default=8721, help="Puerto local para el redirect (default 8721)")
    args = ap.parse_args()

    redirect_uri = "http://127.0.0.1:{}/oauth/callback".format(args.port)
    verifier, challenge = sp.pkce_pair()
    state = sp.random_state()
    url = sp.x_build_authorize_url(args.client_id, redirect_uri, state, challenge)

    print("Abriendo el navegador para autorizar la app...")
    print("Si no abre solo, pegá esto a mano:\n\n  " + url + "\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

    print("Esperando el redirect en " + redirect_uri + " (hasta 5 min)...")
    try:
        params = sp.wait_for_oauth_redirect(args.port, timeout=300)
    except OSError as e:
        sys.exit(
            "No pude levantar el server local en el puerto {}: {}\n"
            "Probá con --port otro Y actualizá el Callback URI en developer.x.com para que matchee."
            .format(args.port, e)
        )

    if not params:
        sys.exit("Se agotó el tiempo de espera sin que llegara ningún redirect. Corré el script de nuevo.")
    if "error" in params:
        sys.exit("X devolvió un error: " + params.get("error_description", params["error"]))
    if params.get("state") != state:
        sys.exit("El 'state' del redirect no coincide con el que mandamos -- posible problema de "
                  "seguridad, abortando sin guardar nada. Corré el script de nuevo.")
    code = params.get("code")
    if not code:
        sys.exit("No llegó ningún 'code' en el redirect: " + str(params))

    print("Code recibido, canjeando por tokens...")
    token_data = sp.x_exchange_code(args.client_id, args.client_secret, code, redirect_uri, verifier)
    if "access_token" not in token_data:
        sys.exit("X no devolvió access_token: " + str(token_data))

    creds = sp.load_credentials()
    creds["x"] = {
        "client_id": args.client_id,
        "client_secret": args.client_secret,
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
    }
    sp.save_credentials(creds)
    print("\nListo -- guardado en publish-credentials.json.")
    print("El tablero /publish ya puede disparar posts reales de X.")


if __name__ == "__main__":
    main()
