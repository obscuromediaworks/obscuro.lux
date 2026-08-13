#!/usr/bin/env node
// Rebuilds deploy/index.html — the self-decompressing bundle that the Worker
// `obscuro-lux-site` serves — from site.html + the local .jsx sources + assets/.
//
// Format (reverse-engineered from the live deploy/index.html on 2026-08-12,
// see DEPLOY.md "Como se regenera deploy/index.html"): a static "unpacker"
// shell (WRAPPER_HEAD/WRAPPER_TAIL below, copied byte-for-byte from the
// working production bundle — nothing in this file changes that runtime
// logic) plus three <script type="__bundler/..."> data islands:
//   - manifest: { uuid: { mime, compressed: true, data: base64(gzip(bytes)) } }
//     for every external CDN script, every local .jsx, and every Google
//     Fonts woff2 the page uses.
//   - ext_resources: reserved for images/fonts referenced by id from JS
//     (unused today — site.html has none — kept as [] for format parity).
//   - template: JSON-stringified copy of site.html with each external/local
//     script `src=` and each @font-face `url()` replaced by the uuid that
//     holds its bytes. At load time the wrapper's own inline <script>
//     decompresses every blob, substitutes the uuids back into the template
//     string as blob: URLs, and swaps <html> for the result via DOMParser.
//
// Usage:
//   node scripts/build-site.mjs                    # writes deploy/index.html + syncs deploy/assets/
//   node scripts/build-site.mjs --out=path.html     # writes elsewhere instead (dry run, no assets sync)
//
// Requires network access (fetches React/ReactDOM/Babel standalone from
// unpkg and the Google Fonts woff2 files) and Node's global fetch (Node 18+).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_HTML_PATH = path.join(ROOT, 'site.html');

// A desktop-Chrome UA: Google Fonts serves woff2 (what DecompressionStream /
// every modern browser actually wants) only to UAs it recognizes as modern.
const MODERN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ---------------------------------------------------------------------------
// The unpacker shell. Copied verbatim from the production deploy/index.html
// (2026-08-12) — this is proven-working runtime code, not something this
// build re-derives. __TITLE__ and __THUMBNAIL_DIV__ are the only variable
// bits, both sourced from site.html at build time.
// ---------------------------------------------------------------------------

const WRAPPER_HEAD = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>__TITLE__</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #faf9f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #__bundler_loading { position: fixed; bottom: 20px; right: 20px; font: 13px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; color: #666; background: #fff; padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.12); z-index: 10000; }
    #__bundler_thumbnail { position: fixed; inset: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #faf9f5; z-index: 9999; }
    #__bundler_thumbnail svg { width: 100%; height: 100%; object-fit: contain; }
    #__bundler_placeholder { color: #999; font-size: 14px; }
  </style>
  <noscript>
    <style>#__bundler_loading { display: none; }</style>
    <div style="position:fixed;bottom:12px;left:12px;font:13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;color:#999;background:rgba(255,255,255,0.9);padding:6px 12px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.08);z-index:10000;">
      This page requires JavaScript to display.
    </div>
  </noscript>
</head>
<body>
__THUMBNAIL_DIV__
  <div id="__bundler_loading">Unpacking...</div>

  <script>
    
document.addEventListener('DOMContentLoaded', async function() {
  const loading = document.getElementById('__bundler_loading');
  function setStatus(msg) { if (loading) loading.textContent = msg; }

  // Error sink persists across replaceWith since it's on window, not the DOM.
  window.addEventListener('error', function(e) {
    var p = document.body || document.documentElement;
    var d = document.getElementById('__bundler_err') || p.appendChild(document.createElement('div'));
    d.id = '__bundler_err';
    d.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;font:12px/1.4 ui-monospace,monospace;background:#2a1215;color:#ff8a80;padding:10px 14px;border-radius:8px;border:1px solid #5c2b2e;z-index:99999;white-space:pre-wrap;max-height:40vh;overflow:auto';
    d.textContent = (d.textContent ? d.textContent + String.fromCharCode(10) : '') +
      '[bundle] ' + (e.message || e.type) +
      (e.filename ? ' (' + e.filename.slice(0, 60) + ':' + e.lineno + ')' : '');
  }, true);

  try {
    const manifestEl = document.querySelector('script[type="__bundler/manifest"]');
    const templateEl = document.querySelector('script[type="__bundler/template"]');
    if (!manifestEl || !templateEl) {
      setStatus('Error: missing bundle data');
      console.error('[bundler] Missing script tags — manifestEl:', !!manifestEl, 'templateEl:', !!templateEl);
      return;
    }

    const manifest = JSON.parse(manifestEl.textContent);
    let template = JSON.parse(templateEl.textContent);

    const uuids = Object.keys(manifest);
    setStatus('Unpacking ' + uuids.length + ' assets...');

    const blobUrls = {};
    await Promise.all(uuids.map(async (uuid) => {
      const entry = manifest[uuid];
      try {
        const binaryStr = atob(entry.data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

        let finalBytes = bytes;
        if (entry.compressed) {
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('gzip');
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();
            writer.write(bytes);
            writer.close();
            const chunks = [];
            let totalLen = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              totalLen += value.length;
            }
            finalBytes = new Uint8Array(totalLen);
            let offset = 0;
            for (const chunk of chunks) { finalBytes.set(chunk, offset); offset += chunk.length; }
          } else {
            console.warn('DecompressionStream not available, asset ' + uuid + ' may not render');
          }
        }

        blobUrls[uuid] = URL.createObjectURL(new Blob([finalBytes], { type: entry.mime }));
      } catch (err) {
        console.error('Failed to decode asset ' + uuid + ':', err);
        blobUrls[uuid] = URL.createObjectURL(new Blob([], { type: entry.mime }));
      }
    }));

    const extResEl = document.querySelector('script[type="__bundler/ext_resources"]');
    const extResources = extResEl ? JSON.parse(extResEl.textContent) : [];
    const resourceMap = {};
    for (const entry of extResources) {
      if (blobUrls[entry.uuid]) resourceMap[entry.id] = blobUrls[entry.uuid];
    }

    setStatus('Rendering...');
    for (const uuid of uuids) template = template.split(uuid).join(blobUrls[uuid]);

    // Strip integrity + crossorigin — blob URLs from a file:// document inherit
    // a null origin, so crossorigin forces a CORS fetch that SRI then rejects.
    // The manifest bytes are ours; SRI protects against CDN compromise, not this.
    template = template.replace(/\\s+integrity="[^"]*"/gi, '').replace(/\\s+crossorigin="[^"]*"/gi, '');

    const resourceScript = '<script>window.__resources = ' +
      JSON.stringify(resourceMap).split('</' + 'script>').join('<\\\\/' + 'script>') +
      ';</' + 'script>';
    // Inject after <head> so the DOCTYPE stays first; prepending the script
    // would push the parser into quirks mode. DOMParser always emits a <head>
    // (synthesizing one if the source HTML omitted it) but may carry
    // attributes through, so match the full opening tag. slice() rather than
    // replace() keeps us clear of $-pattern substitution in resourceScript.
    const headOpen = template.match(/<head[^>]*>/i);
    if (headOpen) {
      const i = headOpen.index + headOpen[0].length;
      template = template.slice(0, i) + resourceScript + template.slice(i);
    }

    // Parse the template and swap the root element. Scripts inserted via
    // DOMParser/replaceWith are inert per spec — re-create each with
    // createElement so they execute, awaiting onload for src scripts to
    // preserve ordering (React before ReactDOM before Babel before text/babel).
    const doc = new DOMParser().parseFromString(template, 'text/html');
    document.documentElement.replaceWith(doc.documentElement);
    const dead = Array.from(document.scripts);
    for (const old of dead) {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      // text/babel scripts with a src: fetch and inline. transformScriptTags
      // does XHR against the src, but blob:null/ from a file:// origin is
      // silently dropped. Inlining makes it a plain inline babel script,
      // which transformScriptTags handles unconditionally.
      if ((s.type === 'text/babel' || s.type === 'text/jsx') && s.src) {
        const r = await fetch(s.src);
        s.textContent = await r.text();
        s.removeAttribute('src');
      }
      const p = s.src ? new Promise(function(r) { s.onload = s.onerror = r; }) : null;
      old.replaceWith(s);
      if (p) await p;
    }
    // Babel standalone auto-transforms type=text/babel on DOMContentLoaded,
    // which fired before we swapped the document. Trigger manually if present.
    if (window.Babel && typeof window.Babel.transformScriptTags === 'function') {
      window.Babel.transformScriptTags();
    }
  } catch (err) {
    setStatus('Error unpacking: ' + err.message);
    console.error('Bundle unpack error:', err);
  }
});

  </script>
`;

const WRAPPER_TAIL = `</body>
</html>`;

// ---------------------------------------------------------------------------
// Blob helpers
// ---------------------------------------------------------------------------

function addBlob(manifest, mime, bytes) {
  const uuid = randomUUID();
  manifest[uuid] = {
    mime,
    compressed: true,
    data: gzipSync(Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)).toString('base64'),
  };
  return uuid;
}

// HTML-parser-safe: a literal "</script>" inside a script tag's text content
// closes the tag early, wherever it sits — including inside our JSON-encoded
// template string, which contains real </script> tags from the page markup.
// Matches the escaping already proven in the production bundle.
function escapeScriptClose(jsonString) {
  return jsonString.replace(/<\/script>/gi, '<\\u002Fscript>');
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const outArg = args.find((a) => a.startsWith('--out='));
  const outPath = outArg
    ? path.resolve(ROOT, outArg.slice('--out='.length))
    : path.join(ROOT, 'deploy', 'index.html');
  const isRealDeploy = outPath === path.join(ROOT, 'deploy', 'index.html');

  let html = readFileSync(SITE_HTML_PATH, 'utf8');
  const manifest = {};

  // 1. Loading thumbnail: <template id="__bundler_thumbnail">…</template> in
  //    site.html becomes the wrapper's own #__bundler_thumbnail div (shown
  //    before any JS runs) and is removed from the packed document — the
  //    wrapper already renders it outside the unpacked template.
  const thumbRe = /<template id="__bundler_thumbnail">([\s\S]*?)<\/template>\s*/;
  const thumbMatch = html.match(thumbRe);
  if (!thumbMatch) {
    throw new Error('site.html: missing <template id="__bundler_thumbnail">…</template>');
  }
  const thumbnailDiv = '  <div id="__bundler_thumbnail">' + thumbMatch[1] + '</div>';
  html = html.slice(0, thumbMatch.index) + html.slice(thumbMatch.index + thumbMatch[0].length);

  // 2. Title for the wrapper's own <head>, shown while the bundle unpacks.
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Obscuro Mediaworks';

  // 3. Google Fonts <link href="https://fonts.googleapis.com/css2?…"> becomes
  //    an inline <style> with @font-face rules pointing at self-hosted woff2
  //    blobs — no network call needed once the bundle has unpacked.
  const fontsLinkRe = /<link[^>]+href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"[^>]*>\s*/;
  const fontsLinkMatch = html.match(fontsLinkRe);
  if (fontsLinkMatch) {
    const cssUrl = fontsLinkMatch[1].replace(/&amp;/g, '&');
    console.log(`Fetching Google Fonts CSS: ${cssUrl}`);
    const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': MODERN_UA } });
    if (!cssRes.ok) throw new Error(`fonts.googleapis.com responded ${cssRes.status}`);
    let cssText = await cssRes.text();

    const fontUrls = [...new Set([...cssText.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))];
    console.log(`  ${fontUrls.length} woff2 files to inline`);
    for (const url of fontUrls) {
      const fontRes = await fetch(url);
      if (!fontRes.ok) throw new Error(`${url} responded ${fontRes.status}`);
      const bytes = Buffer.from(await fontRes.arrayBuffer());
      const uuid = addBlob(manifest, 'font/woff2', bytes);
      cssText = cssText.split(url).join(uuid);
    }

    html =
      html.slice(0, fontsLinkMatch.index) +
      `<style>${cssText}</style>\n` +
      html.slice(fontsLinkMatch.index + fontsLinkMatch[0].length);
  } else {
    console.log('No Google Fonts <link> found in site.html — skipping font inlining.');
  }

  // 4. External CDN <script src="https://…">: fetch once per unique URL,
  //    inline as a text/javascript blob, keep every other attribute as-is
  //    (integrity/crossorigin get stripped by the runtime at unpack time).
  const extScriptRe = /<script\s+src="(https:\/\/[^"]+)"([^>]*)><\/script>/g;
  const extUrls = [...new Set([...html.matchAll(extScriptRe)].map((m) => m[1]))];
  const extUuidByUrl = {};
  for (const url of extUrls) {
    console.log(`Fetching external script: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    extUuidByUrl[url] = addBlob(manifest, 'text/javascript', bytes);
  }
  html = html.replace(extScriptRe, (full, url, rest) => `<script src="${extUuidByUrl[url]}"${rest}></script>`);

  // 5. Local <script type="text/babel" src="foo.jsx">: read from disk
  //    relative to the repo root, inline as an application/javascript blob.
  const jsxScriptRe = /<script type="text\/babel" src="([^"]+)"><\/script>/g;
  let jsxCount = 0;
  html = html.replace(jsxScriptRe, (full, relPath) => {
    const abs = path.join(ROOT, relPath);
    const src = readFileSync(abs, 'utf8');
    const uuid = addBlob(manifest, 'application/javascript', Buffer.from(src, 'utf8'));
    jsxCount++;
    return `<script type="text/babel" src="${uuid}"></script>`;
  });
  console.log(`Inlined ${jsxCount} local .jsx source files`);

  // ext_resources: reserved for id-addressed resources pulled in from JS
  // (window.__resources). site.html doesn't reference any today.
  const extResources = [];

  const wrapperHead = WRAPPER_HEAD.replace('__TITLE__', title).replace('__THUMBNAIL_DIV__', thumbnailDiv);

  const manifestScript = `  <script type="__bundler/manifest">\n${JSON.stringify(manifest)}\n  </script>\n\n`;
  const extResScript = `  <script type="__bundler/ext_resources">\n${JSON.stringify(extResources)}\n  </script>\n\n`;
  const templateScript = `  <script type="__bundler/template">\n${escapeScriptClose(JSON.stringify(html))}\n  </script>\n`;

  const out = wrapperHead + manifestScript + extResScript + templateScript + WRAPPER_TAIL;

  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath} (${(out.length / 1024 / 1024).toFixed(2)} MB, ${Object.keys(manifest).length} manifest entries)`);

  // 6. Mirror assets/ into <output dir>/assets/ — deploy/index.html
  //    references these by plain relative path, they're served as-is by the
  //    Worker (never inlined into the bundle).
  const assetsSrc = path.join(ROOT, 'assets');
  const assetsDest = path.join(path.dirname(outPath), 'assets');
  try {
    const files = readdirSync(assetsSrc).filter((f) => statSync(path.join(assetsSrc, f)).isFile());
    mkdirSync(assetsDest, { recursive: true });
    for (const f of files) copyFileSync(path.join(assetsSrc, f), path.join(assetsDest, f));
    console.log(`Synced ${files.length} file(s) from assets/ to ${assetsDest}`);
  } catch (err) {
    console.warn(`Skipped assets/ sync: ${err.message}`);
  }

  if (!isRealDeploy) {
    console.log('\n--out was given: this did NOT touch the real deploy/index.html.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
