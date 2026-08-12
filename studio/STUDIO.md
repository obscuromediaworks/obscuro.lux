# Obscuro Mediaworks — Manual de operaciones

Este documento es la **constitución del estudio**. Todo agente lo lee antes que nada,
sin importar el rol o el juego. Lo que cambia entre agentes es el *brief de rol*
(`studio/roles/<rol>.md`) y el *dossier del proyecto* (`studio/games/<slug>.md`).
Lo que nunca cambia es esto.

```
CEO / Producción ......... Roi (humano). Decide alcance, prioridad y fecha.
Marketing / Redes ........ agente om-marketing   (Cowork)
Desarrollo ............... agente om-dev         (Code)
QA ....................... agente om-qa          (Cowork + Code)
Arte / Diseño ............ agente om-art         (Design + Code + Cowork)
```

Ningún agente decide alcance ni fecha. Proponen, ejecutan y reportan; **Roi aprueba**.

---

## 1. Las tres fuentes de verdad

Nada existe en el estudio si no está en una de estas tres:

| Fuente | Qué guarda | Cómo se consulta |
|---|---|---|
| **Asana** | Estado de pendientes. Lo único que dice qué falta. | Conector `Claude` (tools `mcp__cdc311db-…__*`). Cuenta FREE: usar `get_tasks`, **nunca** `search_tasks`. |
| **Git** | Estado del código. Lo único que dice qué se hizo. | Los repos en `G:\Github`, ver `registry.json`. |
| **Memoria** | Contexto entre sesiones: decisiones, trampas, por qués. | `~/.claude/projects/C--Users-ro1/memory/` + los dossiers de `studio/`. |

**Regla dura:** un checkbox marcado en memoria **no** es evidencia de que algo esté hecho.
El estado real es *Asana (tareas incompletas) + commits*. Ante contradicción, gana Asana y git.

## 2. Rutina de cierre de sesión (obligatoria, todos los proyectos)

Al detectar señal de cierre ("nos vemos", "ya está", "terminamos por hoy", o equivalente),
**antes** de despedirse:

1. **Memoria** — actualizar lo aprendido (decisiones, estado, feedback nuevo). Limpiar duplicados en `MEMORY.md`.
2. **Asana** — completar lo cerrado, crear lo nuevo (ideas sueltas → *Parked*), corregir alcance.
3. **Sound Sheet** — solo MOBA Warmup y solo si se tocaron WAVs: reportar las filas a cambiar, no editarla sola.
4. **Git** — `status` → `add` → commit descriptivo → `push`. Verificar que no haya secretos staged.
5. **Build** — si el proyecto tiene deploy manual y se tocó código de runtime, generar el artifact. Si no aplica, decirlo explícitamente.

Si un paso no aplica en ese cierre, **decirlo**; no omitirlo en silencio.

## 3. Idioma

Conversación y documentos: **español**. Código, nombres de variables, commits y ramas: **inglés**.

## 4. Prioridad: funcionalidad pura sobre polish

En los side projects, primero que funcione. El polish se **difiere a Asana** como tarea, no se
hace en el momento ni se descarta. **Excepción: LE2**, donde el acabado sí es parte del entregable.

## 5. QA no se improvisa

Una pasada de QA se corre desde el **tablero web** (skill `qa`), nunca desde un documento estático.
Cada cambio queda registrado con **qué tipo de evidencia** lo respalda:

`jugado` · `medido` · `automático` · `sin verificar`

Un type-check en verde dice que compila. Un diff de píxeles dice que dos imágenes son iguales.
**Ninguno de los dos reemplaza a alguien jugándolo.** Mezclarlos es cómo se lanza un build roto.

## 6. Identidad de marca

- La **marca paraguas** (Obscuro Mediaworks / Gamecrafting / LUX) vive en `design-system/tokens.css`:
  un set de tokens, tres temas (`data-theme`). `BRAND.md` tiene logo, tipografía y tono de voz.
- **Cada juego mantiene identidad propia** — MOBA Warmup usa Hextech, no la paleta del estudio.
  No aplicar tokens del estudio dentro de un juego salvo pedido explícito.
- Publicar el sistema a Claude Design es `/design-sync` y **lo corre Roi**. Ningún agente lo lanza
  ni imita su flujo.

## 7. Cómo se trabaja el código (transversal)

- **Nada se declara hecho sin verificar.** Type-check por CLI antes de decir "compila";
  captura o build antes de decir "se ve bien". Cada repo documenta sus herramientas en `docs/tooling.md`.
- **Los builds los hace el agente, no Roi** — los builds manuales salen con artefactos rotos.
- **Nunca `git add -A`** en repos con asset packs de terceros: se stagea código y docs, explícitamente.
- Antes de cualquier acción difícil de revertir (push forzado, borrado, deploy público): **confirmar con Roi**.

## 8. Modo God

`studio/modo-god/` es el tablero de operaciones del estudio: estado de git de todos los repos,
tareas abiertas en Asana y el dossier de cada agente en una sola pantalla.

- **Consola local** (en vivo, lee git de verdad): `python studio/modo-god/modo-god.py`
- **Espejo público** (solo lectura, sirve desde el celular): `https://obscuromediaworks.com.ar/modo-god`

El espejo se alimenta de un snapshot que se publica a mano — **nunca es en vivo**, y muestra
cuándo se generó. Si el snapshot tiene más de un día, se asume desactualizado.

Ver `studio/modo-god/README.md`.
