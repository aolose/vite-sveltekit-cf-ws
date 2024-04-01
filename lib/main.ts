import {type Connect, type Plugin ,type WebSocket} from 'vite';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';

// For bypassing build
// In fact, Websocket is not exported in vite.
// But it can be used locally
declare class WebSocketServer extends WebSocket.Server {}

type IncomingMessage = Connect.IncomingMessage;
type bindFunction = (server: WebSocket, client: WebSocket) => void
type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

const listeners = {} as { [key: string]: bindFunction }

const wsPool = {} as { [key: string]: WebSocketServer};

const handle = async (req: IncomingMessage | Request, socket: Duplex, head: Buffer) => {
    const {pathname} = new URL(req.url || '', 'wss://base.url');
    const fn = listeners[pathname];
    if (fn) {
        if (socket) {
            let srv = wsPool[pathname];
            const {WebSocket} = await import('vite')
            const WSServer = WebSocket?.Server
            if(!WSServer)return
            if (!srv) {
                srv = new WSServer({noServer: true});
                wsPool[pathname] = srv;
                srv.on('connection', (serv: WebSocket) => {
                    fn(serv, serv);
                });
            }

            srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws:unknown) => {
                srv.emit('connection', ws, req);
            });

        } else {
            // cloudflare Worker environment
            const upgradeHeader = (req as Request).headers.get('Upgrade');
            if (!upgradeHeader || upgradeHeader !== 'websocket') return;
            const webSocketPair = new WebSocketPair();
            const client = webSocketPair[0],
                server = webSocketPair[1] as typeof webSocketPair[1] & {
                    accept: () => void
                }

            server.accept();
            // @ts-ignore
            fn(server, client);
            return new (Response)(null, {
                status: 101,
                // @ts-ignore
                webSocket: client
            });
        }
    }
};

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
                      if(dev)globalThis.__serverHandle=handle
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

const bind = (path: string, listener: bindFunction) => {
    listeners[path] = listener
}

const unbind = (path: string) => {
    delete listeners[path]
}
export {
    bind,
    unbind,
    handle
}
export default WsPlugin
