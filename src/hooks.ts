import http2, { Http2SecureServer, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';
import { Router, routeMatcher } from './router';
import { RouterFactory } from './routerFactory';

function cleanReqMultiValue(multivalue: string| string[]): string {
    return typeof multivalue === 'object'? multivalue[0]: multivalue;
}

export function useServerRouter(server: Http2SecureServer, router: Router<ServerHttp2Stream, IncomingHttpHeaders>): Http2SecureServer {
    const routerMatcher = routeMatcher(router);
    server.on('stream', (stream, headers) => {
        const reqPath = headers[http2.constants.HTTP2_HEADER_PATH];
        if (!reqPath) throw "HTTP2_HEADER_PATH is undefined."
        
        const reqMethod = headers[http2.constants.HTTP2_HEADER_METHOD];
        if (!reqMethod) throw "HTTP2_HEADER_METHOD is undefined."

        stream.pipe(process.stdout);

        const reqMethodCleaned = cleanReqMultiValue(reqMethod);
        const reqPathCleaned = cleanReqMultiValue(reqPath)
        const [route, params] = routerMatcher(reqMethodCleaned, reqPathCleaned);
        route.handler(stream, headers, params);
    });
    return server;
}

export function useServer(server: Http2SecureServer) {
    const router = new RouterFactory();

    const self = Object.assign(server, {
        useRouter(fn: (router: RouterFactory) => void) {
            fn(router);
            return self;
        }
    });

    useServerRouter(server, router);

    return self;
}
