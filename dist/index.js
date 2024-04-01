import { WebSocket as v } from "vite";
var p;
const f = ((p = v) == null ? void 0 : p.Server) || class {
}, c = f;
new c();
const i = {}, d = {}, b = async (e, t, r) => {
  const { pathname: o } = new URL(e.url || "", "wss://base.url"), a = i[o];
  if (a)
    if (t) {
      let n = d[o];
      n || (console.log({ WebSocketServer: c }), n = new c({ noServer: !0 }), d[o] = n, n.on("connection", (s) => {
        a(s, s);
      })), n.handleUpgrade(e, t, r, (s) => {
        n.emit("connection", s, e);
      });
    } else {
      const n = e.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const s = new WebSocketPair(), l = s[0], u = s[1];
      return u.accept(), a(u, l), new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: l
      });
    }
}, w = globalThis;
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
        const r = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: r };
      }
      return null;
    },
    async configureServer(e) {
      var t;
      (t = e.httpServer) == null || t.on("upgrade", async (r, o, a) => {
        const n = w.__serverHandle;
        n && await n(r, o, a);
      });
    }
  };
}
const m = (e, t) => {
  i[e] = t;
}, g = (e) => {
  delete i[e];
};
export {
  m as bind,
  S as default,
  b as handle,
  g as unbind
};
