import { Connect } from 'vite';
import { Duplex } from 'node:stream';
import { ProgramNode } from 'rollup';
import { TransformPluginContext } from 'rollup';
import { ViteDevServer } from 'vite';

export declare const bind: (path: string, listener: (serv: WebSocket, client: WebSocket) => void) => void;

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
