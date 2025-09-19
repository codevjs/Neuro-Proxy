import {ITreafikLogs} from '@/repositories/file/logs/logs.file.interface';

export interface RealIPResult {
    realIP: string;
    source: string;
    proxyChain?: string[];
    isPrivate: boolean;
}

/**
 * Check if an IP address is private/internal
 */
export function isPrivateIP(ip: string): boolean {
    if (!ip) return false;

    // Remove port if present
    const cleanIP = ip.split(':')[0];

    // IPv4 private ranges
    const ipv4PrivateRanges = [
        /^10\./, // 10.0.0.0/8
        /^192\.168\./, // 192.168.0.0/16
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
        /^127\./, // 127.0.0.0/8 (localhost)
        /^169\.254\./, // 169.254.0.0/16 (link-local)
        /^::1$/, // IPv6 localhost
        /^fe80:/, // IPv6 link-local
        /^fc00:/, // IPv6 unique local
        /^fd00:/, // IPv6 unique local
    ];

    return ipv4PrivateRanges.some((range) => range.test(cleanIP));
}

/**
 * Parse X-Forwarded-For header which can contain multiple IPs (comma-separated)
 */
export function parseForwardedFor(forwardedFor: string | undefined): string[] {
    if (!forwardedFor) return [];

    // Split by comma and clean up
    return forwardedFor
        .split(',')
        .map((ip) => ip.trim())
        .filter((ip) => ip);
}

/**
 * Extract the real client IP from various headers with priority order
 */
export function extractRealIP(logEntry: ITreafikLogs): RealIPResult {
    const clientAddr = logEntry.ClientAddr || '';

    // Priority order for IP extraction (most trusted first)
    // Use actual header names from Traefik logs
    const ipSources = [
        {
            value: logEntry['request_True-Client-IP'], // Akamai
            source: 'True-Client-IP',
            single: true,
        },
        {
            value: logEntry['request_Cf-Connecting-Ip'], // Cloudflare
            source: 'CF-Connecting-IP',
            single: true,
        },
        {
            value: logEntry['request_X-Real-Ip'],
            source: 'X-Real-IP',
            single: true,
        },
        {
            value: logEntry['request_X-Client-Ip'],
            source: 'X-Client-IP',
            single: true,
        },
        {
            value: logEntry['request_X-Original-Ip'],
            source: 'X-Original-IP',
            single: true,
        },
        {
            value: logEntry['request_X-Cluster-Client-IP'],
            source: 'X-Cluster-Client-IP',
            single: true,
        },
        {
            value: logEntry['request_X-Forwarded-For'],
            source: 'X-Forwarded-For',
            single: false,
        },
    ];

    // Try each source in priority order
    for (const source of ipSources) {
        if (!source.value) continue;

        let candidateIPs: string[] = [];

        if (source.single) {
            candidateIPs = [source.value as string];
        } else {
            candidateIPs = parseForwardedFor(source.value as string);
        }

        // Find the first public IP in the chain
        for (const ip of candidateIPs) {
            const cleanIP = ip.trim();

            if (cleanIP && !isPrivateIP(cleanIP)) {
                return {
                    realIP: cleanIP,
                    source: source.source,
                    proxyChain: candidateIPs.length > 1 ? candidateIPs : undefined,
                    isPrivate: false,
                };
            }
        }

        // If no public IP found, use the first IP from the most trusted source
        if (candidateIPs.length > 0) {
            const firstIP = candidateIPs[0].trim();

            if (firstIP) {
                return {
                    realIP: firstIP,
                    source: source.source,
                    proxyChain: candidateIPs.length > 1 ? candidateIPs : undefined,
                    isPrivate: isPrivateIP(firstIP),
                };
            }
        }
    }

    // Fallback to ClientAddr
    return {
        realIP: clientAddr,
        source: 'ClientAddr',
        isPrivate: isPrivateIP(clientAddr),
    };
}

/**
 * Format IP display with additional context
 */
export function formatIPDisplay(
    result: RealIPResult,
    clientAddr: string
): {
    mainIP: string;
    subtitle?: string;
    tooltip?: string;
} {
    const mainIP = result.realIP;
    let subtitle: string | undefined;
    let tooltip: string | undefined;

    // If real IP is different from client address, show via information
    if (result.realIP !== clientAddr && result.source !== 'ClientAddr') {
        subtitle = `via ${clientAddr}`;
        tooltip = `Real IP extracted from ${result.source}`;

        if (result.proxyChain && result.proxyChain.length > 1) {
            tooltip += `\nProxy chain: ${result.proxyChain.join(' → ')}`;
        }
    }

    // Add private IP indicator
    if (result.isPrivate) {
        tooltip = tooltip ? `${tooltip}\n(Private IP)` : 'Private IP';
    }

    return {
        mainIP,
        subtitle,
        tooltip,
    };
}
