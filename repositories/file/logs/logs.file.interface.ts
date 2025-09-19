export interface ITreafikLogs {
    ClientAddr: string;
    ClientHost: string;
    ClientPort: string;
    ClientUsername: string;
    DownstreamContentSize: number;
    DownstreamStatus: number;
    Duration: number;
    OriginContentSize: number;
    OriginDuration: number;
    OriginStatus: number;
    Overhead: number;
    RequestAddr: string;
    RequestContentSize: number;
    RequestCount: number;
    RequestHost: string;
    RequestMethod: string;
    RequestPath: string;
    RequestPort: string;
    RequestProtocol: string;
    RequestScheme: string;
    RetryAttempts: number;
    RouterName: string;
    ServiceAddr: string;
    ServiceName: string;
    ServiceURL: string;
    StartLocal: string;
    StartUTC: string;
    entryPointName: string;
    level: string;
    msg: string;
    time: Date;
    // Request headers - match actual Traefik log format
    'request_X-Forwarded-For'?: string; // String, not array
    'request_X-Real-Ip'?: string; // Note: Ip not IP in actual logs
    'request_X-Forwarded-Host'?: string;
    'request_X-Original-Ip'?: string; // From actual log
    'request_Cf-Connecting-Ip'?: string; // Cloudflare (dash, not underscore)
    'request_True-Client-IP'?: string; // Akamai
    'request_X-Client-Ip'?: string;
    'request_X-Cluster-Client-IP'?: string;
    'request_User-Agent'?: string;
    request_Referer?: string;
    'request_X-Forwarded-Proto'?: string;
    'request_X-Forwarded-Port'?: string;
    'request_X-Forwarded-Server'?: string;
}
