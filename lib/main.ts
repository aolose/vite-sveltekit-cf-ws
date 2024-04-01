import {type Connect, type Plugin} from 'vite';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';

import {bind, unbind, handle} from './ws'

type IncomingMessage = Connect.IncomingMessage;

export type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

const devGlobal = globalThis as typeof globalThis & {
    __serverHandle: serverHandle;
};

function WsPlugin() {
    return {
        name: 'svelte-kit-websocket',
        async transform(code, id) {
            if (id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
                code =
                    `import {dev} from "$app/environment";
					import {handle} from "vite-sveltekit-cf-ws"
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
