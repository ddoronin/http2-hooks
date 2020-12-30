import { IncomingHttpHeaders, ServerHttp2Stream } from "http2";
import { Http2Hook } from "./hooks";

export class ConsoleMiddlewareHttp2Hook implements Http2Hook {
    public readonly name = 'ConsoleMiddlewareHttp2Hook';

    exec(_stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
        console.log(headers);
    }
}
