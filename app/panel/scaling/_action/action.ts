'use server';

import {revalidatePath} from 'next/cache';

import {checkAbility} from '@/libs/casl-ability.lib';
import {scaleUp, scaleDown, removeAllReplicas, getScaledServices, getServiceStats} from '@/libs/manual-scaling.lib';
import container from '@/server-container';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {DockerApiRepository} from '@/repositories/api/docker/docker.api';

interface RouteInfo {
    name: string;
    rule: string;
    service: string;
    container: string;
    port: string;
    replicas: number;
    canScale: boolean;
}

export async function scaleUpAction(serviceName: string, masterContainer: string, port: string = '3000') {
    try {
        await checkAbility('create', 'Container');

        await scaleUp(serviceName, masterContainer, port);

        revalidatePath('/panel/scaling');

        return {success: true, message: `Successfully scaled up ${serviceName}`};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scale up service',
        };
    }
}

export async function scaleDownAction(serviceName: string) {
    try {
        await checkAbility('delete', 'Container');

        await scaleDown(serviceName);

        revalidatePath('/panel/scaling');

        return {success: true, message: `Successfully scaled down ${serviceName}`};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scale down service',
        };
    }
}

export async function removeAllReplicasAction(serviceName: string) {
    try {
        await checkAbility('delete', 'Container');

        await removeAllReplicas(serviceName);

        revalidatePath('/panel/scaling');

        return {success: true, message: `Successfully removed all replicas for ${serviceName}`};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove replicas',
        };
    }
}

export async function getScaledServicesAction() {
    try {
        await checkAbility('read', 'Container');

        return {success: true, data: getScaledServices()};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get scaled services',
        };
    }
}

export async function getServiceStatsAction(serviceName: string) {
    try {
        await checkAbility('read', 'Container');

        const stats = await getServiceStats(serviceName);

        return {success: true, data: stats};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get service stats',
        };
    }
}

export async function getAllRoutesAction(): Promise<{success: boolean; data?: RouteInfo[]; error?: string}> {
    try {
        await checkAbility('read', 'Router');

        const traefikConfigRepository = container.resolve(TreafikConfigRepository);
        const config = await traefikConfigRepository.getDynamicConfig();

        if (!config.http?.routers || !config.http?.services) {
            return {success: true, data: []};
        }

        const routes: RouteInfo[] = [];
        const scaledServices = getScaledServices();

        // Extract container name from service URL
        const getContainerFromService = async (serviceName: string): Promise<{container: string; port: string}> => {
            const service = config.http.services[serviceName.replace(/@file|@docker/g, '')];

            if (!service?.loadBalancer?.servers?.[0]?.url && !service?.loadbalancer?.server?.url) {
                // For @docker services, get container name from Docker API
                if (serviceName.includes('@docker')) {
                    const containerName = serviceName.replace('-integrationdashboard@docker', '');

                    try {
                        const dockerApiRepository = container.resolve(DockerApiRepository);
                        const containers = await dockerApiRepository.getAllContainer();
                        const dockerContainer = containers.find((c) => c.Names.some((name) => name.includes(containerName)));

                        if (dockerContainer) {
                            // Get the first exposed port or default to 3000
                            const ports = Object.keys(dockerContainer.Ports || {});
                            const port = ports.length > 0 ? ports[0].split('/')[0] : '3000';

                            return {container: dockerContainer.Names[0].replace('/', ''), port};
                        }
                    } catch (error) {
                        console.warn(`Could not get container info for ${containerName}:`, error);
                    }

                    return {container: containerName, port: '3000'};
                }

                return {container: serviceName, port: '3000'};
            }

            // Handle both loadBalancer (multi-server) and loadbalancer (single server) formats
            const url = service.loadBalancer?.servers?.[0]?.url || service.loadbalancer?.server?.url;

            if (url) {
                const match = url.match(/http:\/\/([^:]+):(\d+)/);

                if (match) {
                    return {container: match[1], port: match[2]};
                }
            }
            // Fallback for @docker services
            if (serviceName.includes('@docker')) {
                const containerName = serviceName.replace('-integrationdashboard@docker', '');

                return {container: containerName, port: '3000'};
            }

            return {container: serviceName, port: '3000'};
        };

        // Process routes asynchronously
        for (const [routeName, router] of Object.entries(config.http.routers)) {
            if (router.service && typeof router.service === 'string') {
                // Remove provider suffixes (@file, @docker) for service lookup
                const serviceName = router.service.replace(/@file|@docker/g, '');
                const {container, port} = await getContainerFromService(router.service);

                // Get replica count from scaled services
                const scaledService = scaledServices.find((s) => s.serviceName === serviceName);
                const replicas = scaledService?.replicas.length || 0;

                // Determine if this route can be scaled (exclude internal routes)
                const canScale = !routeName.includes('api@internal') && !routeName.includes('dashboard@internal') && !serviceName.includes('traefik');

                routes.push({
                    name: routeName,
                    rule: router.rule || '',
                    service: serviceName,
                    container,
                    port,
                    replicas,
                    canScale,
                });
            }
        }

        return {success: true, data: routes};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get routes',
        };
    }
}
