"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});let l;const p=async(e,t,n)=>{var u;if((e.headers.upgrade||((u=e==null?void 0:e.headers)==null?void 0:u.get("Upgrade")))!=="websocket"&&!t)return;let o;return d&&await d(e,()=>{if(t){const i=new l({noServer:!0});let r;const a=[];return new Proxy({},{get(f,g,S){return g==="accept"?()=>{i.once("connection",c=>{r=c,a.length&&(a.forEach(([h,...w])=>{r[h](...w)}),a.length=0)}),i.handleUpgrade(e,t,n,c=>{i.emit("connection",c,e)})}:r?Reflect.get(r,g,r):(...c)=>{a.push(c)}}})}else{const i=globalThis,r=new i.WebSocketPair,a=r[0],f=r[1];return o=new Response(null,{status:101,webSocket:a}),f}}),o};function v(){return{name:"svelte-kit-websocket",async transform(e,t){if(t.endsWith("@sveltejs/kit/src/runtime/server/index.js")){const n="async respond(request, options) {";e=`
                import {dev} from "$app/environment";
                import {handle} from "vite-sveltekit-cf-ws";
`+e.replace(n,`${n}
if(!dev){
                        const res = await handle(request)
                        if(res)return res
                    }`);const s=this.parse(e);return{code:e,ast:s}}return null},async configureServer(e){var t;l||new Promise(n=>{const s=()=>{if(!e.ws){setTimeout(s);return}const o=function(u){n(l=this.constructor),e.ws.off("connection",o)};e.ws.on("connection",o)};s()}),(t=e.httpServer)==null||t.on("upgrade",async(n,s,o)=>{await p(n,s,o)})}}}let d;const m=e=>{d=e};exports.default=v;exports.handle=p;exports.handleUpgrade=m;
