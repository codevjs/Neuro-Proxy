import {NextResponse} from 'next/server';

import container from '@/server-container';
import {TraefikAPIRepository} from '@/repositories/api/traefik/traefik.api';
import {DockerApiRepository} from '@/repositories/api/docker/docker.api';

export async function GET() {
    try {
        const traefikAPI = container.resolve(TraefikAPIRepository);
        const dockerAPI = container.resolve(DockerApiRepository);

        let traefikStatus = 'unknown';
        let dockerStatus = 'unknown';
        let routeCount = 0;
        let containerCount = 0;

        // Check Traefik connectivity
        try {
            const overview = await traefikAPI.overview();

            traefikStatus = 'connected';
            routeCount = overview.http?.routers?.total || 0;
        } catch (error) {
            traefikStatus = 'disconnected';
        }

        // Check Docker connectivity
        try {
            const containers = await dockerAPI.getAllContainer();

            dockerStatus = 'connected';
            containerCount = containers.length;
        } catch (error) {
            dockerStatus = 'disconnected';
        }

        const overallStatus = traefikStatus === 'connected' && dockerStatus === 'connected' ? 'healthy' : 'degraded';

        return NextResponse.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            service: 'kalla-proxy-dashboard',
            checks: {
                traefik: {
                    status: traefikStatus,
                    routes: routeCount,
                },
                docker: {
                    status: dockerStatus,
                    containers: containerCount,
                },
            },
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'kalla-proxy-dashboard',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            {status: 500}
        );
    }
}
