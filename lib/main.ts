import {type Connect, type Plugin, type WebSocket} from 'vite';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';
import type {Http2ServerRequest} from "node:http2";


type IncomingMessage = Connect.IncomingMessage;

type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

interface WebsocketServer extends Function {
    new(cfg: { noServer: boolean }): WebSocket.Server;
}

let WSServer: WebsocketServer

const handle = async (req: IncomingMessage | Http2ServerRequest | Request, socket?: Duplex, head?: Buffer) => {
    // cloudflare Worker environment
    const upgradeHeader = (req as Http2ServerRequest).headers.upgrade
        || (req as Request)?.headers?.get('Upgrade');
    if (!socket && upgradeHeader !== 'websocket') return;
    const {pathname} = new URL(req.url || '', 'wss://base.url');
    let res: Response | undefined
    if (onUpgrade) {
        // @ts-ignore
        await onUpgrade(req, () => {
                if (socket && head) {
                    const srv = new WSServer({noServer: true});
                    srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws: unknown) => {
                        srv.emit('connection', ws, req);
                    });
                    return srv
                } else {
                    const webSocketPair = new WebSocketPair();
                    const client = webSocketPair[0],
                        server = webSocketPair[1]
                    // @ts-ignore
                    res = new (Response)(null, {
                        status: 101,
                        // @ts-ignore
                        webSocket: client
                    });
                    return server
                }
            })
    }
    return res
}

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
                            resolve(WSServer = this.constructor as WebsocketServer)
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

type UpgradeFn = (
    req: IncomingMessage | Request | Http2ServerRequest,
    createWebsocketServer: () => WebSocket.Server | typeof WebSocketPair[keyof typeof WebSocketPair]
) => void | Promise<void>

let onUpgrade: UpgradeFn | undefined

const handleUpgrade = (cb: UpgradeFn) => {
    onUpgrade = cb
}

export {
    handle,
    handleUpgrade
}
export default WsPlugin
