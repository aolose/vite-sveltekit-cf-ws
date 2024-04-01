"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const l={},d={};let a;const p=async(t,e,o)=>{const{pathname:r}=new URL(t.url||"","wss://base.url"),i=l[r];if(i)if(e){let n=d[r];if(!a)return;n||(n=new a({noServer:!0}),d[r]=n,n.on("connection",s=>{i(s,s)})),n.handleUpgrade(t,e,o,s=>{n.emit("connection",s,t)})}else{const n=t.headers.get("Upgrade");if(!n||n!=="websocket")return;const s=new WebSocketPair,c=s[0],u=s[1];return u.accept(),i(u,c),new Response(null,{status:101,webSocket:c})}},f=globalThis;function v(t){return a=t,{name:"svelte-kit-websocket",async transform(e,o){if(o.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const r=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:r}}return null},async configureServer(e){var o;(o=e.httpServer)==null||o.on("upgrade",async(r,i,n)=>{const s=f.__serverHandle;s&&await s(r,i,n)})}}}const b=(t,e)=>{l[t]=e},h=t=>{delete l[t]};exports.bind=b;exports.default=v;exports.handle=p;exports.unbind=h;
