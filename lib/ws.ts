import type {Connect} from 'vite';
import {WebSocketServer} from 'ws';

import type {Duplex} from 'node:stream';
import {WebSocket} from "@cloudflare/workers-types/experimental/index";

type IncomingMessage = Connect.IncomingMessage;

type bindFunction = (server: WebSocket, client: WebSocket) => void

const listeners = {} as { [key: string]: bindFunction }

export const bind = (path: string, listener: bindFunction) => {
    listeners[path] = listener
}
export const unbind = (path: string) => {
    delete listeners[path]
}

const wsPool = {} as { [key: string]: WebSocketServer };

export const handle = async (req: IncomingMessage | Request, socket: Duplex, head: Buffer) => {
    const {pathname} = new URL(req.url || '', 'wss://base.url');
    const fn = listeners[pathname];
    if (fn) {
        if (socket) {
            let srv = wsPool[pathname];

            if (!srv) {
                console.log({WebSocketServer: WebSocketServer})
                srv = new WebSocketServer({noServer: true});
                wsPool[pathname] = srv;
                srv.on('connection', (serv: WebSocket) => {
                    fn(serv, serv);
                });
            }

            srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws) => {
                srv.emit('connection', ws, req);
            });

        } else {
            // cloudflare Worker environment
            const upgradeHeader = (req as Request).headers.get('Upgrade');
            if (!upgradeHeader || upgradeHeader !== 'websocket') return;
            const webSocketPair = new WebSocketPair();
            const client = webSocketPair[0],
                server = webSocketPair[1] as typeof webSocketPair[1] &{
                    accept:()=>void
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
