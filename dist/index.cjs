"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const u=require("ws"),a={},p=(e,t)=>{a[e]=t},v=e=>{delete a[e]},d={},b=async(e,t,r)=>{const{pathname:o}=new URL(e.url||"","wss://base.url"),i=a[o];if(i)if(t){let n=d[o];n||(console.log({WebSocketServer:u.WebSocketServer}),n=new u.WebSocketServer({noServer:!0}),d[o]=n,n.on("connection",s=>{i(s,s)})),n.handleUpgrade(e,t,r,s=>{n.emit("connection",s,e)})}else{const n=e.headers.get("Upgrade");if(!n||n!=="websocket")return;const s=new WebSocketPair,l=s[0],c=s[1];return c.accept(),i(c,l),new Response(null,{status:101,webSocket:l})}},f=globalThis;function h(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const r=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:r}}return null},async configureServer(e){var t;(t=e.httpServer)==null||t.on("upgrade",async(r,o,i)=>{const n=f.__serverHandle;n&&await n(r,o,i)})}}}exports.bind=p;exports.default=h;exports.handle=b;exports.unbind=v;
