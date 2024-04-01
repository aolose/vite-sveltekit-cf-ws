const u = {}, p = {};
let c;
const h = async (e, n, i) => {
  var f;
  const o = (f = e == null ? void 0 : e.headers) == null ? void 0 : f.get("Upgrade");
  if (console.log({
    socket: !!n,
    url: e.url,
    upgradeHeader: !!o,
    isSocket: o === "websocket"
  }), !n && o !== "websocket")
    return;
  const { pathname: s } = new URL(e.url || "", "wss://base.url"), r = u[s];
  if (r || l(`no ws handle  for path: ${s}`), r)
    if (n) {
      let t = p[s];
      t || (t = new c({ noServer: !0 }), p[s] = t, t.on("connection", (a) => {
        r(a, a);
      })), t.handleUpgrade(e, n, i, (a) => {
        t.emit("connection", a, e);
      });
    } else
      try {
        const t = new WebSocketPair(), a = t[0], d = t[1];
        return d.accept(), r(d, a), new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: a
        });
      } catch (t) {
        t instanceof Error && l("error:" + t.toString());
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
      c || new Promise((i) => {
        const o = () => {
          if (!e.ws) {
            setTimeout(o);
            return;
          }
          const s = function(r) {
            i(c = this.constructor), e.ws.off("connection", s);
          };
          e.ws.on("connection", s);
        };
        o();
      }), (n = e.httpServer) == null || n.on("upgrade", async (i, o, s) => {
        const r = w.__serverHandle;
        r && await r(i, o, s);
      });
    }
  };
}
const v = (e, n) => {
  n && (u[e] = n);
}, b = (e) => {
  delete u[e];
};
let l = (e) => {
};
const m = (e) => {
  l = e;
};
export {
  v as bind,
  g as default,
  h as handle,
  b as unbind,
  m as watchLog
};
