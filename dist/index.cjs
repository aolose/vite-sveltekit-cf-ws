"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const u={},p={};let c;const w=async(e,n,i)=>{var d;const o=(d=e==null?void 0:e.headers)==null?void 0:d.get("Upgrade");if(console.log({socket:!!n,url:e.url,upgradeHeader:!!o,isSocket:o==="websocket"}),!n&&o!=="websocket")return;const{pathname:s}=new URL(e.url||"","wss://base.url"),r=u[s];if(r||l(`no ws handle  for path: ${s}`),r)if(n){let t=p[s];t||(t=new c({noServer:!0}),p[s]=t,t.on("connection",a=>{r(a,a)})),t.handleUpgrade(e,n,i,a=>{t.emit("connection",a,e)})}else try{const t=new WebSocketPair,a=t[0],f=t[1];return f.accept(),r(f,a),new Response(null,{status:101,webSocket:a})}catch(t){t instanceof Error&&l("error:"+t.toString())}},h=globalThis;function g(){return{name:"svelte-kit-websocket",async transform(e,n){if(n.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const i=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:i}}return null},async configureServer(e){var n;c||new Promise(i=>{const o=()=>{if(!e.ws){setTimeout(o);return}const s=function(r){i(c=this.constructor),e.ws.off("connection",s)};e.ws.on("connection",s)};o()}),(n=e.httpServer)==null||n.on("upgrade",async(i,o,s)=>{const r=h.__serverHandle;r&&await r(i,o,s)})}}}const b=(e,n)=>{n&&(u[e]=n)},v=e=>{delete u[e]};let l=e=>{};const m=e=>{l=e};exports.bind=b;exports.default=g;exports.handle=w;exports.unbind=v;exports.watchLog=m;
