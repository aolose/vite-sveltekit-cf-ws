import {type Connect, type Plugin, type WebSocket} from 'vite';
import type {Server} from 'node:http';
import type {Duplex} from 'node:stream';
import type {Http2ServerRequest} from "node:http2";
import type {WebSocketPair, WebSocket as CFWs} from "@cloudflare/workers-types/2023-07-01"

type IncomingMessage = Connect.IncomingMessage;
type serverHandle = (
    request: IncomingMessage | Request,
    socket: Duplex,
    head: Buffer
) => Response | Promise<Response | void> | void;

type Type<T> = new (...args: any[]) => T;
let WSServer: Type<WebSocket.Server>

const handle = async (req: IncomingMessage | Http2ServerRequest | Request, socket?: Duplex, head?: Buffer) => {
    // cloudflare Worker environment
    const upgradeHeader = (req as Http2ServerRequest).headers.upgrade
        || (req as Request)?.headers?.get('Upgrade');
    if (!socket && upgradeHeader !== 'websocket') return;
    const {pathname} = new URL(req.url || '', 'wss://base.url');
    let res: Response | undefined
    if (onUpgrade) {
        // @ts-ignore
        await onUpgrade(req, (): CloudflareWebsocket => {
            if (socket && head) {
                const srv = new WSServer({noServer: true})
                const cfWs = {
                    addEventListener: (type, listener) => {
                        srv.addListener(type, listener as Parameters<typeof srv.addListener>[1])
                    },
                    removeEventListener: (type, listener) => {
                        srv.removeListener(type, listener as Parameters<typeof srv.removeListener>[1])
                    },
                    send(message: ArrayBuffer | ArrayBufferView | string) {
                        (srv as WebSocket.Server & { send: (message: unknown) => void }).send(message)
                    }
                } as CFWs
                cfWs.accept = () => {
                    if (srv.emit) srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws: unknown) => {
                        srv.emit('connection', ws, req);
                    });
                }
                cfWs.close = (code, reason) => {
                    socket.once('finish', socket.destroy);
                    const headers = {
                        'Connection': 'close',
                        'Content-Type': 'text/html',
                        'Content-Length': Buffer.byteLength(reason || ''),
                    }
                    socket.end(
                        `HTTP/1.1 ${code}\r\n` +
                        Object.keys(headers)
                            .map((h) => `${h}: ${headers[h as keyof typeof headers]}`)
                            .join('\r\n') +
                        '\r\n\r\n' +
                        reason
                    );
                }
                return cfWs
            } else {
                const cfGlobal = globalThis as typeof globalThis & {
                    WebSocketPair: typeof WebSocketPair
                }
                const webSocketPair = new cfGlobal.WebSocketPair();
                const client = webSocketPair[0],
                    server = webSocketPair[1]
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

function WsPlugin() {
    return {
        name: 'svelte-kit-websocket',
        async transform(code, id) {
            if (id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
                const target = 'async respond(request, options) {'
                code = `import {dev} from "$app/environment";import {handle} from "vite-sveltekit-cf-ws"`
                    + code.replace(target, target +
                        `if(handle){
                        if(!dev){
                         const resp = await handle(request)
                         if(resp) return resp
                      }}`);
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
                await handle(req, socket, head);
            });
        }
    } satisfies Plugin;
}

type UpgradeFn = (
    req: IncomingMessage | Request | Http2ServerRequest,
    createWebsocketServer: () => CFWs
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
