"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const u=require("ws"),i={},p=(e,t)=>{i[e]=t},v=e=>{delete i[e]},d={},b=async(e,t,s)=>{const{pathname:o}=new URL(e.url||"","wss://base.url"),a=i[o];if(a)if(t){let n=d[o];n||(console.log({WebSocketServer:u.WebSocketServer}),n=new u.WebSocketServer({noServer:!0}),d[o]=n,n.on("connection",r=>{a(r,r)})),n.handleUpgrade(e,t,s,r=>{n.emit("connection",r,e)})}else{const n=e.headers.get("Upgrade");if(!n||n!=="websocket")return;const r=new WebSocketPair,l=r[0],c=r[1];return c.accept(),a(c,l),new Response(null,{status:101,webSocket:l})}},f=global;function w(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
					import {handle} from "vite-cloudflare-sveltekit-ws"
					`+e.replace("async respond(request, options) {",`
                async respond(request, options) {
                    if(handle){
                      if(dev)global.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `);const s=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:s}}return null},async configureServer(e){var t;(t=e.httpServer)==null||t.on("upgrade",async(s,o,a)=>{const n=f.__serverHandle;n&&await n(s,o,a)})}}}exports.bind=p;exports.default=w;exports.handle=b;exports.unbind=v;
