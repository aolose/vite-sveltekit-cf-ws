let l;
const w = async (e, n, r) => {
  var u;
  const s = e.headers.upgrade || ((u = e == null ? void 0 : e.headers) == null ? void 0 : u.get("Upgrade"));
  if (!n && s !== "websocket")
    return;
  new URL(e.url || "", "wss://base.url");
  let a;
  return d && await d(e, () => {
    if (n && r) {
      const o = new l({ noServer: !0 }), c = {
        addEventListener: (t, i) => {
          o.addListener(t, i);
        },
        removeEventListener: (t, i) => {
          o.removeListener(t, i);
        },
        send(t) {
          o.send(t);
        }
      };
      return c.accept = () => {
        o.emit && o.handleUpgrade(e, n, r, (t) => {
          o.emit("connection", t, e);
        });
      }, c.close = (t, i) => {
        n.once("finish", n.destroy);
        const f = {
          Connection: "close",
          "Content-Type": "text/html",
          "Content-Length": Buffer.byteLength(i || "")
        };
        n.end(
          `HTTP/1.1 ${t}\r
` + Object.keys(f).map((p) => `${p}: ${f[p]}`).join(`\r
`) + `\r
\r
` + i
        );
      }, c;
    } else {
      const o = globalThis, c = new o.WebSocketPair(), t = c[0], i = c[1];
      return a = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: t
      }), i;
    }
  }), a;
};
function h() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, n) {
      if (n.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        const r = "async respond(request, options) {";
        e = 'import {dev} from "$app/environment";import {handle} from "vite-sveltekit-cf-ws"' + e.replace(r, r + `if(handle){
                        if(!dev){
                         const resp = await handle(request)
                         if(resp) return resp
                      }}`);
        const s = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: s };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      l || new Promise((r) => {
        const s = () => {
          if (!e.ws) {
            setTimeout(s);
            return;
          }
          const a = function(u) {
            r(l = this.constructor), e.ws.off("connection", a);
          };
          e.ws.on("connection", a);
        };
        s();
      }), (n = e.httpServer) == null || n.on("upgrade", async (r, s, a) => {
        await w(r, s, a);
      });
    }
  };
}
let d;
const m = (e) => {
  d = e;
};
export {
  h as default,
  w as handle,
  m as handleUpgrade
};
