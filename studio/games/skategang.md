# Dossier — SkateGang: Normie City

| | |
|---|---|
| **Repo** | `G:\Github\SkateGangNormieCity` — `obscuromediaworks/skategang-normie-city` (rama `master`) |
| **Asana** | gid `1216809902709461` |
| **Trigger** | "Continuamos con SkateGang" |
| **Motor** | Unity / WebGL + backend Nakama |

## Qué es

Sandbox de skate en WebGL. Híbrido de física y timing. **Sos el skate**, no el skater.

## Regla estructural del proyecto

**Todo code-driven + editor tools.** Cada pieza se tiene que poder recrear desde la CLI en
batchmode. Nada hecho a mano en el Editor es fuente de verdad.

## Estado por paso

- **Paso 2 — salto:** carga con `C` + sweet spot + ollie, code-driven. **Aprobado**; falta tuneo fino.
- **Paso 3 — trucos/combos:** charge-compose, resuelve por zona, 10 combos. **Validado.**
  Fix pendiente: yaw residual del shove-it.
- **Cámara:** `CameraDirector`, dos modos — **el sistema** decide el cambio de cámara. Validado.
- **Manual + medidor de equilibrio:** `BalanceMeter` modula el **pitch** del nose. Retuneado
  (`dc8ab5f`), **pendiente re-validación**.
- **Próximo:** grind (§9 de la spec).

## Reglas de feel

**Frenar es foot brake o powerslide** — nunca un freno instantáneo. Pendiente: suavizar `brakeForce`.

## Infra

Nakama + Postgres: el contenedor **muere en el primer arranque** porque el healthcheck pasa durante
el `initdb`. La migración se reintenta desde el entrypoint.
