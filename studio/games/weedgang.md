# Dossier — Weedgang

| | |
|---|---|
| **Repo** | `G:\Github\Weedgang` (privado) — `obscuromediaworks/weedgang` |
| **Asana** | gid `1217256203746701` |
| **Trigger** | "Seguimos con Weedgang" |
| **Motor** | Unity / WebGL + Nakama + FMOD |

## Qué es

Cozy game de cultivo en WebGL. **Tamagotchi de plantas, no idle.** MVP = riego y poda con timing
(el truco quedó para la Fase 2).

## Lenguaje

El usuario es un **Grower**. Término in-world: usarlo en UI, narrativa y código.
**Nunca** "jugador" de cara al usuario.

## Arquitectura

El jardín **no se simula con tick**: es una función pura evaluada por delta de tiempo.
Gotcha: el adapter de WebSocket de WebGL no se detecta corriendo en el Editor.

## Estado — Fase 1

Online validado en WebGL + UI real: **hechos**. Queda el **balance**.
Los controles de tiempo de la escena son lo que hace testeable todo esto.

## ⚠️ Balance: los pesos NO suman 1

Es deliberado. **Si alguien los "ordena" para que sumen 1, rompe el sistema de cuidado entero.**
Tocar cuidado ⇒ re-correr el simulador y recalibrar precios.

## Assets

Synty (~190 MB) y los binarios de FMOD (~294 MB) están **gitignoreados**.
Sí se versiona `FMODStudioSettings.asset`.

## Nakama (TypeScript)

El bundle **no puede ser IIFE** — Nakama parsea el AST; bundlear a `cjs`.
El port de C# → TS necesita `Math.fround` y vectores de test.
