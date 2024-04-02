let l;
const p = async (e, n, t) => {
  var o;
  const r = e.headers.upgrade || ((o = e == null ? void 0 : e.headers) == null ? void 0 : o.get("Upgrade"));
  if (!n && r !== "websocket")
    return;
  new URL(e.url || "", "wss://base.url");
  let s;
  return c && await c(e, () => {
    if (n && t) {
      const a = new l({ noServer: !0 });
      return a.handleUpgrade(e, n, t, (i) => {
        a.emit("connection", i, e);
      }), a;
    } else {
      const a = new WebSocketPair(), i = a[0], u = a[1];
      return s = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: i
      }), u;
    }
  }), s;
}, d = globalThis;
function f() {
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
        const t = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: t };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      l || new Promise((t) => {
        const r = () => {
          if (!e.ws) {
            setTimeout(r);
            return;
          }
          const s = function(o) {
            t(l = this.constructor), e.ws.off("connection", s);
          };
          e.ws.on("connection", s);
        };
        r();
      }), (n = e.httpServer) == null || n.on("upgrade", async (t, r, s) => {
        const o = d.__serverHandle;
        o && await o(t, r, s);
      });
    }
  };
}
let c;
const w = (e) => {
  c = e;
};
export {
  f as default,
  p as handle,
  w as handleUpgrade
};
