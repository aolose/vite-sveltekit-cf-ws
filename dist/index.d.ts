import { Connect } from 'vite';
import { Duplex } from 'node:stream';
import { Http2ServerRequest } from 'node:http2';
import { ProgramNode } from 'rollup';
import { TransformPluginContext } from 'rollup';
import { ViteDevServer } from 'vite';

declare type CloudflareWebsocket = typeof WebSocketPair[keyof typeof WebSocketPair] & {
    accept: () => void;
};

export declare const handle: (req: IncomingMessage | Http2ServerRequest | Request, socket?: Duplex, head?: Buffer) => Promise<Response | undefined>;

export declare const handleUpgrade: (cb: UpgradeFn) => void;

declare type IncomingMessage = Connect.IncomingMessage;

declare type UpgradeFn = (req: IncomingMessage | Request | Http2ServerRequest, createWebsocketServer: () => CloudflareWebsocket) => void | Promise<void>;

declare function WsPlugin(): {
    name: string;
    transform(this: TransformPluginContext, code: string, id: string): Promise<{
        code: string;
        ast: ProgramNode;
    } | null>;
    configureServer(this: void, server: ViteDevServer): Promise<void>;
};
export default WsPlugin;

export { }
