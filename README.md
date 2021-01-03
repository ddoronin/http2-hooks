# http2-hooks
```
yarn add http2-hooks
```

Build an HTTP/2 server is simple as this:
``` typescript
import http2 from 'http2';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { useHttp2Server, ConsoleMiddlewareHttp2Hook, RouterHttp2Hook, RouterFactory } from 'http2-hooks';

const server = http2.createSecureServer({...});
useHttp2Server(server, [
    new ConsoleMiddlewareHttp2Hook(),
    new RouterHttp2Hook(
        new RouterFactory().get("/:static*", (stream, headers) => {
            const staticPath = path.resolve(__dirname, './static');
            const fullPath = path.join(staticPath, headers[':path'] as string);
            fs.createReadStream(fullPath).pipe(stream).respond({ 'content-type': mime.lookup(fullPath) as string });
        }))
]).listen(443);
```
