let a;
const v = async (e, n, r) => {
  var g;
  if ((e.headers.upgrade || ((g = e == null ? void 0 : e.headers) == null ? void 0 : g.get("Upgrade"))) !== "websocket" || a && !n)
    return;
  let c;
  return f && await f(e, () => {
    if (a) {
      const i = new a({ noServer: !0 });
      let t;
      const s = [];
      return new Proxy(
        {},
        {
          get(h, l, S) {
            return l === "accept" ? () => {
              i.handleUpgrade(e, n, r, (u) => {
                t = u, s.length && (s.forEach(([p, ...w]) => {
                  t[p](...w);
                }), s.length = 0);
              });
            } : t ? Reflect.get(t, l, t) : (...u) => {
              s.push([l, ...u]);
            };
          }
        }
      );
    } else {
      const i = globalThis, t = new i.WebSocketPair(), s = t[0], h = t[1];
      return c = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: s
      }), h;
    }
  }), c;
};
function k() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, n) {
      if (n.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        const r = "async respond(request, options) {";
        return e = 'import {handle} from "vite-sveltekit-cf-ws";' + e.replace(
          r,
          `${r}const res = await handle(request);if(res)return res;`
        ), { code: e };
      }
      return null;
    },
    async configureServer(e) {
      var r;
      const n = function(o) {
        e.ws.off("connection", n), a = this.constructor;
      };
      e.ws.on("connection", n), (r = e.httpServer) == null || r.on("upgrade", async (o, c, d) => {
        a && await v(o, c, d);
      });
    }
  };
}
let f;
const b = (e) => {
  f = e;
};
export {
  k as default,
  v as handle,
  b as handleUpgrade
};
