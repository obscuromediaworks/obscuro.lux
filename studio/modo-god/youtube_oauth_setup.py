#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup de OAuth de YouTube -- lo corre Roi UNA sola vez, a mano, desde una terminal.

Por qué existe un script aparte en vez de un botón en Modo God: el device flow necesita que
Roi confirme desde un navegador logueado con la cuenta de YouTube correcta (la del canal
@MOBAWarmup, no cualquier cuenta de Google) -- no tiene sentido intentar automatizar eso desde
el server local. Una vez que este script guarda el refresh_token, el disparo real desde el
tablero de Modo God (`/publish`) ya no necesita este paso de nuevo.

## Paso 0 -- lo que Roi tiene que armar del lado de Google Cloud Console (una vez)

1. https://console.cloud.google.com/ -> crear un proyecto (o reusar uno) para Obscuro Mediaworks.
2. "APIs & Services" -> "Library" -> buscar "YouTube Data API v3" -> Enable.
3. "APIs & Services" -> "OAuth consent screen":
   - User type: External (a menos que la cuenta de YouTube sea Workspace).
   - App name: algo como "Obscuro Mediaworks -- Modo God" (no importa mucho, no es público).
   - Scopes: agregar `https://www.googleapis.com/auth/youtube.upload`.
   - Test users: agregar la cuenta de Gmail que administra @MOBAWarmup -- MIENTRAS la app esté en
     modo "Testing" (que es donde va a quedar, no hace falta publicarla), solo esas cuentas pueden
     autorizar. Sin este paso el device flow tira "access_denied".
4. "APIs & Services" -> "Credentials" -> "Create Credentials" -> "OAuth client ID":
   - Application type: **"TVs and Limited Input devices"** (es el tipo pensado para el device
     flow -- NO "Desktop app", que usa un flujo distinto con redirect a localhost).
   - Copiar el Client ID y el Client Secret que aparecen.

## Paso 1 -- correr este script

    python studio/modo-god/youtube_oauth_setup.py --client-id TU_CLIENT_ID --client-secret TU_CLIENT_SECRET

Va a imprimir una URL (`https://www.google.com/device`) y un código de 8 caracteres. Abrir esa URL
en CUALQUIER navegador (no hace falta que sea la misma máquina), loguearse con la cuenta de
@MOBAWarmup si no lo está ya, pegar el código y aprobar. El script queda esperando (polling) y en
cuanto Google confirma, escribe `publish-credentials.json` con el refresh_token -- sin pisar
`discord.webhook_url` si ya estaba cargado.

## Qué guarda y dónde

`studio/modo-god/publish-credentials.json` (gitignoreado, nunca se commitea):
    { "youtube": { "client_id": "...", "client_secret": "...", "refresh_token": "..." }, ... }

El refresh_token no expira salvo que se revoque manualmente (Google Account -> Security ->
Third-party access) o la app quede sin usarse 6 meses en modo Testing. Si algún día expira o se
revoca, correr este script de nuevo.
"""

import argparse
import sys
import time

import social_publisher as sp


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client-id", required=True, help="OAuth client ID (tipo 'TVs and Limited Input devices')")
    ap.add_argument("--client-secret", required=True)
    args = ap.parse_args()

    print("Pidiendo device code a Google...")
    try:
        start = sp.youtube_device_auth_start(args.client_id)
    except Exception as e:
        sys.exit("No pude arrancar el device flow: " + str(e))

    verification_url = start.get("verification_url") or start.get("verification_uri")
    user_code = start.get("user_code")
    device_code = start.get("device_code")
    interval = start.get("interval", 5)
    expires_in = start.get("expires_in", 1800)

    if not (verification_url and user_code and device_code):
        sys.exit("Respuesta inesperada de Google: " + str(start))

    print()
    print("  1. Abrí:  " + verification_url)
    print("  2. Ingresá el código:  " + user_code)
    print("  3. Logueate con la cuenta de Google que administra @MOBAWarmup y aprobá.")
    print()
    print("Esperando confirmación (hasta {} min)...".format(expires_in // 60))

    deadline = time.time() + expires_in
    token_data = None
    while time.time() < deadline:
        time.sleep(interval)
        resp = sp.youtube_device_auth_poll(args.client_id, args.client_secret, device_code)
        if "access_token" in resp:
            token_data = resp
            break
        err = resp.get("error")
        if err == "authorization_pending":
            print(".", end="", flush=True)
            continue
        if err == "slow_down":
            interval += 5
            continue
        sys.exit("\nGoogle devolvió un error: " + str(resp))

    if token_data is None:
        sys.exit("\nSe agotó el tiempo de espera sin confirmación. Corré el script de nuevo.")

    refresh_token = token_data.get("refresh_token")
    if not refresh_token:
        sys.exit(
            "\nGoogle no devolvió refresh_token (puede pasar si esta cuenta ya autorizó esta app "
            "antes -- Google solo lo manda la primera vez). Revocá el acceso en "
            "https://myaccount.google.com/permissions y corré el script de nuevo."
        )

    creds = sp.load_credentials()
    creds["youtube"] = {
        "client_id": args.client_id,
        "client_secret": args.client_secret,
        "refresh_token": refresh_token,
    }
    sp.save_credentials(creds)
    print("\n\nListo -- guardado en publish-credentials.json.")
    print("El tablero /publish ya puede disparar posts reales de YouTube.")


if __name__ == "__main__":
    main()
