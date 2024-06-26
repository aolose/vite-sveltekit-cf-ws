import { Connect } from 'vite';
import { Duplex } from 'node:stream';
import { Http2ServerRequest } from 'node:http2';
import { TransformPluginContext } from 'rollup';
import { ViteDevServer } from 'vite';
import { WebSocket as WebSocket_2 } from '@cloudflare/workers-types/2023-07-01';

export declare const handle: (req: IncomingMessage | Http2ServerRequest | Request, socket: Duplex, head: Buffer) => Promise<Response | undefined>;

export declare const handleUpgrade: (cb: UpgradeFn) => void;

declare type IncomingMessage = Connect.IncomingMessage;

declare type UpgradeFn = (req: IncomingMessage | Request | Http2ServerRequest, createWebsocketServer: () => WebSocket_2) => void | Promise<void>;

declare function WsPlugin(): {
    name: string;
    transform(this: TransformPluginContext, code: string, id: string): Promise<{
        code: string;
    } | null>;
    configureServer(this: void, server: ViteDevServer): Promise<void>;
};
export default WsPlugin;

export { }
