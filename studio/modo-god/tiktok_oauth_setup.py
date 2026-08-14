#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup de OAuth de TikTok (Content Posting API) -- lo corre Roi UNA sola vez, a mano, desde una
terminal. LEER LA SECCIÓN "Diferencia real con X/YouTube" antes de asumir que esto deja a TikTok
posteando en público -- no es así todavía, y no depende de nada de lo que hay acá.

## Diferencia real con X/YouTube -- no es "pagar y anda"

La Content Posting API de TikTok es GRATIS (no hay billing de por medio, a diferencia de X). Pero
pedir el scope de posteo (`video.publish`) mete la app en la **cola de revisión manual de
TikTok**: 1 a 4 semanas, sin forma de pagar para acelerar, sin SLA garantizado. Hasta que
aprueben:

- Todo lo que suba esta API queda forzado a **`privacy_level=SELF_ONLY`** (solo lo ve la cuenta
  que autorizó, en su bandeja de borradores/privados de la app de TikTok) -- lo impone TikTok del
  lado del servidor, NO hay flag ni parámetro que lo evite desde acá.
- El código funciona igual de bien con o sin la aprobación -- lo único que cambia es quién puede
  ver el resultado. Si alguien ve un post "roto" o "que no aparece", el motivo casi seguro es
  este, no un bug: revisar `publish_id` con `/v2/post/publish/status/fetch/` o directamente la
  bandeja de la app de TikTok logueada con la cuenta que autorizó.

**Esto es justamente lo que hace falta para poder MANDAR la solicitud de revisión.** TikTok pide,
junto con la solicitud:
1. Un **video demo** mostrando el flujo completo de OAuth + upload funcionando de punta a punta
   (aunque el resultado quede privado -- eso es aceptable y esperado en el demo).
2. Una **URL de política de privacidad** pública. Hoy probablemente no existe una para
   MOBAWarmup/Obscuro -- **queda pendiente de Roi decidir/redactar, no es algo que resuelva un
   agente acá** (avisar si hace falta que alguien la escriba).

O sea: correr este script y probar un upload privado no es trabajo en el aire, es el prerequisito
para poder grabar el demo y mandar la solicitud.

## Paso 0 -- lo que Roi tiene que armar en developers.tiktok.com (una vez)

El registro de cuenta de developer es instantáneo (sin aprobación previa) -- lo que requiere
revisión es específicamente el scope de posteo, no la cuenta en sí.

1. https://developers.tiktok.com/ -> "Manage apps" -> "Connect an app" (o "Create an app").
2. Completar los datos básicos de la app (nombre, categoría, ícono -- lo mínimo que pide el
   formulario).
3. Bajo "Add products" -> agregar **"Content Posting API"** (y opcionalmente "Login Kit", que es
   el mismo mecanismo de OAuth por debajo).
4. **Redirect URI / Redirect domain -- OJO, esto es lo que más varía respecto a X:**
   TikTok, a diferencia de X, en apps de producción suele exigir que el dominio del redirect_uri
   esté **verificado** (subiendo un archivo HTML o agregando un registro DNS que confirme que sos
   dueño del dominio) -- un `http://127.0.0.1:.../oauth/callback` como el que usa X puede NO ser
   aceptado directo. TikTok sí ofrece un modo **"Sandbox"** para probar antes de que la app pase
   por revisión, pensado justo para este caso (agregar hasta 10 "target users" por username de
   TikTok que pueden probar el flujo sin que la app esté aprobada) -- en sandbox las reglas de
   redirect suelen ser más laxas, pero **no está confirmado desde acá que acepte localhost sin
   más**, cambia según lo que muestre el panel en el momento. Plan concreto para mañana:
     a. Probar primero con `--port` default (`http://127.0.0.1:8730/oauth/callback`) tal cual
        aparece abajo. Si el panel de TikTok lo rechaza al guardar el redirect URI, ese es el
        indicador de que hace falta domain verification.
     b. Si hace falta, el fallback es usar un dominio ya verificado del estudio en vez de
        localhost -- `obscuromediaworks.com.ar` ya está en Cloudflare, así que verificar un
        subpath ahí (ej. `https://obscuromediaworks.com.ar/oauth/tiktok-callback`) es mucho más
        rápido que armar un dominio nuevo. Esa página no necesita backend: solo mostrar en
        pantalla el `code`/`state` de la query string para copiarlos a mano y pasárselos a una
        variante manual de este script (`--code`/`--state` en vez de esperar el redirect local).
        **No armado todavía** -- se arma si el paso (a) falla, no antes, para no construir algo
        que quizás no haga falta.
5. Copiar el **Client Key** y el **Client Secret** desde la página de la app (equivalente al
   Client ID/Secret de X, TikTok le dice distinto).
6. Bajo "Sandbox" (si se usó) -> agregar el/los usernames de TikTok que van a probar el flujo
   antes de la revisión (la cuenta que va a postear tiene que estar en esa lista).

## Paso 1 -- correr este script

    python studio/modo-god/tiktok_oauth_setup.py --client-key TU_CLIENT_KEY --client-secret TU_CLIENT_SECRET

Mismo mecanismo que `x_oauth_setup.py`: abre el navegador en la pantalla de autorización de
TikTok, espera el click de Roi en "Authorize", captura el redirect en un server local temporal
(`http://127.0.0.1:8730/oauth/callback` por default -- `--port` para cambiarlo, actualizando
también el redirect URI configurado en el Paso 0 si se toca), canjea el code por access_token +
refresh_token (PKCE) y los guarda en `publish-credentials.json`.

## Qué guarda y dónde

`studio/modo-god/publish-credentials.json` (gitignoreado, nunca se commitea):
    { "tiktok": {"client_key": "...", "client_secret": "...",
                 "access_token": "...", "refresh_token": "..."}, ... }

TikTok también rota el refresh_token en cada uso (igual que X) -- el código lo persiste solo en
cada disparo, no hace falta correr este script de nuevo salvo revocación manual.
"""

import argparse
import sys
import webbrowser

import social_publisher as sp


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client-key", required=True, help="Client Key de la app, developers.tiktok.com")
    ap.add_argument("--client-secret", required=True, help="Client Secret de la misma app")
    ap.add_argument("--port", type=int, default=8730, help="Puerto local para el redirect (default 8730)")
    args = ap.parse_args()

    redirect_uri = "http://127.0.0.1:{}/oauth/callback".format(args.port)
    verifier, challenge = sp.pkce_pair()
    state = sp.random_state()
    url = sp.tiktok_build_authorize_url(args.client_key, redirect_uri, state, challenge)

    print("Abriendo el navegador para autorizar la app...")
    print("Si no abre solo, pegá esto a mano:\n\n  " + url + "\n")
    print("Si TikTok muestra un error de 'redirect_uri inválido' ANTES de llegar a la pantalla de")
    print("autorización, es el caso de domain verification descripto en el Paso 0 -- no es un bug")
    print("de este script, hace falta resolver el redirect URI en el panel primero.\n")
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
            "Probá con --port otro Y actualizá el redirect URI en developers.tiktok.com para que matchee."
            .format(args.port, e)
        )

    if not params:
        sys.exit("Se agotó el tiempo de espera sin que llegara ningún redirect. Corré el script de nuevo.")
    if "error" in params:
        sys.exit("TikTok devolvió un error: " + params.get("error_description", params["error"]))
    if params.get("state") != state:
        sys.exit("El 'state' del redirect no coincide con el que mandamos -- posible problema de "
                  "seguridad, abortando sin guardar nada. Corré el script de nuevo.")
    code = params.get("code")
    if not code:
        sys.exit("No llegó ningún 'code' en el redirect: " + str(params))

    print("Code recibido, canjeando por tokens...")
    token_data = sp.tiktok_exchange_code(args.client_key, args.client_secret, code, redirect_uri, verifier)
    if "access_token" not in token_data:
        sys.exit("TikTok no devolvió access_token: " + str(token_data))

    creds = sp.load_credentials()
    creds["tiktok"] = {
        "client_key": args.client_key,
        "client_secret": args.client_secret,
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
    }
    sp.save_credentials(creds)
    print("\nListo -- guardado en publish-credentials.json.")
    print("El tablero /publish ya puede disparar uploads reales de TikTok (privados hasta que")
    print("TikTok apruebe la revisión -- ver el docstring de este script).")


if __name__ == "__main__":
    main()
