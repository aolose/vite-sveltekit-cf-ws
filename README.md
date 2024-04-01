# vite-sveltekit-cf-ws

Supports local development dev Server 
and cloudflare.

### Usage
vite.config.ts

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { WebSocket } from 'vite';
import wsPlugin from 'vite-sveltekit-cf-ws';

export default defineConfig({
	...
    plugins: [
		sveltekit(),
		wsPlugin(WebSocket.Server)
	],
    ...
});

```

hooks.server.ts
```ts
import type { Handle } from '@sveltejs/kit';
import {bind, unbind} from "vite-sveltekit-cf-ws";

let once = 0
const initSockets = ()=>{
	if(once++)return
    bind('/api/test',(serv, client)=>{
        serv.addEventListener('error', console.error);
        serv.addEventListener('message', function (e) {
            serv.send('echo:' + e.data);
            if(e.data==='unbind')unbind('/api/test')
        });
    })
}

export const handle: Handle = async ({ event, resolve }) => {
    initSockets()
    return resolve(event);
};


```
