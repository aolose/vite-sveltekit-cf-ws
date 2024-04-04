let o;
const v = async (e, n, r) => {
  var g;
  if ((e.headers.upgrade || ((g = e == null ? void 0 : e.headers) == null ? void 0 : g.get("Upgrade"))) !== "websocket" || o && !n)
    return;
  let i;
  return f && await f(e, () => {
    if (o) {
      const a = new o({ noServer: !0 });
      let t;
      const s = [];
      return new Proxy(
        {},
        {
          get(h, u, S) {
            return u === "accept" ? () => {
              a.once("connection", (c) => {
                t = c, s.length && (s.forEach(([p, ...w]) => {
                  t[p](...w);
                }), s.length = 0);
              }), a.handleUpgrade(e, n, r, (c) => {
                a.emit("connection", c, e);
              });
            } : t ? Reflect.get(t, u, t) : (...c) => {
              s.push([u, ...c]);
            };
          }
        }
      );
    } else {
      const a = globalThis, t = new a.WebSocketPair(), s = t[0], h = t[1];
      return i = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: s
      }), h;
    }
  }), i;
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
      const n = function(l) {
        e.ws.off("connection", n), o = this.constructor;
      };
      e.ws.on("connection", n), (r = e.httpServer) == null || r.on("upgrade", async (l, i, d) => {
        o && await v(l, i, d);
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
