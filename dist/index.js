const u = {}, p = {};
let l;
const h = async (e, n, i) => {
  var f;
  const r = e.headers.upgrade || ((f = e == null ? void 0 : e.headers) == null ? void 0 : f.get("Upgrade"));
  if (c(JSON.stringify({
    socket: !!n,
    url: e.url,
    upgradeHeader: !!r,
    isSocket: r === "websocket"
  })), !n && r !== "websocket")
    return;
  const { pathname: s } = new URL(e.url || "", "wss://base.url"), o = u[s];
  if (o || c(`no ws handle  for path: ${s}`), o)
    if (n) {
      let t = p[s];
      t || (t = new l({ noServer: !0 }), p[s] = t, t.on("connection", (a) => {
        o(a, a);
      })), t.handleUpgrade(e, n, i, (a) => {
        t.emit("connection", a, e);
      });
    } else
      try {
        const t = new WebSocketPair(), a = t[0], d = t[1];
        return d.accept(), o(d, a), new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: a
        });
      } catch (t) {
        t instanceof Error && c("error:" + t.toString());
      }
}, w = globalThis;
function g() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, n) {
      if (n.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
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
        const i = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: i };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      l || new Promise((i) => {
        const r = () => {
          if (!e.ws) {
            setTimeout(r);
            return;
          }
          const s = function(o) {
            i(l = this.constructor), e.ws.off("connection", s);
          };
          e.ws.on("connection", s);
        };
        r();
      }), (n = e.httpServer) == null || n.on("upgrade", async (i, r, s) => {
        const o = w.__serverHandle;
        o && await o(i, r, s);
      });
    }
  };
}
const v = (e, n) => {
  n && (u[e] = n);
}, b = (e) => {
  delete u[e];
};
let c = (e) => {
};
const m = (e) => {
  c = e;
};
export {
  v as bind,
  g as default,
  h as handle,
  b as unbind,
  m as watchLog
};
