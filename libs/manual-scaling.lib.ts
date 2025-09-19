import fs from 'fs';

import {createId} from '@paralleldrive/cuid2';

import container from '../server-container';
import {DockerApiRepository} from '../repositories/api/docker/docker.api';
import {TreafikConfigRepository} from '../repositories/file/traefik/traefik.file';

const dockerApiRepository = container.resolve(DockerApiRepository);
const traefikConfigRepository = container.resolve(TreafikConfigRepository);

export interface ScaledService {
    serviceName: string;
    masterContainer: string;
    replicas: Array<{
        id: string;
        name: string;
        status: 'running' | 'stopped' | 'error';
        createdAt: number;
    }>;
    port: string;
    createdAt: number;
    updatedAt: number;
}

const SCALING_DATA = '/app/traefik/manual-scaling.json';

const loadScaledServices = (): ScaledService[] => {
    if (fs.existsSync(SCALING_DATA)) {
        try {
            return JSON.parse(fs.readFileSync(SCALING_DATA, 'utf8'));
        } catch (error) {
            console.error('Error loading scaling data:', error);

            return [];
        }
    }

    return [];
};

const saveScaledServices = (services: ScaledService[]) => {
    fs.writeFileSync(SCALING_DATA, JSON.stringify(services, null, 2));
};

const updateTraefikLoadBalancer = async (serviceName: string, servers: string[]): Promise<void> => {
    try {
        const config = await traefikConfigRepository.getDynamicConfig();

        if (!config.http) {
            config.http = {
                services: {},
                routers: {},
                middlewares: {},
            };
        }
        if (!config.http.services) config.http.services = {};

        // Update load balancer servers
        if (config.http.services[serviceName]) {
            // For multiple servers, we need to use the correct structure
            if (servers.length === 1) {
                config.http.services[serviceName].loadbalancer = {
                    server: {url: servers[0]},
                };
            } else {
                // For multiple servers, we'll use dynamic config format
                (config.http.services[serviceName] as any).loadBalancer = {
                    servers: servers.map((server) => ({url: server})),
                };
            }

            await traefikConfigRepository.updateDynamicConfig(config);
            console.log(`✅ Updated Traefik load balancer for ${serviceName} with ${servers.length} servers`);
        } else {
            throw new Error(`Service ${serviceName} not found in Traefik config`);
        }
    } catch (error) {
        console.error(`Failed to update Traefik config for ${serviceName}:`, error);
        throw error;
    }
};

export const getScaledServices = (): ScaledService[] => {
    return loadScaledServices();
};

export const getScaledService = (serviceName: string): ScaledService | undefined => {
    const services = loadScaledServices();

    return services.find((s) => s.serviceName === serviceName);
};

export const scaleUp = async (serviceName: string, masterContainerName: string, port: string = '3000'): Promise<void> => {
    try {
        console.log(`🚀 Scaling up service: ${serviceName}`);

        const services = loadScaledServices();
        let service = services.find((s) => s.serviceName === serviceName);

        // Create service entry if not exists
        if (!service) {
            service = {
                serviceName,
                masterContainer: masterContainerName,
                replicas: [],
                port,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            services.push(service);
        }

        // Create new replica
        const replicaName = `${masterContainerName}-replica-${createId()}`;

        console.log(`Creating replica: ${replicaName}`);

        const newReplica = await dockerApiRepository.duplicateContainer(masterContainerName, replicaName);

        // Wait for container to be ready
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Add replica to service
        service.replicas.push({
            id: newReplica.id,
            name: replicaName,
            status: 'running',
            createdAt: Date.now(),
        });
        service.updatedAt = Date.now();

        // Update Traefik load balancer
        const masterUrl = `http://${masterContainerName}:${port}`;
        const replicaUrls = service.replicas.filter((r) => r.status === 'running').map((r) => `http://${r.name}:${port}`);
        const allServers = [masterUrl, ...replicaUrls];

        await updateTraefikLoadBalancer(serviceName, allServers);

        // Save updated data
        saveScaledServices(services);

        console.log(`✅ Successfully scaled up ${serviceName} to ${service.replicas.length + 1} instances`);
    } catch (error) {
        console.error(`Failed to scale up ${serviceName}:`, error);
        throw error;
    }
};

export const scaleDown = async (serviceName: string): Promise<void> => {
    try {
        console.log(`🔽 Scaling down service: ${serviceName}`);

        const services = loadScaledServices();
        const service = services.find((s) => s.serviceName === serviceName);

        if (!service || service.replicas.length === 0) {
            throw new Error('No replicas to scale down');
        }

        // Remove the most recent replica (LIFO)
        const replicaToRemove = service.replicas.pop()!;

        console.log(`Removing replica: ${replicaToRemove.name}`);

        // Remove container
        await dockerApiRepository.removeContainer(replicaToRemove.id);

        service.updatedAt = Date.now();

        // Update Traefik load balancer
        const masterUrl = `http://${service.masterContainer}:${service.port}`;
        const replicaUrls = service.replicas.filter((r) => r.status === 'running').map((r) => `http://${r.name}:${service.port}`);
        const allServers = [masterUrl, ...replicaUrls];

        await updateTraefikLoadBalancer(serviceName, allServers);

        // Save updated data
        saveScaledServices(services);

        console.log(`✅ Successfully scaled down ${serviceName} to ${service.replicas.length + 1} instances`);
    } catch (error) {
        console.error(`Failed to scale down ${serviceName}:`, error);
        throw error;
    }
};

export const removeAllReplicas = async (serviceName: string): Promise<void> => {
    try {
        console.log(`🗑️  Removing all replicas for service: ${serviceName}`);

        const services = loadScaledServices();
        const service = services.find((s) => s.serviceName === serviceName);

        if (!service) {
            throw new Error('Service not found');
        }

        // Remove all replica containers
        for (const replica of service.replicas) {
            try {
                await dockerApiRepository.removeContainer(replica.id);
                console.log(`Removed replica: ${replica.name}`);
            } catch (error) {
                console.warn(`Failed to remove replica ${replica.name}:`, error);
            }
        }

        // Reset service to master only
        service.replicas = [];
        service.updatedAt = Date.now();

        // Update Traefik to master only
        const masterUrl = `http://${service.masterContainer}:${service.port}`;

        await updateTraefikLoadBalancer(serviceName, [masterUrl]);

        // Save updated data
        saveScaledServices(services);

        console.log(`✅ Successfully reset ${serviceName} to master only`);
    } catch (error) {
        console.error(`Failed to remove replicas for ${serviceName}:`, error);
        throw error;
    }
};

export const updateReplicaStatus = async (serviceName: string): Promise<void> => {
    try {
        const services = loadScaledServices();
        const service = services.find((s) => s.serviceName === serviceName);

        if (!service) return;

        // Check status of all replicas
        for (const replica of service.replicas) {
            try {
                const container = dockerApiRepository.getOneContainer(replica.id);
                const inspection = await container.inspect();

                replica.status = inspection.State.Running ? 'running' : 'stopped';
            } catch (error) {
                replica.status = 'error';
            }
        }

        service.updatedAt = Date.now();
        saveScaledServices(services);
    } catch (error) {
        console.error(`Failed to update replica status for ${serviceName}:`, error);
    }
};

export const getServiceStats = async (serviceName: string) => {
    const service = getScaledService(serviceName);

    if (!service) return null;

    await updateReplicaStatus(serviceName);

    const runningReplicas = service.replicas.filter((r) => r.status === 'running').length;
    const totalInstances = runningReplicas + 1; // +1 for master

    return {
        serviceName: service.serviceName,
        masterContainer: service.masterContainer,
        totalInstances,
        runningReplicas,
        replicas: service.replicas,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
    };
};
