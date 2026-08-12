# Deploy del sitio

> Este archivo existe porque el 12/8/2026 el dominio estuvo sirviendo una pantalla negra y nadie
> podía saber por qué: el repo no tenía **ni una línea** sobre cómo se publicaba. Si cambiás algo
> del deploy, actualizá esto en el mismo commit.

## El comando

```bash
npm run deploy
```

Eso es todo. Sube `deploy/` al Worker **`obscuro-lux-site`**, que tiene atados:

- `obscuromediaworks.com.ar`
- `www.obscuromediaworks.com.ar`
- `lux.obscuromediaworks.com.ar`

Requiere `npx wrangler login` (el OAuth caduca ~24 h). Cuenta `obscuromediaworks@gmail.com`,
account id `630e82a95b7e0195814dd7891e25fc8c`.

## ⚠️ Lo único que no hay que confundir

**`deploy/index.html` es el sitio. `index.html` en la raíz NO.**

| Archivo | `<title>` | Qué es |
|---|---|---|
| `deploy/index.html` | `— Estudio de diseño y desarrollo` | **el sitio**, self-contained, 2,1 MB |
| `index.html` (raíz) | `— Landing (3 variaciones)` | comparador de exploración de diseño |

Ese comparador **crashea en React** (`DesignCanvas` → `AProjects`) y deja el `<body>` con cero
contenido: el dominio se ve **negro**. Cualquier deploy que sirva la raíz del repo en vez de
`deploy/` rompe el sitio así. Por eso `wrangler.toml` fija `directory = "./deploy"`.

**Cómo verificar un deploy en 5 segundos:** mirá el `<title>` de la pestaña, no el status code.

```bash
curl -s https://obscuromediaworks.com.ar/ | grep -o '<title>[^<]*</title>'
```

## Flujo de trabajo

El sitio se hace con **Claude Code + Design**. El fuente son `site.html` + los `.jsx`;
`deploy/index.html` es el **bundle self-contained** (assets, fonts y scripts inlineados) que se
regenera antes de publicar. El deploy lo corre Claude cuando Roi dice **"deployá"** — nunca solo,
y nunca como parte de una rutina de cierre.

## Si algo sale mal

Volver a la versión anterior, en un comando:

```bash
npm run versions                    # listar versiones con fecha
npx wrangler rollback <version-id> --name obscuro-lux-site -y
```

Versión de referencia buena: `5d421a84-77de-4e2b-aee2-6b2d5c46aac3` (26/6/2026).

## Historial de incidentes

**2026-08-12 — el dominio en negro.** Un deploy sirvió la raíz del repo en vez de `deploy/`.
Estuvo así ~12 h. Se recuperó con `wrangler rollback` a `5d421a84`. De ahí salieron el
`wrangler.toml` versionado y este documento: antes, la configuración del deploy solo existía en la
sesión que lo había hecho.

Si el Worker tiene además una **integración de Git** (builds automáticos al pushear), ahora es
segura: el build lee este `wrangler.toml` y sirve `deploy/`. Antes no existía el archivo, y por eso
el build automático servía la raíz.
