"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});let u;const h=async(e,n,s)=>{var l;const a=e.headers.upgrade||((l=e==null?void 0:e.headers)==null?void 0:l.get("Upgrade"));if(!n&&a!=="websocket")return;new URL(e.url||"","wss://base.url");let i;return d&&await d(e,()=>{if(n&&s){const r=new u({noServer:!0}),c={addEventListener:(t,o)=>{r.addListener(t,o)},removeEventListener:(t,o)=>{r.removeListener(t,o)},send(t){r.send(t)}};return c.accept=()=>{r.emit&&r.handleUpgrade(e,n,s,t=>{r.emit("connection",t,e)})},c.close=(t,o)=>{n.once("finish",n.destroy);const f={Connection:"close","Content-Type":"text/html","Content-Length":Buffer.byteLength(o||"")};n.end(`HTTP/1.1 ${t}\r
`+Object.keys(f).map(p=>`${p}: ${f[p]}`).join(`\r
`)+`\r
\r
`+o)},c}else{const r=globalThis,c=new r.WebSocketPair,t=c[0],o=c[1];return i=new Response(null,{status:101,webSocket:t}),o}}),i},v=globalThis;function g(){return{name:"svelte-kit-websocket",async transform(e,n){if(n.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
					import {handle} from "vite-sveltekit-cf-ws"
					`+e.replace("async respond(request, options) {",`
                async respond(request, options) {
                    if(handle){
                      if(dev)globalThis.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `);const s=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:s}}return null},async configureServer(e){var n;u||new Promise(s=>{const a=()=>{if(!e.ws){setTimeout(a);return}const i=function(l){s(u=this.constructor),e.ws.off("connection",i)};e.ws.on("connection",i)};a()}),(n=e.httpServer)==null||n.on("upgrade",async(s,a,i)=>{const l=v.__serverHandle;l&&await l(s,a,i)})}}}let d;const w=e=>{d=e};exports.default=g;exports.handle=h;exports.handleUpgrade=w;
