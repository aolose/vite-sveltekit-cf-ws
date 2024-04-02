"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});let c;const f=async(e,t,r)=>{var i;const o=e.headers.upgrade||((i=e==null?void 0:e.headers)==null?void 0:i.get("Upgrade"));if(!t&&o!=="websocket")return;new URL(e.url||"","wss://base.url");let s;return u&&await u(e,()=>{if(t&&r){const n=new c({noServer:!0});return n.addEventListener=n.addListener,n.removeEventListener=n.removeListener,n.accept=()=>{n.handleUpgrade(e,t,r,a=>{n.emit("connection",a,e)})},n.close=(a,l)=>{t.once("finish",t.destroy);const d={Connection:"close","Content-Type":"text/html","Content-Length":Buffer.byteLength(l)};t.end(`HTTP/1.1 ${a}\r
`+Object.keys(d).map(p=>`${p}: ${d[p]}`).join(`\r
`)+`\r
\r
`+l)},n}else{const n=new WebSocketPair,a=n[0],l=n[1];return s=new Response(null,{status:101,webSocket:a}),l}}),s},h=globalThis;function v(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const r=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:r}}return null},async configureServer(e){var t;c||new Promise(r=>{const o=()=>{if(!e.ws){setTimeout(o);return}const s=function(i){r(c=this.constructor),e.ws.off("connection",s)};e.ws.on("connection",s)};o()}),(t=e.httpServer)==null||t.on("upgrade",async(r,o,s)=>{const i=h.__serverHandle;i&&await i(r,o,s)})}}}let u;const w=e=>{u=e};exports.default=v;exports.handle=f;exports.handleUpgrade=w;
