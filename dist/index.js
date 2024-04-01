const u = {}, p = {};
let c;
const h = async (e, t, r) => {
  var f;
  const i = (f = e == null ? void 0 : e.headers) == null ? void 0 : f.get("Upgrade");
  if (!t || !i || i !== "websocket")
    return;
  const { pathname: s } = new URL(e.url || "", "wss://base.url"), o = u[s];
  if (o || l(`no ws handle  for path: ${s}`), o)
    if (t) {
      let n = p[s];
      n || (n = new c({ noServer: !0 }), p[s] = n, n.on("connection", (a) => {
        o(a, a);
      })), n.handleUpgrade(e, t, r, (a) => {
        n.emit("connection", a, e);
      });
    } else
      try {
        const n = new WebSocketPair(), a = n[0], d = n[1];
        return d.accept(), o(d, a), new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: a
        });
      } catch (n) {
        n instanceof Error && l("error:" + n.toString());
      }
}, w = globalThis;
function v() {
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
      c || new Promise((r) => {
        const i = () => {
          if (!e.ws) {
            setTimeout(i);
            return;
          }
          const s = function(o) {
            r(c = this.constructor), e.ws.off("connection", s);
          };
          e.ws.on("connection", s);
        };
        i();
      }), (t = e.httpServer) == null || t.on("upgrade", async (r, i, s) => {
        const o = w.__serverHandle;
        o && await o(r, i, s);
      });
    }
  };
}
const g = (e, t) => {
  t && (u[e] = t);
}, m = (e) => {
  delete u[e];
};
let l = (e) => {
};
const b = (e) => {
  l = e;
};
export {
  g as bind,
  v as default,
  h as handle,
  m as unbind,
  b as watchLog
};
