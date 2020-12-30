import * as teki from 'teki';

export type RouteParams = Record<string, string | null | string[]>

export interface Route<S, H> {
    method: string;
    path: string;
    handler: (stream: S, headers: H, params?: RouteParams) => void;
}

export interface Router<S, H> {
    routes: Route<S, H>[];
    unknown: Route<S, H>;
}

export function routeMatcher<S, H>(router: Router<S, H>) {
    const getMatchers = () => router.routes.map(route => ({route, parse: teki.parse(route.path)}))
    return (reqMethod: string, reqPath: string): [Route<S, H>, RouteParams] => {
        const matchers = getMatchers();
        for (let i = 0; i < matchers.length; i++) {
            const {route, parse} = matchers[i];
            if (route.method === reqMethod && typeof parse === 'function') {
                console.log('reqPath', reqPath);
                const params = parse('https://localhost' + reqPath);
                if (params) return [route, params];
            }
        }
        return [router.unknown, {}];
    }
}
