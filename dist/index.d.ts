import { Connect } from 'vite';
import { Duplex } from 'node:stream';
import { ProgramNode } from 'rollup';
import { TransformPluginContext } from 'rollup';
import { ViteDevServer } from 'vite';
import { WebSocket as WebSocket_2 } from '@cloudflare/workers-types/experimental/index';

export declare const bind: (path: string, listener: bindFunction) => void;

declare type bindFunction = (server: WebSocket_2, client: WebSocket_2) => void;

export declare const handle: (req: IncomingMessage_2 | Request, socket: Duplex, head: Buffer) => Promise<Response | undefined>;

declare type IncomingMessage = Connect.IncomingMessage;

declare type IncomingMessage_2 = Connect.IncomingMessage;

export declare type serverHandle = (request: IncomingMessage | Request, socket: Duplex, head: Buffer) => Response | Promise<Response | void> | void;

export declare const unbind: (path: string) => void;

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
