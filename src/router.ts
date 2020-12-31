import { match, MatchFunction } from 'path-to-regexp';

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

interface MatcherFunc<S, H> {
    route: Route<S, H>
    match: MatchFunction<object>
}

export function routeMatcher<S, H>(router: Router<S, H>) {
    let matchers: MatcherFunc<S, H>[] | null = null;
    const getMatchers = () => {
        if (matchers === null) {
            matchers = router.routes.map(route => ({route, match: match(route.path, { decode: decodeURIComponent })}))
        }
        return matchers;
    };
    return (reqMethod: string, reqPath: string): [Route<S, H>, RouteParams] => {
        const matchers = getMatchers();
        for (let i = 0; i < matchers.length; i++) {
            const {route, match} = matchers[i];
            if (route.method === reqMethod) {
                const matchedReqPath = match(reqPath);
                if (matchedReqPath) return [route, matchedReqPath.params as RouteParams];
            }
        }
        return [router.unknown, {}];
    }
}
