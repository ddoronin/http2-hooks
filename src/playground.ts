import http2 from 'http2';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { useHttp2Server } from './hooks';
import { ConsoleMiddlewareHttp2Hook } from './middleware';
import { RouterFactory } from './routerFactory';
import { RouterHttp2Hook } from './router-hook';

const server = http2.createSecureServer({
    key: fs.readFileSync(path.resolve(__dirname, '../localhost-privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname,'../localhost-cert.pem'))
});

const staticPath = path.resolve(__dirname, './static');
const staticRouter = new RouterFactory('');
staticRouter.get("/:files", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    const responseMimeType = mime.lookup(fullPath);
    fs.createReadStream(fullPath).pipe(stream).respond({ 'content-type': responseMimeType as string });
});

const apiRouter = new RouterFactory('/api');
apiRouter.get("/hello", (stream) => {
    stream.respond({ ":status": 200 });
    stream.write("hello world!");
    stream.end();
});

apiRouter.post("/search$", (stream) => {
    stream.on('data', (chunk) => {
        console.log(chunk);
    });

    //search.pipe(stream).respond({ 'content-type': 'application/json' });
});

apiRouter.post("/upload/:file", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    stream.pipe(fs.createWriteStream(fullPath))
});

useHttp2Server(server, [
    new ConsoleMiddlewareHttp2Hook(),
    new RouterHttp2Hook(apiRouter, 'api'),
    new RouterHttp2Hook(staticRouter, 'static'),
]).listen(1443);
