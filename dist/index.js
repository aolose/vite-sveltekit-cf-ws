const l = {}, f = {};
let a;
const w = async (e, s, o) => {
  const { pathname: r } = new URL(e.url || "", "wss://base.url"), t = l[r];
  if (i(`fn: ${t == null ? void 0 : t.toString()}`), t)
    if (s) {
      let n = f[r];
      n || (n = new a({ noServer: !0 }), f[r] = n, n.on("connection", (c) => {
        t(c, c);
      })), n.handleUpgrade(e, s, o, (c) => {
        n.emit("connection", c, e);
      });
    } else {
      i("use cloudflare ws");
      try {
        const n = e.headers.get("Upgrade");
        if (!n || n !== "websocket")
          return;
        const c = new WebSocketPair(), u = c[0], d = c[1];
        return i("serv accept"), d.accept(), i("serv accepted"), t(d, u), new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: u
        });
      } catch (n) {
        n instanceof Error && i(n.toString());
      }
    }
}, p = globalThis;
function h() {
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
        const o = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: o };
      }
      return null;
    },
    async configureServer(e) {
      var s;
      a || new Promise((o) => {
        const r = () => {
          if (!e.ws) {
            setTimeout(r);
            return;
          }
          const t = function(n) {
            o(a = this.constructor), e.ws.off("connection", t);
          };
          e.ws.on("connection", t);
        };
        r();
      }), (s = e.httpServer) == null || s.on("upgrade", async (o, r, t) => {
        const n = p.__serverHandle;
        n && await n(o, r, t);
      });
    }
  };
}
const v = (e, s) => {
  l[e] = s;
}, g = (e) => {
  delete l[e];
};
let i = (e) => {
};
const m = (e) => {
  i = e;
};
export {
  v as bind,
  h as default,
  w as handle,
  g as unbind,
  m as watchLog
};
