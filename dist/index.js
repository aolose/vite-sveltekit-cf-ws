const l = {}, u = {}, p = async (e, t, o) => {
  const { pathname: a } = new URL(e.url || "", "wss://base.url"), i = l[a];
  if (i)
    if (t) {
      let n = u[a];
      const { WebSocket: r } = await import("vite"), c = r == null ? void 0 : r.Server;
      if (!c)
        return;
      n || (n = new c({ noServer: !0 }), u[a] = n, n.on("connection", (s) => {
        i(s, s);
      })), n.handleUpgrade(e, t, o, (s) => {
        n.emit("connection", s, e);
      });
    } else {
      const n = e.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const r = new WebSocketPair(), c = r[0], s = r[1];
      return s.accept(), i(s, c), new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: c
      });
    }
}, d = globalThis;
function f() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, t) {
      if (t.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
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
        const o = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: o };
      }
      return null;
    },
    async configureServer(e) {
      var t;
      (t = e.httpServer) == null || t.on("upgrade", async (o, a, i) => {
        const n = d.__serverHandle;
        n && await n(o, a, i);
      });
    }
  };
}
const v = (e, t) => {
  l[e] = t;
}, w = (e) => {
  delete l[e];
};
export {
  v as bind,
  f as default,
  p as handle,
  w as unbind
};
