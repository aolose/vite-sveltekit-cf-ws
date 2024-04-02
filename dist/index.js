let l;
const w = async (e, t, n) => {
  var u;
  if ((e.headers.upgrade || ((u = e == null ? void 0 : e.headers) == null ? void 0 : u.get("Upgrade"))) !== "websocket" && !t)
    return;
  let o;
  return f && await f(e, () => {
    if (t) {
      const c = new l({ noServer: !0 });
      let r;
      const a = [];
      return new Proxy(
        {},
        {
          get(d, p, v) {
            return p === "accept" ? () => {
              c.once("connection", (i) => {
                r = i, a.length && (a.forEach(([g, ...h]) => {
                  try {
                    r[g](...h);
                  } catch {
                  }
                }), a.length = 0);
              }), c.handleUpgrade(e, t, n, (i) => {
                c.emit("connection", i, e);
              });
            } : r ? Reflect.get(r, p, r) : (...i) => {
              a.push(i);
            };
          }
        }
      );
    } else {
      const c = globalThis, r = new c.WebSocketPair(), a = r[0], d = r[1];
      return o = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: a
      }), d;
    }
  }), o;
};
function m() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, t) {
      if (t.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        const n = "async respond(request, options) {";
        e = `
                import {dev} from "$app/environment";
                import {handle} from "vite-sveltekit-cf-ws";
` + e.replace(
          n,
          `${n}
if(!dev){
                        const res = await handle(request)
                        if(res)return res
                    }`
        );
        const s = this.parse(e);
        return { code: e, ast: s };
      }
      return null;
    },
    async configureServer(e) {
      var t;
      l || new Promise((n) => {
        const s = () => {
          if (!e.ws) {
            setTimeout(s);
            return;
          }
          const o = function(u) {
            n(l = this.constructor), e.ws.off("connection", o);
          };
          e.ws.on("connection", o);
        };
        s();
      }), (t = e.httpServer) == null || t.on("upgrade", async (n, s, o) => {
        await w(n, s, o);
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
  w as handle,
  S as handleUpgrade
};
