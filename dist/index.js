import { WebSocket as p } from "vite";
const i = p.Server, c = {}, w = (e, t) => {
  c[e] = t;
}, h = (e) => {
  delete c[e];
};
new i({ noServer: !0 });
const d = {}, b = async (e, t, s) => {
  const { pathname: o } = new URL(e.url || "", "wss://base.url"), a = c[o];
  if (a)
    if (t) {
      let n = d[o];
      n || (console.log({ WebSocketServer: i }), n = new i({ noServer: !0 }), d[o] = n, n.on("connection", (r) => {
        a(r, r);
      })), n.handleUpgrade(e, t, s, (r) => {
        n.emit("connection", r, e);
      });
    } else {
      const n = e.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const r = new WebSocketPair(), l = r[0], u = r[1];
      return u.accept(), a(u, l), new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: l
      });
    }
}, v = globalThis;
function S() {
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
        const s = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: s };
      }
      return null;
    },
    async configureServer(e) {
      var t;
      (t = e.httpServer) == null || t.on("upgrade", async (s, o, a) => {
        const n = v.__serverHandle;
        n && await n(s, o, a);
      });
    }
  };
}
export {
  w as bind,
  S as default,
  b as handle,
  h as unbind
};
