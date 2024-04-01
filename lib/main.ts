import {type Connect, type Plugin, type WebSocket} from 'vite';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';


type IncomingMessage = Connect.IncomingMessage;
type bindFunction = (server: WebSocket, client: WebSocket) => void
type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

const listeners = {} as { [key: string]: bindFunction }

const wsPool = {} as { [key: string]: WebSocket.Server };

interface Type<T> extends Function {
    new(...args: unknown[]): T;
}

let WSServer: Type<WebSocket.Server>
const handle = async (req: IncomingMessage | Request, socket: Duplex, head: Buffer) => {
    // cloudflare Worker environment
    const upgradeHeader = (req as Request)?.headers?.get('Upgrade');
    if (!socket||!upgradeHeader || upgradeHeader !== 'websocket') return;

    const {pathname} = new URL(req.url || '', 'wss://base.url');
    const fn = listeners[pathname];
    if(!fn)log(`no ws handle  for path: ${pathname}`)
    if (fn) {
        if (socket) {
            let srv = wsPool[pathname];
            if (!srv) {
                srv = new WSServer({noServer: true});
                wsPool[pathname] = srv;
                srv.on('connection', (serv: WebSocket) => {
                    fn(serv, serv);
                });
            }
            srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws: unknown) => {
                srv.emit('connection', ws, req);
            });

        } else {
            try {
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
            } catch (e) {
                if (e instanceof Error)
                    log('error:' + e.toString())
            }
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
            if (!WSServer) {
                new Promise((resolve) => {
                    const run = () => {
                        if (!server.ws) {
                            setTimeout(run)
                            return
                        }
                        // hack websocketServer class
                        const f = function (this: WebSocket.Server, s: WebSocket) {
                            resolve(WSServer = this.constructor as Type<WebSocket.Server>)
                            server.ws.off('connection', f)
                        }
                        server.ws.on('connection', f)
                    }
                    run()
                })
            }
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
    if(listener)listeners[path] = listener
}

const unbind = (path: string) => {
    delete listeners[path]
}

let log = (a: string) => {
}

const watchLog = (cb: (s: string) => void) => {
    log = cb
}
export {
    watchLog,
    bind,
    unbind,
    handle
}
export default WsPlugin
