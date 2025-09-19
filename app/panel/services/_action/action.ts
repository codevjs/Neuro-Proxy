'use server';

import { ForbiddenError } from '@casl/ability';
import axios from 'axios';

import container from '@/server-container';
import { checkAbility } from '@/libs/casl-ability.lib';
import { TraefikAPIRepository } from '@/repositories/api/traefik/traefik.api';

const traefikAPIRepository = container.resolve(TraefikAPIRepository);

interface ServiceHealthStatus {
    [serviceName: string]: {
        status: 'up' | 'down' | 'unknown';
        responseTime?: number;
        lastCheck: string;
    };
}

async function checkServiceHealth(url: string): Promise<{ status: 'up' | 'down' | 'unknown'; responseTime?: number }> {
    const startTime = Date.now();

    try {
        const urlObj = new URL(url);
        const checkUrl = `${urlObj.protocol}//${urlObj.host}`;

        const response = await axios.get(checkUrl, {
            timeout: 3000,
            validateStatus: () => true,
            headers: {
                'User-Agent': 'Neuro-Proxy-Health-Check',
            },
        });

        return {
            status: response.status < 500 ? 'up' : 'down',
            responseTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
        };
    }
}

export const getAllServiceAction = async (options?: { page?: number; limit?: number; search?: string; includeHealth?: boolean }) => {
    try {
        await checkAbility('read', 'Service');

        const { page = 1, limit = 15, search = '', includeHealth = false } = options || {};

        const data = await traefikAPIRepository.getAllServices();

        // Apply search filter
        let filteredData = data;

        if (search) {
            filteredData = data.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()));
        }

        // Calculate pagination
        const totalCount = filteredData.length;
        const pageCount = Math.ceil(totalCount / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        // Only perform health checks if explicitly requested and for current page only
        let servicesWithHealth = paginatedData;

        if (includeHealth) {
            const healthChecks: ServiceHealthStatus = {};

            const healthPromises = paginatedData
                .filter((service) => service.loadBalancer?.servers && service.loadBalancer.servers.length > 0)
                .map(async (service) => {
                    const url = service.loadBalancer!.servers![0].url;
                    const health = await checkServiceHealth(url);

                    healthChecks[service.name] = {
                        ...health,
                        lastCheck: new Date().toISOString(),
                    };
                });

            await Promise.all(healthPromises);

            servicesWithHealth = paginatedData.map((service) => ({
                ...service,
                health: healthChecks[service.name] || { status: 'unknown', lastCheck: new Date().toISOString() },
            }));
        }

        return {
            success: true,
            data: servicesWithHealth,
            meta: {
                pageCount,
                totalCount,
                currentPage: page,
                isFirstPage: page === 1,
                isLastPage: page === pageCount,
                previousPage: page > 1 ? page - 1 : null,
                nextPage: page < pageCount ? page + 1 : null,
            },
        };
    } catch (error) {
        console.error(error);

        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Something went wrong',
        };
    }
};

export const getServicesHealthAction = async (serviceNames: string[]) => {
    try {
        await checkAbility('read', 'Service');

        const healthChecks: ServiceHealthStatus = {};
        const services = await traefikAPIRepository.getAllServices();

        const targetServices = services.filter((service) => serviceNames.includes(service.name));

        const healthPromises = targetServices
            .filter((service) => service.loadBalancer?.servers && service.loadBalancer.servers.length > 0)
            .map(async (service) => {
                const url = service.loadBalancer!.servers![0].url;
                const health = await checkServiceHealth(url);

                healthChecks[service.name] = {
                    ...health,
                    lastCheck: new Date().toISOString(),
                };
            });

        await Promise.all(healthPromises);

        return {
            success: true,
            data: healthChecks,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: 'Failed to check service health',
        };
    }
};
