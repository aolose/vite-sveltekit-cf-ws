let f;
const h = async (e, t, n) => {
  var u;
  if ((e.headers.upgrade || ((u = e == null ? void 0 : e.headers) == null ? void 0 : u.get("Upgrade"))) !== "websocket" && !t)
    return;
  let o;
  return d && await d(e, () => {
    if (t) {
      const i = new f({ noServer: !0 });
      let r;
      const a = [];
      return new Proxy(
        {},
        {
          get(p, l, v) {
            return l === "accept" ? () => {
              i.once("connection", (c) => {
                r = c, a.length && (a.forEach(([g, ...w]) => {
                  r[g](...w);
                }), a.length = 0);
              }), i.handleUpgrade(e, t, n, (c) => {
                i.emit("connection", c, e);
              });
            } : r ? Reflect.get(r, l, r) : (...c) => {
              a.push([l, ...c]);
            };
          }
        }
      );
    } else {
      const i = globalThis, r = new i.WebSocketPair(), a = r[0], p = r[1];
      return o = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: a
      }), p;
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
      f || new Promise((n) => {
        const s = () => {
          if (!e.ws) {
            setTimeout(s);
            return;
          }
          const o = function(u) {
            n(f = this.constructor), e.ws.off("connection", o);
          };
          e.ws.on("connection", o);
        };
        s();
      }), (t = e.httpServer) == null || t.on("upgrade", async (n, s, o) => {
        await h(n, s, o);
      });
    }
  };
}
let d;
const S = (e) => {
  d = e;
};
export {
  m as default,
  h as handle,
  S as handleUpgrade
};
