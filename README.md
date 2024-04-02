# vite-sveltekit-cf-ws

Supports local development dev Server
and cloudflare.

### Usage

vite.config.ts

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wsPlugin from 'vite-sveltekit-cf-ws';

export default defineConfig({
	...
    plugins: [
		sveltekit(),
		wsPlugin()
	],
    ...
});

```

hooks.server.ts

```ts
import {handleUpgrade} from "vite-sveltekit-cf-ws";

handleUpgrade((req, createWebsocketServer) => {
    const pathname = new URL(req.url || '', 'ws://base.url').pathname
    if (pathname === '/hello') {
        const server = createWebsocketServer()
        server.accept()
        server.addEventListener('message', ({data}) => {
            server.send(`[ws server] received message: "${data}"`)
        })
    }
})

```
