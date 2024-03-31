import {type Connect, type Plugin, transformWithEsbuild} from 'vite';
import {readFileSync} from 'node:fs';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';

import {bind, unbind, handle} from './ws'

type IncomingMessage = Connect.IncomingMessage;

export type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

const devGlobal = global as typeof global & {
    __serverHandle: serverHandle;
};

function WsPlugin() {
    return {
        name: 'svelte-kit-websocket',
        async transform(code, id) {
            if (id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
                code =
                    `import {dev} from "$app/environment";
					import {handle} from "vite-cloudflare-sveltekit-ws"
					` +
                    code.replace(
                        'async respond(request, options) {',
                        `
                async respond(request, options) {
                    if(handle){
                      if(dev)global.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `
                    );
                const ast = this.parse(code, {
                    allowReturnOutsideFunction: true
                })
                return {code, ast};
            }
            return null;
        },
        async configureServer(server) {
            (server.httpServer as Server)?.on('upgrade', async (req, socket, head) => {
                const h = devGlobal.__serverHandle;
                if (h) {
                    await h(req, socket, head);
                }
            });
        }
    } satisfies Plugin;
}

export {bind, unbind, handle}
export default WsPlugin
