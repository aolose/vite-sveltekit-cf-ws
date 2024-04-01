const l = {}, d = {};
let i;
const f = async (t, e, o) => {
  const { pathname: r } = new URL(t.url || "", "wss://base.url"), a = l[r];
  if (a)
    if (e) {
      let n = d[r];
      if (!i)
        return;
      n || (n = new i({ noServer: !0 }), d[r] = n, n.on("connection", (s) => {
        a(s, s);
      })), n.handleUpgrade(t, e, o, (s) => {
        n.emit("connection", s, t);
      });
    } else {
      const n = t.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const s = new WebSocketPair(), c = s[0], u = s[1];
      return u.accept(), a(u, c), new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: c
      });
    }
}, p = globalThis;
function v(t) {
  return i = t, {
    name: "svelte-kit-websocket",
    async transform(e, o) {
      if (o.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        e = `import {dev} from "$app/environment";
					import {handle} from "vite-sveltekit-cf-ws"
					` + e.replace(
          "async respond(request, options) {",
          `
                async respond(request, options) {
                    if(handle){
                      if(dev)globalThis.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `
        );
        const r = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: r };
      }
      return null;
    },
    async configureServer(e) {
      var o;
      (o = e.httpServer) == null || o.on("upgrade", async (r, a, n) => {
        const s = p.__serverHandle;
        s && await s(r, a, n);
      });
    }
  };
}
const h = (t, e) => {
  l[t] = e;
}, w = (t) => {
  delete l[t];
};
export {
  h as bind,
  v as default,
  f as handle,
  w as unbind
};
