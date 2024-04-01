const a = {}, l = {};
let u = !1, i;
const f = async (e) => {
  const { pathname: s } = new URL(e.url || "", "wss://base.url"), r = a[s];
  if (r)
    if (u) {
      let n = l[s];
      n || (n = new i({ noServer: !0 }), l[s] = n, n.on("connection", (t) => {
        r(t, t);
      })), n.handleUpgrade(e, socket, head, (t) => {
        n.emit("connection", t, e);
      });
    } else {
      const n = e.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const t = new WebSocketPair(), o = t[0], c = t[1];
      return c.accept(), r(c, o), new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: o
      });
    }
}, d = globalThis;
function p() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, s) {
      if (s.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
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
      var s;
      u = !0, i || new Promise((r) => {
        const n = () => {
          if (!e.ws) {
            setTimeout(n);
            return;
          }
          const t = function(o) {
            r(i = this.constructor), e.ws.off("connection", t);
          };
          e.ws.on("connection", t);
        };
        n();
      }), (s = e.httpServer) == null || s.on("upgrade", async (r, n, t) => {
        const o = d.__serverHandle;
        o && await o(r);
      });
    }
  };
}
const w = (e, s) => {
  a[e] = s;
}, h = (e) => {
  delete a[e];
};
export {
  w as bind,
  p as default,
  f as handle,
  h as unbind
};
