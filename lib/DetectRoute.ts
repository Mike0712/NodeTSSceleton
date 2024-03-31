import { UrlWithParsedQuery } from "url";
import { IRoute, routes } from "../src/router";

type RouteParams = Record<string, string>;

type Result = {
    route: IRoute
    params: RouteParams
}

export function detectRoute(parsedUrl: UrlWithParsedQuery): Result | false {
    const pathSegments = parsedUrl.pathname?.split('/').filter(segment => segment.length > 0);

    if (pathSegments) {
        for (const route of routes) {
            const routePath = route.path.split('/').filter((segment) => segment.length > 0);
            const params: RouteParams = {};
            let isMatch = true;

            let i = 0;
            while (i < routePath.length) {
                const routeSegment = routePath[i];
                const pathSegment = pathSegments[i];

                if (routeSegment.startsWith(':')) {
                    if (routeSegment.endsWith('?') && typeof pathSegment === 'undefined') {
                        break;
                    }
                    const paramName = routeSegment.replace(':', '').replace('?', '');
                    params[paramName] = pathSegment;
                } else if (routeSegment !== pathSegment) {
                    isMatch = false;
                    break;
                }
                i++;
            }

            if (isMatch) {
                return { route, params };
            }
        }
    }

    return false;
}