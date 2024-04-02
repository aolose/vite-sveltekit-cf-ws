let l;
const h = async (e, t, r) => {
  var i;
  const o = e.headers.upgrade || ((i = e == null ? void 0 : e.headers) == null ? void 0 : i.get("Upgrade"));
  if (!t && o !== "websocket")
    return;
  new URL(e.url || "", "wss://base.url");
  let s;
  return u && await u(e, () => {
    if (t && r) {
      const n = new l({ noServer: !0 });
      return n.addEventListener = n.addListener, n.removeEventListener = n.removeListener, n.accept = () => {
        n.handleUpgrade(e, t, r, (a) => {
          n.emit("connection", a, e);
        });
      }, n.close = (a, c) => {
        t.once("finish", t.destroy);
        const d = {
          Connection: "close",
          "Content-Type": "text/html",
          "Content-Length": Buffer.byteLength(c)
        };
        t.end(
          `HTTP/1.1 ${a}\r
` + Object.keys(d).map((p) => `${p}: ${d[p]}`).join(`\r
`) + `\r
\r
` + c
        );
      }, n;
    } else {
      const n = new WebSocketPair(), a = n[0], c = n[1];
      return s = new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: a
      }), c;
    }
  }), s;
}, f = globalThis;
function v() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, t) {
      if (t.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
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
      var t;
      l || new Promise((r) => {
        const o = () => {
          if (!e.ws) {
            setTimeout(o);
            return;
          }
          const s = function(i) {
            r(l = this.constructor), e.ws.off("connection", s);
          };
          e.ws.on("connection", s);
        };
        o();
      }), (t = e.httpServer) == null || t.on("upgrade", async (r, o, s) => {
        const i = f.__serverHandle;
        i && await i(r, o, s);
      });
    }
  };
}
let u;
const w = (e) => {
  u = e;
};
export {
  v as default,
  h as handle,
  w as handleUpgrade
};
