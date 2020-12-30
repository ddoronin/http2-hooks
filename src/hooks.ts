import { Http2SecureServer, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';

export interface Http2Hook {
    readonly name: string;
    exec(stream: ServerHttp2Stream, headers: IncomingHttpHeaders): void;
}

export function printHooks(hooks: Http2Hook[]) {
    console.info('⚓ hooks');
    hooks.forEach(hook => console.info(hook.name));
}

export function useHttp2Server(server: Http2SecureServer, hooks: Http2Hook[]): Http2SecureServer {
    printHooks(hooks);

    server.on('stream', (stream, headers) => {
        hooks.forEach(hook => hook.exec(stream, headers));
    });

    return server;
}
