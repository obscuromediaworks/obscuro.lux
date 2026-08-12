# Dossier — LE2

| | |
|---|---|
| **Repo** | `G:\Github\LE2_main` — `obscuromediaworks/LE2_main` |
| **Rama de integración** | `roi/laberinto-vs` |
| **Asana** | **LE2 — Sprint 01**, gid `1214781729763985` |
| **Motor** | Unity 6000.3.10f1 (en `E:\UnityInstalls`) + Wwise |
| **Equipo** | Roi (código + Wwise + foley) · Lucas (3D + narrativa) · Javi (música) |

## Excepción de estudio

**En LE2 el polish SÍ es parte del entregable.** La regla de "funcionalidad pura sobre polish"
(`STUDIO.md` §4) **no aplica acá**.

## Ramas

Integración del laberinto en `roi/laberinto-vs`. **No mergear `le2_arte` ↔ `foundations` directo.**
Ojo con la divergencia de GUIDs cross-branch que dejó el bug del `.gitignore` con los `.meta`
(la regla `*.meta` fue removida).

## Escenas

- `player_setup.unity` — escena fixture del VS.
- `laberinto_VS_implementation.unity` — porteo.

## Estado

- **Refactor al LE2_Director:** porteo de gameplay **completo** (`acd1f1de`). Pendiente B4/D4 (Lucas)
  + smoke test.
- **Inventario:** panel lateral + combinar + tótem llave (`b35faf68`).
- **Diferido:** la puerta norte (B5) abre por `SetActive` — TODO animación.

## Reglas propias

- **Triggers narrativos: garantizar la acción.** Un segundo trigger físico antes que un delay fijo.
- Los settings de gráficos son **local-only** (QualitySettings + volume profile en `skip-worktree`):
  **no pushear**.
- Wwise está integrado y validado; el pipeline está en `docs/audio.md`.

## Type-check

Unity 6000.3.10f1 desde CLI: `csc` + el `.rsp` de Bee.
