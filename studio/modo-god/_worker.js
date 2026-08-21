// Worker del espejo público de Modo God.
//
// Dos responsabilidades:
// 1. Auth propia (Cloudflare Access pedía tarjeta) -- Basic Auth contra el secret MODOGOD_USERS.
// 2. Sync remoto -- /api/sync junta estado de GitHub (commits, sin necesitar el disco local de
//    Roi) + Asana (si hay ASANA_TOKEN) + los GDD, y lo guarda en KV (MODOGOD_CACHE). /api/snapshot
//    sirve ese cache. Nada de esto pasa por una sesión de Claude: son fetch() a APIs públicas con
//    tokens guardados como secrets del proyecto Pages.
//
// Lo que NO hace esto: no ve archivos sin commitear ni sin pushear (eso es inherentemente local).
// La consola local (modo-god.py) sigue siendo la única que ve ESE estado -- por diseño, ver README.

const GH_API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";
const OBSCURO_REPO = "obscuromediaworks/obscuro.lux";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const va = new Uint8Array(ha), vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function unauthorized() {
  return new Response("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Modo God", charset="UTF-8"' },
  });
}

async function checkAuth(request, env) {
  let users = {};
  try {
    users = JSON.parse(env.MODOGOD_USERS || "{}");
  } catch (e) {
    return false;
  }
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  let user, pass;
  try {
    [user, pass] = atob(auth.slice(6)).split(":");
  } catch (e) {
    return false;
  }
  const expected = users[user];
  return !!expected && (await timingSafeEqual(pass, expected));
}

async function ghJSON(env, path) {
  const r = await fetch(GH_API + path, {
    headers: {
      Authorization: "Bearer " + env.GITHUB_TOKEN,
      "User-Agent": "modo-god-worker",
      Accept: "application/vnd.github+json",
    },
  });
  if (!r.ok) return null;
  return r.json();
}

// raw.githubusercontent.com da 404 (no 403) sin auth para repos privados -- casi todos los del
// estudio lo son. Mandar el token siempre; en obscuro.lux (público) no molesta.
async function rawJSON(env, repo, branch, path) {
  try {
    const r = await fetch(`${RAW}/${repo}/${branch}/${path}`, {
      headers: { Authorization: "token " + env.GITHUB_TOKEN, "User-Agent": "modo-god-worker" },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

async function rawText(env, repo, branch, path) {
  try {
    const r = await fetch(`${RAW}/${repo}/${branch}/${path}`, {
      headers: { Authorization: "token " + env.GITHUB_TOKEN, "User-Agent": "modo-god-worker" },
    });
    if (!r.ok) return null;
    return await r.text();
  } catch (e) {
    return null;
  }
}

async function repoGitState(env, repo, branch) {
  if (!repo || !branch) return { ok: false, error: "sin repo/branch en registry.json", source: "github" };
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const b = encodeURIComponent(branch);
  const [latest, c7, c30] = await Promise.all([
    ghJSON(env, `/repos/${repo}/commits/${b}`),
    ghJSON(env, `/repos/${repo}/commits?sha=${b}&since=${since7}&per_page=100`),
    ghJSON(env, `/repos/${repo}/commits?sha=${b}&since=${since30}&per_page=100`),
  ]);
  if (!latest) return { ok: false, error: "no se pudo leer de GitHub (repo/branch/token)", source: "github" };
  const commit = latest.commit || {};
  const author = commit.author || {};
  return {
    ok: true,
    source: "github",
    branch,
    // no hay forma de ver esto sin el disco local -- lo remoto solo conoce lo pusheado.
    dirty: null,
    untracked: null,
    ahead: null,
    behind: null,
    upstream: null,
    last_commit: {
      hash: (latest.sha || "").slice(0, 7),
      subject: (commit.message || "").split("\n")[0],
      author: author.name || "?",
      date: author.date || null,
    },
    commits_7d: Array.isArray(c7) ? c7.length : null,
    commits_30d: Array.isArray(c30) ? c30.length : null,
    branches: [],
  };
}

async function asanaCounts(env, gid) {
  if (!env.ASANA_TOKEN || !gid) return null;
  try {
    const r = await fetch(
      `https://app.asana.com/api/1.0/projects/${gid}/task_counts?opt_fields=num_tasks,num_incomplete_tasks,num_completed_tasks`,
      { headers: { Authorization: "Bearer " + env.ASANA_TOKEN } }
    );
    if (!r.ok) return null;
    const data = (await r.json()).data || {};
    return { total: data.num_tasks, open: data.num_incomplete_tasks, done: data.num_completed_tasks };
  } catch (e) {
    return null;
  }
}

async function buildSnapshot(env) {
  const registry = await rawJSON(env, OBSCURO_REPO, "main", "studio/registry.json");
  if (!registry) throw new Error("no pude leer studio/registry.json desde GitHub (main)");
  const decisionsDoc = (await rawJSON(env, OBSCURO_REPO, "main", "studio/modo-god/decisions.json")) || {};
  const asanaCacheDoc = (await rawJSON(env, OBSCURO_REPO, "main", "studio/modo-god/asana-cache.json")) || {};
  const asanaBySlug = asanaCacheDoc.projects || {};

  const projects = await Promise.all(
    (registry.projects || []).map(async (p) => {
      const [git, gddContent, liveAsana] = await Promise.all([
        repoGitState(env, p.repo, p.main_branch),
        p.gdd ? rawText(env, p.repo, p.main_branch, p.gdd) : Promise.resolve(null),
        asanaCounts(env, p.asana_project_gid),
      ]);
      const cachedAsana = asanaBySlug[p.slug] || null;
      const asana = liveAsana
        ? Object.assign({}, cachedAsana, liveAsana, { live: true })
        : cachedAsana
        ? Object.assign({}, cachedAsana, { live: false })
        : null;
      return {
        slug: p.slug,
        name: p.name,
        kind: p.kind,
        status: p.status,
        priority: p.priority,
        repo: p.repo,
        repo_path: p.repo_path,
        main_branch: p.main_branch,
        asana_project_gid: p.asana_project_gid,
        asana_project_name: p.asana_project_name,
        trigger: p.trigger,
        engine: p.engine,
        ships_on: p.ships_on,
        public_url: p.public_url,
        socials: p.socials,
        roles: p.roles,
        git,
        asana,
        gdd: gddContent ? { html: gddContent, synced_at: new Date().toISOString() } : null,
      };
    })
  );

  projects.sort((a, b) => (a.priority || 999) - (b.priority || 999));

  return {
    generated_at: new Date().toISOString(),
    generated_on: "god.obscuromediaworks.com.ar (sync remoto, vía GitHub" + (env.ASANA_TOKEN ? "+Asana" : "") + ")",
    studio: registry.studio || {},
    roles: registry.roles || [],
    projects,
    decisions: (decisionsDoc.decisions || []).filter((d) => d.status !== "decided"),
    asana_cache: {
      present: !!asanaCacheDoc.generated_at,
      generated_at: asanaCacheDoc.generated_at || null,
      note: env.ASANA_TOKEN
        ? "Conteos abiertas/hechas en vivo vía Asana API; highlights de la última caché committeada."
        : (asanaCacheDoc.note || null) + " (sin ASANA_TOKEN: esto es la última caché committeada, no en vivo)",
    },
    // qa/publish: false a propósito -- el tablero de QA (qa_board.py) y el de Publish
    // (publish_board.py, dispara posts reales a Discord/YouTube) son exclusivos de la consola
    // local, no del espejo público. Ver studio/modo-god/README.md.
    // activity: false también -- GET /api/activity (activity.py) lee ~/.claude del disco local,
    // el Worker corre en Cloudflare y no tiene acceso a esa máquina.
    capabilities: { decide: false, sync: true, qa: false, publish: false, activity: false },
  };
}

export default {
  async fetch(request, env) {
    if (!(await checkAuth(request, env))) return unauthorized();

    const url = new URL(request.url);

    if (url.pathname === "/api/sync" && request.method === "POST") {
      try {
        const snap = await buildSnapshot(env);
        await env.MODOGOD_CACHE.put("snapshot", JSON.stringify(snap));
        return json({ ok: true, generated_at: snap.generated_at });
      } catch (e) {
        return json({ ok: false, error: String((e && e.message) || e) }, 500);
      }
    }

    if (url.pathname === "/api/snapshot" && request.method === "GET") {
      let cached = await env.MODOGOD_CACHE.get("snapshot");
      if (!cached) {
        try {
          const snap = await buildSnapshot(env);
          cached = JSON.stringify(snap);
          await env.MODOGOD_CACHE.put("snapshot", cached);
        } catch (e) {
          return json({ error: String((e && e.message) || e) }, 500);
        }
      }
      return new Response(cached, {
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
