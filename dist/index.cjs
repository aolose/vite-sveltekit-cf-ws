"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const c={},d={};let a;const f=async(e,t,o)=>{const{pathname:s}=new URL(e.url||"","wss://base.url"),r=c[s];if(r)if(t){let n=d[s];n||(n=new a({noServer:!0}),d[s]=n,n.on("connection",i=>{r(i,i)})),n.handleUpgrade(e,t,o,i=>{n.emit("connection",i,e)})}else{const n=e.headers.get("Upgrade");if(!n||n!=="websocket")return;const i=new WebSocketPair,l=i[0],u=i[1];return u.accept(),r(u,l),new Response(null,{status:101,webSocket:l})}},p=globalThis;function w(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const o=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:o}}return null},async configureServer(e){var t;a||new Promise(o=>{const s=()=>{if(!e.ws){setTimeout(s);return}const r=function(n){o(a=this.constructor),e.ws.off("connection",r)};e.ws.on("connection",r)};s()}),(t=e.httpServer)==null||t.on("upgrade",async(o,s,r)=>{const n=p.__serverHandle;n&&await n(o,s,r)})}}}const h=(e,t)=>{c[e]=t},b=e=>{delete c[e]};exports.bind=h;exports.default=w;exports.handle=f;exports.unbind=b;
