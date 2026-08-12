# Dossier — MOBA Warmup

| | |
|---|---|
| **Repo** | `G:\Github\MOBAWarmup` — `obscuromediaworks/moba_warmup` (rama `main`) |
| **Asana** | board activo **Launch v1**, gid `1217136324673914` (el `1215263538370822` es histórico) |
| **Trigger** | "Sigamos con MOBA Warmup" |
| **Motor** | Unity 6 / WebGL |
| **Lanza** | **14/8/2026** |
| **Público** | https://mobawarmup.obscuromediaworks.com.ar → itch.io |
| **Equipo** | Roi (solo). Música: Javi. |

## Qué es

Entrenador de MOBA en WebGL: practicar last hit, kiting de ADC, jungla y support fuera de la
partida. No es un juego de partidas; es un gimnasio.

## Alcance v1 — **CONGELADO**

Núcleo: **LastHit + ADCKite + Loading**. Todo lo demás sale como **beta**.
**Nada nuevo entra antes del lanzamiento.** Ideas → Asana / *Parked*.

## Restricciones que no se negocian

- **Split de compliance:** build standalone (itch, **sin IP de Riot**) vs build Overwolf.
  Se separan con el define `MW_OVERWOLF`. Falta el Track C (arte propio para reemplazar assets de Riot).
- **Game Mindset** es un overlay de *coaching mental*. **GUARDRAIL: mentalidad, no intel táctica en
  vivo.** Nada que le diga al jugador qué hacer en la partida en curso.
- **La key de dev de la Riot API expira cada 24 h**; la de producción está aprobada y atada a
  `riot.txt` en el subdominio.

## Identidad

Hextech — `docs/ui-style.md` + `HextechUI.cs`. Fuente Cinzel vía TMP. **No** usar tokens del estudio.
El cartouche siempre detrás del contenido.

## Trampas activas

- `Player.prefab` es **el visual**, no el player: `PlayerController` se agrega por código, por escena.
- Velocidad de animación **por estado**, nunca `animator.speed`.
- El disparo alineado con el rifle se resolvió **en la pose** (d6b4fe4): **no correr Run ALL / Paso 3**, borra el rifle.
- El peso del build es 71% texturas y es **resolución**, no compresión. No tocar stripping.
- Buildear los dos targets = empaquetar Overwolf **siempre**: `scripts/build-all.ps1`.

## Estado abierto

- Composition y ADC Kite del feedback de Lucas (2026-06-23) siguen abiertos en Asana.
- Leaderboard: Supabase listo; falta Vercel + submit/panel en Unity.
- Falta la música de Javi.

## Docs canónicos

`docs/gdd-complete.html` es el **GDD canónico** — se actualiza con todo cambio de código o spec.
`docs/tooling.md` lista todo lo corrible sin abrir el Editor.
