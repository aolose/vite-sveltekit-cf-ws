"use strict";var p=Object.create;var u=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var h=Object.getPrototypeOf,w=Object.prototype.hasOwnProperty;var b=(e,n,s,o)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of v(n))!w.call(e,r)&&r!==s&&u(e,r,{get:()=>n[r],enumerable:!(o=f(n,r))||o.enumerable});return e};var m=(e,n,s)=>(s=e!=null?p(h(e)):{},b(n||!e||!e.__esModule?u(s,"default",{value:e,enumerable:!0}):s,e));Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const c={},d={},g=async(e,n,s)=>{const{pathname:o}=new URL(e.url||"","wss://base.url"),r=c[o];if(r)if(n){let t=d[o];const{WebSocket:a}=await import("vite"),l=a==null?void 0:a.Server;if(!l)return;t||(t=new l({noServer:!0}),d[o]=t,t.on("connection",i=>{r(i,i)})),t.handleUpgrade(e,n,s,i=>{t.emit("connection",i,e)})}else{const t=e.headers.get("Upgrade");if(!t||t!=="websocket")return;const a=new WebSocketPair,l=a[0],i=a[1];return i.accept(),r(i,l),new Response(null,{status:101,webSocket:l})}},S=globalThis;function y(){return{name:"svelte-kit-websocket",async transform(e,n){if(n.endsWith("@sveltejs/kit/src/runtime/server/index.js")){e=`import {dev} from "$app/environment";
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
                `);const s=this.parse(e,{allowReturnOutsideFunction:!0});return{code:e,ast:s}}return null},async configureServer(e){var n;(n=e.httpServer)==null||n.on("upgrade",async(s,o,r)=>{const t=S.__serverHandle;t&&await t(s,o,r)})}}}const k=(e,n)=>{c[e]=n},_=e=>{delete c[e]};exports.bind=k;exports.default=y;exports.handle=g;exports.unbind=_;
