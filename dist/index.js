let u;
const v = async (e, n, s) => {
  var c;
  const a = e.headers.upgrade || ((c = e == null ? void 0 : e.headers) == null ? void 0 : c.get("Upgrade"));
  if (!n && a !== "websocket")
    return;
  new URL(e.url || "", "wss://base.url");
  let i;
  return d && await d(e, () => {
    if (n && s) {
      const r = new u({ noServer: !0 }), l = {
        addEventListener: (t, o) => {
          r.addListener(t, o);
        },
        removeEventListener: (t, o) => {
          r.removeListener(t, o);
        },
        send(t) {
          r.send(t);
        }
      };
      return l.accept = () => {
        r.emit && r.handleUpgrade(e, n, s, (t) => {
          r.emit("connection", t, e);
        });
      }, l.close = (t, o) => {
        n.once("finish", n.destroy);
        const f = {
          Connection: "close",
          "Content-Type": "text/html",
          "Content-Length": Buffer.byteLength(o || "")
        };
        n.end(
          `HTTP/1.1 ${t}\r
` + Object.keys(f).map((p) => `${p}: ${f[p]}`).join(`\r
`) + `\r
\r
` + o
        );
      }, l;
    } else {
      const r = globalThis, l = new r.WebSocketPair(), t = l[0], o = l[1];
      return i = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: t
      }), o;
    }
  }), i;
}, h = globalThis;
function w() {
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
        const s = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return { code: e, ast: s };
      }
      return null;
    },
    async configureServer(e) {
      var n;
      u || new Promise((s) => {
        const a = () => {
          if (!e.ws) {
            setTimeout(a);
            return;
          }
          const i = function(c) {
            s(u = this.constructor), e.ws.off("connection", i);
          };
          e.ws.on("connection", i);
        };
        a();
      }), (n = e.httpServer) == null || n.on("upgrade", async (s, a, i) => {
        const c = h.__serverHandle;
        c && await c(s, a, i);
      });
    }
  };
}
let d;
const m = (e) => {
  d = e;
};
export {
  w as default,
  v as handle,
  m as handleUpgrade
};
