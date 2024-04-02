let g;
const v = async (e, n, r) => {
  var d;
  if ((e.headers.upgrade || ((d = e == null ? void 0 : e.headers) == null ? void 0 : d.get("Upgrade"))) !== "websocket" && !n)
    return;
  let o;
  return w && await w(e, () => {
    if (n) {
      const u = new g({ noServer: !0 });
      let t;
      const i = [];
      let c;
      return new Proxy({}, {
        get(m, l, S) {
          if (l === "accept")
            return () => {
              u.once("connection", (a) => {
                t = a, i.length && (i.forEach(([f, h, p]) => {
                  t[f](h, p);
                }), i.length = 0), c && t.close(c[0], c[1]);
              }), u.handleUpgrade(e, n, r, (a) => {
                u.emit("connection", a, e);
              });
            };
          if (t)
            return Reflect.get(t, l, t);
          if (l === "close")
            return (a, f) => {
              c = [a, f];
            };
          if (l === "addEventListener" || l === "removeEventListener")
            return (a, f) => {
              i.push([l, a, f]);
            };
        }
      });
    } else {
      const u = globalThis, t = new u.WebSocketPair(), i = t[0], c = t[1];
      return o = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: i
      }), c;
    }
  }), o;
};
function b() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, n) {
      if (n.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        const r = "async respond(request, options) {";
        e = `
                import {dev} from "$app/environment";
                import {handle} from "vite-sveltekit-cf-ws";
` + e.replace(r, `${r}
if(!dev)return  await handle(request)`);
        const s = this.parse(e);
        return { code: e, ast: s };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      g || new Promise((r) => {
        const s = () => {
          if (!e.ws) {
            setTimeout(s);
            return;
          }
          const o = function(d) {
            r(g = this.constructor), e.ws.off("connection", o);
          };
          e.ws.on("connection", o);
        };
        s();
      }), (n = e.httpServer) == null || n.on("upgrade", async (r, s, o) => {
        await v(r, s, o);
      });
    }
  };
}
let w;
const k = (e) => {
  w = e;
};
export {
  b as default,
  v as handle,
  k as handleUpgrade
};
