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
import type { Handle } from '@sveltejs/kit';
import { handleUpgrade } from 'vite-sveltekit-cf-ws';

let once = 0;
const initSockets = () => {
	if (!once) return;
	once=1
	handleUpgrade((req, createWebscoket) => {
		const pathName = new URL(req.url, 'ws://base.url').pathname;
		if (pathName === '/echo') {
			const serv = createWebscoket();
			serv.accept();
			serv.addEventListener('error', console.error);
			serv.addEventListener('message', function (e) {
				serv.send('echo:' + e.data);
			});
		}
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	initSockets();
	return resolve(event);
};
```
