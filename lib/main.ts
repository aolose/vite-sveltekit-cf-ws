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
    new(cfg: { noServer: boolean }): {
        send(message:string |ArrayBuffer  |ArrayBufferView ):void
        addEventListener:typeof WebSocket.Server.prototype.addListener
        removeEventListener:typeof WebSocket.Server.prototype.removeListener
        accept:()=>void
        close:(code:number,reason:string)=>void
        addListener:typeof WebSocket.Server.prototype.addListener
        removeListener:typeof WebSocket.Server.prototype.removeListener
        emit:typeof WebSocket.Server.prototype.emit
        handleUpgrade:typeof WebSocket.Server.prototype.handleUpgrade
    };
}

type CloudflareWebsocket = typeof WebSocketPair[keyof typeof WebSocketPair] & {
    accept:()=>void
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
                    srv.addEventListener=srv.addListener
                    srv.removeEventListener=srv.removeListener
                    srv.accept=()=>{
                        srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws: unknown) => {
                            srv.emit('connection', ws, req);
                        });
                    }
                    srv.close =(code,reason)=>{
                        socket.once('finish', socket.destroy);
                        const headers = {
                            'Connection': 'close',
                            'Content-Type': 'text/html',
                            'Content-Length': Buffer.byteLength(reason),
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
                    return srv as CloudflareWebsocket
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
                    return server as CloudflareWebsocket
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
    createWebsocketServer: () => CloudflareWebsocket
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
