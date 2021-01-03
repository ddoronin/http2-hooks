import http2, { ServerHttp2Stream } from 'http2';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { useHttp2Server, ConsoleMiddlewareHttp2Hook, RouterHttp2Hook, RouterFactory } from '../index';

const server = http2.createSecureServer({
    key: fs.readFileSync(path.resolve(__dirname, './localhost-privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname,'./localhost-cert.pem'))
});

const staticPath = path.resolve(__dirname, './static');
const staticPath404Page = path.resolve(__dirname, './static/404.html');

function respond(fullPath: string, stream: ServerHttp2Stream) {
    fs.createReadStream(fullPath).pipe(stream).respond({ 'content-type': mime.lookup(fullPath) as string });
}

const staticRouter = new RouterFactory();
staticRouter.get("/:static*", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    if (fs.existsSync(fullPath)) {
        respond(fullPath, stream);
    } else {
        if (stream.pushAllowed) {
            stream.pushStream({ ':path': '/img/404-error.jpg' }, (err, pushStream) => {
                if (err) throw err;
                respond(path.join(staticPath, './img/404-error.jpg'), pushStream);
                pushStream.on('error', (err) => {
                    const isRefusedStream = (err as any).code === 'ERR_HTTP2_STREAM_ERROR';
                    if (!isRefusedStream) throw err;
                  });
            });
        }
        respond(staticPath404Page, stream);
    }
});

useHttp2Server(server, [
    new ConsoleMiddlewareHttp2Hook(),
    new RouterHttp2Hook(staticRouter, 'static'),
]).listen(1443);
