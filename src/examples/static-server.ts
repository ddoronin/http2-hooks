import http2 from 'http2';
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

const staticRouter = new RouterFactory();
staticRouter.get("/:static*", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    if (!fs.existsSync(fullPath)) {
        return fs.createReadStream(staticPath404Page).pipe(stream).respond({'content-type': 'text/html'});
    }

    fs.createReadStream(fullPath).pipe(stream).respond({ 'content-type': mime.lookup(fullPath) as string });
});

useHttp2Server(server, [
    new ConsoleMiddlewareHttp2Hook(),
    new RouterHttp2Hook(staticRouter, 'static'),
]).listen(1443);
