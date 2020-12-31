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

/* TODO: make a hierarchy

api {
    v1 {
        foo {
            get("/:item")
            post("/:item")
        }
    },
    v2 {
        post('bar')
    }
},
* {

}

*/
const router = new RouterFactory();
router.get("/hello", (stream) => {
    stream.respond({ ":status": 200 });
    stream.write("hello world!");
    stream.end();
});

router.post("/search$", (stream) => {
    stream.on('data', (chunk) => {
        console.log(chunk);
    });

    //search.pipe(stream).respond({ 'content-type': 'application/json' });
});

router.post("/upload/:file", (stream, headers) => {
    const fullPath = path.join(staticPath, headers[':path'] as string);
    stream.pipe(fs.createWriteStream(fullPath))
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
