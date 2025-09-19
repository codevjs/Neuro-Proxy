import {NextResponse} from 'next/server';
import axios from 'axios';

interface ServiceHealth {
    name: string;
    url: string;
    status: 'up' | 'down' | 'unknown';
    responseTime?: number;
    lastCheck: string;
    statusCode?: number;
    error?: string;
    provider?: string;
    loadBalancer?: any;
}

interface TraefikService {
    name: string;
    provider: string;
    status: string;
    type: string;
    loadBalancer?: {
        servers?: Array<{
            url: string;
        }>;
    };
}

async function checkServiceHealth(name: string, url: string, provider?: string): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
        // Clean up the URL - remove any path and just ping the base
        const urlObj = new URL(url);
        const checkUrl = `${urlObj.protocol}//${urlObj.host}`;

        const response = await axios.get(checkUrl, {
            timeout: 5000,
            validateStatus: () => true, // Accept any status code
            headers: {
                'User-Agent': 'Kalla-Proxy-Health-Check',
            },
        });

        const responseTime = Date.now() - startTime;

        return {
            name,
            url,
            status: response.status < 500 ? 'up' : 'down',
            responseTime,
            statusCode: response.status,
            lastCheck: new Date().toISOString(),
            provider,
        };
    } catch (error: any) {
        // If connection refused or timeout, mark as down
        return {
            name,
            url,
            status: 'down',
            responseTime: Date.now() - startTime,
            error: error.code === 'ECONNREFUSED' ? 'Service unreachable' : error.message,
            lastCheck: new Date().toISOString(),
            provider,
        };
    }
}

async function fetchTraefikServices(): Promise<TraefikService[]> {
    try {
        const response = await axios.get('http://localhost:8080/api/http/services', {
            timeout: 5000,
        });

        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch Traefik services:', error);

        return [];
    }
}

export async function GET() {
    try {
        // Fetch actual services from Traefik API
        const traefikServices = await fetchTraefikServices();

        // Extract service URLs for health checking
        const servicesToCheck = traefikServices
            .filter((service) => service.loadBalancer?.servers && service.loadBalancer.servers.length > 0)
            .map((service) => ({
                name: service.name,
                url: service.loadBalancer!.servers![0].url,
                provider: service.provider,
            }));

        // Add core infrastructure services
        const coreServices = [
            {name: 'Traefik API', url: 'http://localhost:8080/api/overview', provider: 'infrastructure'},
            {name: 'Traefik Ping', url: 'http://localhost:8080/ping', provider: 'infrastructure'},
            {name: 'Dashboard', url: 'http://localhost:3000/api/health', provider: 'infrastructure'},
        ];

        // Combine all services
        const allServices = [...coreServices, ...servicesToCheck];

        // Check all services in parallel
        const healthChecks = await Promise.all(allServices.map((service) => checkServiceHealth(service.name, service.url, service.provider)));

        // Calculate overall system status
        const allUp = healthChecks.every((check) => check.status === 'up');
        const someDown = healthChecks.some((check) => check.status === 'down');

        let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

        if (someDown && !allUp) {
            overallStatus = 'degraded';
        } else if (healthChecks.every((check) => check.status === 'down')) {
            overallStatus = 'down';
        }

        return NextResponse.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services: healthChecks,
            summary: {
                total: healthChecks.length,
                up: healthChecks.filter((s) => s.status === 'up').length,
                down: healthChecks.filter((s) => s.status === 'down').length,
            },
        });
    } catch (error) {
        console.error('Health check error:', error);

        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to perform health check',
                timestamp: new Date().toISOString(),
            },
            {status: 500}
        );
    }
}
