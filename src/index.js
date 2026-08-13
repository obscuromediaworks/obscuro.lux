// Redirige lux.obscuromediaworks.com.ar al apex, sección /#/lux -- ver
// decisions.json (id lux-subdomain-scope) y studio/games/obscuro-lux.md.
// Todo lo demás lo sirve deploy/ tal cual (mismo comportamiento que antes).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "lux.obscuromediaworks.com.ar") {
      const dest = new URL("https://obscuromediaworks.com.ar/");
      dest.hash = "/lux";
      return Response.redirect(dest.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
