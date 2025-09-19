export interface ITreaficDynamicConfig {
    http: {
        services: {
            [key: string]: IService;
        };
        routers: {
            [key: string]: IRouter;
        };
        middlewares: {
            [key: string]: IPluginMiddleware | IBasicAuthMiddleware | IStripPrefixMiddleware | IIPWhitelistMiddleware;
        };
    };
}

export interface IService {
    loadbalancer?: {
        server: {
            url: string;
        };
    };
    loadBalancer?: {
        servers: Array<{
            url: string;
        }>;
    };
}

export interface IRouter {
    rule: string;
    service: string;
    middlewares?: string[];
    entryPoints?: string[];
    priority?: number;
}

export interface IBasicAuthMiddleware {
    basicAuth: {
        users: string[] | null;
    };
}

export interface IIPWhitelistMiddleware {
    ipwhitelist: {
        sourcerange: string[] | null;
        ipStrategy: {
            depth: number;
        };
    };
}

export interface IPluginMiddleware {
    plugin: ITokenAuthMiddleware;
}

export interface ITokenAuthMiddleware {
    api_token_middleware: {
        authenticationErrorMsg: string;
        authenticationHeader: string;
        authenticationHeaderName: string;
        bearerHeader: string;
        bearerHeaderName: string;
        permissiveMode: string;
        removeHeadersOnSuccess: string;
        removeTokenNameOnFailure: string;
        timestampUnix: string;
        tokens: string[] | null;
        whitelistIPs: string[] | null;
    };
}

export interface IStripPrefixMiddleware {
    stripprefix: {
        prefixes: string;
    };
}
