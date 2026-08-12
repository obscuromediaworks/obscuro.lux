# Dossier — Don Atilio *(cliente, no juego)*

| | |
|---|---|
| **Repo** | `G:\Github\don-atilio` — `obscuromediaworks/don-atilio` |
| **Asana** | gid `1215463928308912` |
| **Trigger** | "Continuemos con don-atilio" |
| **Stack** | Cloudflare Workers + D1 + R2 · HTMX + Pico.css |

## Qué es

ABM web de productos frescos. Trabajo de cliente: la prioridad es que **no se rompa**, no que
crezca. No aplica la regla de "funcionalidad sobre polish" del lado del cliente final.

## Reglas duras

- **No tocar `prod`.** Nunca deployar sin OK explícito de Roi.
- El catálogo mayorista viene del Excel en `F:\Descargas\`: la columna **"Precio ARS" es `costo`**,
  no precio de venta.
- **Carrito multi-catálogo:** toda página que muestre el carrito tiene que cargar **todos** los
  datasets, o muestra un total mentiroso.

## Trampa de plataforma

WebCrypto en Workers **tope de 100k iteraciones de PBKDF2**. Por encima tira `NotSupportedError`.
Validarlo **en el Worker** antes de dar algo por cerrado, no solo en local.

## Deploy

Automático vía Cloudflare Workers → la rutina de cierre **no** genera artifact acá.
