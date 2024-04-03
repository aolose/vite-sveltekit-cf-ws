let l;
const h = async (e, n, t) => {
  var d;
  if ((e.headers.upgrade || ((d = e == null ? void 0 : e.headers) == null ? void 0 : d.get("Upgrade"))) !== "websocket" && !n)
    return;
  let a;
  return f && await f(e, () => {
    if (n) {
      const c = new l({ noServer: !0 });
      let r;
      const s = [];
      return new Proxy(
        {},
        {
          get(g, u, v) {
            return u === "accept" ? () => {
              c.once("connection", (i) => {
                r = i, s.length && (s.forEach(([p, ...w]) => {
                  r[p](...w);
                }), s.length = 0);
              }), c.handleUpgrade(e, n, t, (i) => {
                c.emit("connection", i, e);
              });
            } : r ? Reflect.get(r, u, r) : (...i) => {
              s.push([u, ...i]);
            };
          }
        }
      );
    } else {
      const c = globalThis, r = new c.WebSocketPair(), s = r[0], g = r[1];
      return a = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: s
      }), g;
    }
  }), a;
};
function m() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, n) {
      if (n.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        const t = "async respond(request, options) {";
        return e = 'import {dev} from "$app/environment";import {handle} from "vite-sveltekit-cf-ws";' + e.replace(
          t,
          `${t}if(!dev){const res = await handle(request);if(res)return res}`
        ), { code: e };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      if (!l) {
        const t = () => {
          if (!e.ws) {
            setTimeout(t);
            return;
          }
          const o = function(a) {
            l = this.constructor, e.ws.off("connection", o);
          };
          e.ws.on("connection", o);
        };
        t();
      }
      (n = e.httpServer) == null || n.on("upgrade", async (t, o, a) => {
        await h(t, o, a);
      });
    }
  };
}
let f;
const S = (e) => {
  f = e;
};
export {
  m as default,
  h as handle,
  S as handleUpgrade
};
