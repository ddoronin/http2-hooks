import http2, { IncomingHttpHeaders, ServerHttp2Stream } from "http2";
import { Http2Hook } from "./hooks";
import { Route, routeMatcher, RouteParams, Router } from "./router";

function cleanReqMultiValue(multivalue: string| string[]): string {
    return typeof multivalue === 'object'? multivalue[0]: multivalue;
}

export class RouterHttp2Hook implements Http2Hook {
    public readonly name = 'RouterHttp2Hook';
    private readonly match: (reqMethod: string, reqPath: string) => [Route<ServerHttp2Stream, IncomingHttpHeaders>, RouteParams];

    constructor(router: Router<ServerHttp2Stream, IncomingHttpHeaders>, description: string = '') {
        if (description.length > 0) {
            this.name += ' ' + description;
        }
        this.match = routeMatcher(router);
    }

    exec(stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
        const reqPath = headers[http2.constants.HTTP2_HEADER_PATH];
        if (!reqPath) throw "HTTP2_HEADER_PATH is undefined."
        
        const reqMethod = headers[http2.constants.HTTP2_HEADER_METHOD];
        if (!reqMethod) throw "HTTP2_HEADER_METHOD is undefined."

        const reqMethodCleaned = cleanReqMultiValue(reqMethod);
        const reqPathCleaned = cleanReqMultiValue(reqPath)
        const [route, params] = this.match(reqMethodCleaned, reqPathCleaned);
        route.handler(stream, headers, params);
    }
}
