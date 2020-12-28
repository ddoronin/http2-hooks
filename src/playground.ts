import http2 from 'http2';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { useServer } from './hooks';

const server = http2.createSecureServer({
    key: fs.readFileSync(path.resolve(__dirname, '../localhost-privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname,'../localhost-cert.pem'))
});

const staticPath = path.resolve(__dirname, './static');

useServer(server)
    .useRouter(router => {
        router.get("/hello", (stream) => {
            stream.pipe(process.stdout);
            stream.respond({ ":status": 200 });
            stream.write("hello world!");
            stream.end();
        });

        router.get("/world", (stream) => {
            stream.pipe(process.stdout);
        });

        router.get("/index.html", (stream, headers) => {
            const fullPath = path.join(staticPath, headers[':path'] as string);
            const responseMimeType = mime.lookup(fullPath);
            stream.respondWithFile(fullPath, { 'content-type': responseMimeType as string });
        });
    })
    .listen(443);
