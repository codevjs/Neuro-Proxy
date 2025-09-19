export interface ITreafikOverviewApi {
    http: {
        routers: {
            total: number;
            warnings: number;
            errors: number;
        };
        services: {
            total: number;
            warnings: number;
            errors: number;
        };
        middlewares: {
            total: number;
            warnings: number;
            errors: number;
        };
    };
    // tcp: Tcp;
    // udp: Udp;
    features: {
        tracing: boolean;
        metrics: boolean;
        accessLog: boolean;
    };
    providers: string[];
}

export interface ITreafikServiceApi {
    loadBalancer?: {
        servers: {
            url: string;
        }[];
        passHostHeader: boolean;
        responseForwarding: {
            flushInterval: string;
        };
    };
    status: string;
    usedBy: string[];
    serverStatus?: {
        [key: string]: string;
    };
    name: string;
    provider: string;
    type?: string;
}

export interface ITreafikRouterApi {
    entryPoints: string[];
    middlewares: string[];
    service: string;
    rule: string;
    priority: number;
    error?: string[];
    status: 'enabled' | 'disabled';
    using: string[];
    name: string;
    provider: string;
}

export interface ITreafikEntryPointsApi {
    address: string;
    transport: {
        lifeCycle: {
            graceTimeOut: string;
        };
        respondingTimeouts: {
            readTimeout: string;
            idleTimeout: string;
        };
    };
    forwardedHeaders: {};
    http: {
        maxHeaderBytes: number;
    };
    http2: {
        maxConcurrentStreams: number;
    };
    udp: {
        timeout: string;
    };
    observability: {
        accessLogs: boolean;
        tracing: boolean;
        metrics: boolean;
    };
    name: string;
}
