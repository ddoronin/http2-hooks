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

const router = new RouterFactory();
router.get("/hello", (stream) => {
    stream.respond({ ":status": 200 });
    stream.write("hello world!");
    stream.end();
});

router.get("/world", (stream) => {
    stream.pipe(process.stdout);
});

router.post("/upload/:file", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    const fswrite = fs.createWriteStream(fullPath)
    stream.pipe(fswrite)
});

router.get("/:file", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    const responseMimeType = mime.lookup(fullPath);
    fs.createReadStream(fullPath).pipe(stream).respond({ 'content-type': responseMimeType as string });
});

useHttp2Server(server, [
    new ConsoleMiddlewareHttp2Hook(),
    new RouterHttp2Hook(router)
]).listen(1443);
