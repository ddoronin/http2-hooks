import http2 from 'http2';
import path from 'path';
import fs from 'fs';
import { useServer } from './hooks';

const server = http2.createSecureServer({
    key: fs.readFileSync(path.resolve(__dirname, '../localhost-privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname,'../localhost-cert.pem'))
});

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
        })
    })
    .listen(443);
