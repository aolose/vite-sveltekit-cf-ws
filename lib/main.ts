import { type Connect, type Plugin, type WebSocket } from 'vite';
import type { Duplex } from 'node:stream';
import type { Http2ServerRequest } from 'node:http2';
import type { WebSocket as CFWs, WebSocketPair } from '@cloudflare/workers-types/2023-07-01';

type IncomingMessage = Connect.IncomingMessage;
type Type<T> = new (...args: any[]) => T;
let WSServer: Type<WebSocket.Server>;

const handle = async (
    req: IncomingMessage | Http2ServerRequest | Request,
    socket: Duplex,
    head: Buffer
) => {
    const upgradeHeader =
        (req as Http2ServerRequest).headers.upgrade || (req as Request)?.headers?.get('Upgrade');
    if (upgradeHeader !== 'websocket' || ( WSServer && !socket )) return;
    let res: Response | undefined;

    const createWs = () => {
        if (WSServer) {
            const srv = new WSServer({noServer: true});
            let rawSrv: WebSocket | undefined;
            const tasks = [] as unknown[][];
            return new Proxy(
                {},
                {
                    get(target: {}, p: string | symbol, receiver: any): any {
                        if (p === 'accept') {
                            return () => {
                                srv.once('connection', (serv: WebSocket) => {
                                    rawSrv = serv;
                                    if (tasks.length) {
                                        tasks.forEach(([fn, ...args]) => {
                                            // @ts-ignore
                                            rawSrv[fn](...args);
                                        });
                                        tasks.length = 0;
                                    }
                                });
                                srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws: unknown) => {
                                    srv.emit('connection', ws, req);
                                });
                            };
                        } else if (rawSrv) {
                            return Reflect.get(rawSrv, p, rawSrv);
                        } else {
                            return (...args: unknown[]) => {
                                tasks.push([p, ...args]);
                            };
                        }
                    }
                }
            ) as CFWs;
        } else {
            const cfGlobal = globalThis as typeof globalThis & {
                WebSocketPair: typeof WebSocketPair;
            };
            const webSocketPair = new cfGlobal.WebSocketPair();
            const client = webSocketPair[0],
                server = webSocketPair[1];
            res = new Response(null, {
                status: 101,
                // @ts-ignore
                webSocket: client
            });
            return server;
        }
    }
    if (onUpgrade) await onUpgrade(req, createWs);
    return res;
};

function WsPlugin() {
    return {
        name: 'svelte-kit-websocket',
        async transform(code, id) {
            if (id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
                const target = 'async respond(request, options) {';
                code = `import {handle} from "vite-sveltekit-cf-ws";` +
                    code.replace(
                        target,
                        `${target}const res = await handle(request);if(res)return res;`
                    );
                return {code};
            }
            return null;
        },
        async configureServer(server) {
            const f = function (this: WebSocket.Server, s: WebSocket) {
                server.ws.off('connection', f);
                WSServer = this.constructor as Type<WebSocket.Server>
            };
            server.ws.on('connection', f);
            server.httpServer?.on('upgrade', async (req, socket, head) => {
                 if(WSServer)await handle(req, socket, head);
            });
        }
    } satisfies Plugin;
}

type UpgradeFn = (
    req: IncomingMessage | Request | Http2ServerRequest,
    createWebsocketServer: () => CFWs
) => void | Promise<void>;

let onUpgrade: UpgradeFn | undefined;

const handleUpgrade = (cb: UpgradeFn) => {
    onUpgrade = cb;
};

export { handle, handleUpgrade };
export default WsPlugin;
