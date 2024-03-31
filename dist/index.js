import { WebSocketServer as u } from "ws";
const i = {}, v = (e, t) => {
  i[e] = t;
}, w = (e) => {
  delete i[e];
}, d = {}, b = async (e, t, r) => {
  const {
    pathname: o
  } = new URL(e.url || "", "wss://base.url"), a = i[o];
  if (a)
    if (t) {
      let n = d[o];
      n || (console.log({
        WebSocketServer: u
      }), n = new u({
        noServer: !0
      }), d[o] = n, n.on("connection", (s) => {
        a(s, s);
      })), n.handleUpgrade(e, t, r, (s) => {
        n.emit("connection", s, e);
      });
    } else {
      const n = e.headers.get("Upgrade");
      if (!n || n !== "websocket")
        return;
      const s = new WebSocketPair(), l = s[0], c = s[1];
      return c.accept(), a(c, l), new Response(null, {
        status: 101,
        webSocket: l
      });
    }
}, p = global;
function h() {
  return {
    name: "svelte-kit-websocket",
    async transform(e, t) {
      if (t.endsWith("@sveltejs/kit/src/runtime/server/index.js")) {
        e = `import {dev} from "$app/environment";
					import {handle} from "vite-cloudflare-sveltekit-ws"
					` + e.replace("async respond(request, options) {", `
                async respond(request, options) {
                    if(handle){
                      if(dev)global.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `);
        const r = this.parse(e, {
          allowReturnOutsideFunction: !0
        });
        return {
          code: e,
          ast: r
        };
      }
      return null;
    },
    async configureServer(e) {
      var t;
      (t = e.httpServer) == null || t.on("upgrade", async (r, o, a) => {
        const n = p.__serverHandle;
        n && await n(r, o, a);
      });
    }
  };
}
export {
  v as bind,
  h as default,
  b as handle,
  w as unbind
};
