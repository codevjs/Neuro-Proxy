'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {TraefikAPIRepository} from '@/repositories/api/traefik/traefik.api';

const traefikAPIRepository = container.resolve(TraefikAPIRepository);

export const getOverviewAction = async () => {
    try {
        const data = await traefikAPIRepository.overview();

        return {
            success: true,
            data: data,
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

export const getOneRouterAction = async (name: string) => {
    try {
        const result = await traefikAPIRepository.getRouterByName(name);

        return {
            success: true,
            data: result,
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

export const getAllRouters = async () => {
    try {
        const data = await traefikAPIRepository.getAllRouters();

        return {
            success: true,
            data: data.filter((router) => router.name.endsWith('@file') && !router.name.startsWith('kalla_proxy')),
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
