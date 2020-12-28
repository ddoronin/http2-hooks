import { IncomingHttpHeaders, ServerHttp2Stream, constants } from 'http2';
import {Router, Route, RouteParams} from './router';

export type Http2Router = Router<ServerHttp2Stream, IncomingHttpHeaders>;
export type Http2Route = Route<ServerHttp2Stream, IncomingHttpHeaders>;
export type Http2Handler = (stream: ServerHttp2Stream, headers: IncomingHttpHeaders, params?: RouteParams) => void

const { HTTP2_HEADER_STATUS} = constants

const route404 = {
    method: '*',
    path: '*',
    handler: (stream: ServerHttp2Stream) => {
        stream.respond({[HTTP2_HEADER_STATUS]: 404});
    }
}

export class RouterFactory implements Http2Router {
    public routes: Http2Route[] = [];

    constructor(public unknown: Http2Route = route404) {
    }

    get(path: string, handler: Http2Handler): RouterFactory {
        this.routes.push({ method: 'GET', path, handler});
        return this;
    }

    post(path: string, handler: Http2Handler): RouterFactory {
        this.routes.push({ method: 'POST', path, handler});
        return this;
    }

    put(path: string, handler: Http2Handler): RouterFactory {
        this.routes.push({ method: 'PUT', path, handler});
        return this;
    }

    delete(path: string, handler: Http2Handler): RouterFactory {
        this.routes.push({ method: 'DELETE', path, handler});
        return this;
    }
}
