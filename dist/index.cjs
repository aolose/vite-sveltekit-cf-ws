"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const v=require("vite");var p;const f=((p=v.WebSocket)==null?void 0:p.Server)||class{},i=f;new i;const l={},d={},b=async(e,t,r)=>{const{pathname:o}=new URL(e.url||"","wss://base.url"),a=l[o];if(a)if(t){let n=d[o];n||(console.log({WebSocketServer:i}),n=new i({noServer:!0}),d[o]=n,n.on("connection",s=>{a(s,s)})),n.handleUpgrade(e,t,r,s=>{n.emit("connection",s,e)})}else{const n=e.headers.get("Upgrade");if(!n||n!=="websocket")return;const s=new WebSocketPair,c=s[0],u=s[1];return u.accept(),a(u,c),new Response(null,{status:101,webSocket:c})}},h=globalThis;function w(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const r=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:r}}return null},async configureServer(e){var t;(t=e.httpServer)==null||t.on("upgrade",async(r,o,a)=>{const n=h.__serverHandle;n&&await n(r,o,a)})}}}const S=(e,t)=>{l[e]=t},g=e=>{delete l[e]};exports.bind=S;exports.default=w;exports.handle=b;exports.unbind=g;
