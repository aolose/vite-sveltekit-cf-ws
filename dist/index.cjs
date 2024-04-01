"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const p=require("vite"),a=p.WebSocket.Server,l={},v=(e,t)=>{l[e]=t},f=e=>{delete l[e]};new a({noServer:!0});const d={},b=async(e,t,s)=>{const{pathname:o}=new URL(e.url||"","wss://base.url"),i=l[o];if(i)if(t){let n=d[o];n||(console.log({WebSocketServer:a}),n=new a({noServer:!0}),d[o]=n,n.on("connection",r=>{i(r,r)})),n.handleUpgrade(e,t,s,r=>{n.emit("connection",r,e)})}else{const n=e.headers.get("Upgrade");if(!n||n!=="websocket")return;const r=new WebSocketPair,c=r[0],u=r[1];return u.accept(),i(u,c),new Response(null,{status:101,webSocket:c})}},h=globalThis;function w(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const s=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:s}}return null},async configureServer(e){var t;(t=e.httpServer)==null||t.on("upgrade",async(s,o,i)=>{const n=h.__serverHandle;n&&await n(s,o,i)})}}}exports.bind=v;exports.default=w;exports.handle=b;exports.unbind=f;
