'use server';

import {checkAbility} from '@/libs/casl-ability.lib';
import container from '@/server-container';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {TraefikAPIRepository} from '@/repositories/api/traefik/traefik.api';

interface RouteDetails {
    name: string;
    rule: string;
    service: string;
    middlewares: string[];
    entryPoints: string[];
    priority?: number;
    serviceUrl?: string;
    middlewareChain: MiddlewareInfo[];
}

interface MiddlewareInfo {
    name: string;
    type: 'basicAuth' | 'ipwhitelist' | 'stripprefix' | 'headers' | 'plugin' | 'unknown';
    config: Record<string, unknown>;
}

export async function getRouteDetailsAction(routeName: string): Promise<{success: boolean; data?: RouteDetails; error?: string}> {
    try {
        await checkAbility('read', 'Router');

        const traefikConfigRepository = container.resolve(TreafikConfigRepository);
        const config = await traefikConfigRepository.getDynamicConfig();

        if (!config.http?.routers?.[routeName]) {
            return {success: false, error: 'Route not found'};
        }

        const router = config.http.routers[routeName];
        const serviceName = router.service?.replace('@file', '') || '';

        // Get service URL
        let serviceUrl = '';

        if (config.http.services?.[serviceName]) {
            const service = config.http.services[serviceName];

            serviceUrl = service.loadBalancer?.servers?.[0]?.url || service.loadbalancer?.server?.url || '';
        }

        // Get middleware details using Traefik API
        const middlewareChain: MiddlewareInfo[] = [];

        if (router.middlewares) {
            const traefikApiRepository = container.resolve(TraefikAPIRepository);
            const allMiddlewares = await traefikApiRepository.getAllMiddlewares();

            for (const middlewareName of router.middlewares) {
                const apiMiddleware = allMiddlewares.find((m) => m.name === middlewareName);

                if (apiMiddleware) {
                    let type: MiddlewareInfo['type'] = 'unknown';
                    let config: Record<string, unknown> = {};

                    // Map API types to our types
                    if (apiMiddleware.type === 'basicauth') {
                        type = 'basicAuth';
                        config = apiMiddleware.basicAuth || {};
                    } else if (apiMiddleware.type === 'ipwhitelist') {
                        type = 'ipwhitelist';
                        config = apiMiddleware.ipWhiteList || {};
                    } else if (apiMiddleware.type === 'stripprefix') {
                        type = 'stripprefix';
                        config = apiMiddleware.stripPrefix || {};
                    } else if (apiMiddleware.type === 'headers') {
                        type = 'headers';
                        config = apiMiddleware.headers || {};
                    } else if ((apiMiddleware.type && apiMiddleware.type.includes('plugin')) || apiMiddleware.plugin) {
                        type = 'plugin';
                        config = apiMiddleware.plugin || {};
                    }

                    middlewareChain.push({
                        name: middlewareName,
                        type,
                        config,
                    });
                }
            }
        }

        const routeDetails: RouteDetails = {
            name: routeName,
            rule: router.rule || '',
            service: serviceName,
            middlewares: router.middlewares || [],
            entryPoints: router.entryPoints || [],
            priority: router.priority,
            serviceUrl,
            middlewareChain,
        };

        return {success: true, data: routeDetails};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get route details',
        };
    }
}

export async function testRouteAction(
    _routeName: string,
    testUrl: string,
    customHeaders?: Record<string, string>
): Promise<{success: boolean; data?: any; error?: string}> {
    try {
        await checkAbility('read', 'Router');

        const startTime = Date.now();

        try {
            const headers: Record<string, string> = {
                'User-Agent': 'Traefik-Route-Tester/1.0',
                ...customHeaders,
            };

            const response = await fetch(testUrl, {
                method: 'GET',
                headers,
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            const result: {
                status: number;
                statusText: string;
                headers: Record<string, string>;
                responseTime: number;
                url: string;
                redirected: boolean;
                ok: boolean;
                body?: string;
            } = {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                responseTime,
                url: response.url,
                redirected: response.redirected,
                ok: response.ok,
            };

            // Try to get response body (limit to avoid memory issues)
            try {
                const text = await response.text();

                result.body = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
            } catch (e) {
                result.body = '[Unable to read response body]';
            }

            return {success: true, data: result};
        } catch (fetchError) {
            return {
                success: false,
                error: fetchError instanceof Error ? fetchError.message : 'Request failed',
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to test route',
        };
    }
}
