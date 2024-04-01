import { Connect } from 'vite';
import { Duplex } from 'node:stream';
import { ProgramNode } from 'rollup';
import { TransformPluginContext } from 'rollup';
import { ViteDevServer } from 'vite';
import { WebSocket as WebSocket_2 } from 'vite';

export declare const bind: (path: string, listener: bindFunction) => void;

declare type bindFunction = (server: WebSocket_2, client: WebSocket_2) => void;

export declare const handle: (req: IncomingMessage | Request, socket: Duplex, head: Buffer) => Promise<Response | undefined>;

declare type IncomingMessage = Connect.IncomingMessage;

export declare const unbind: (path: string) => void;

export declare const watchLog: (cb: (s: string) => string) => void;

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
