'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {TraefikAPIRepository} from '@/repositories/api/traefik/traefik.api';

const traefikRepository = container.resolve(TreafikConfigRepository);
const traefikAPIRepository = container.resolve(TraefikAPIRepository);

export const getAllMiddlewareAction = async () => {
    try {
        await checkAbility('read', 'Router');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const data = Object.keys(config.http.middlewares).map((key) => {
            return {
                name: key,
                ...middlewares[key],
            };
        });

        return {
            success: true,
            data,
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

export const getAllEntryPointAction = async () => {
    try {
        await checkAbility('read', 'Router');

        const data = await traefikAPIRepository.getAllEntryPoints();

        return {
            success: true,
            data,
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

export const getAllRouterAction = async () => {
    try {
        await checkAbility('read', 'Router');

        const config = await traefikRepository.getDynamicConfig();

        const routers = config.http.routers;

        const data = Object.keys(config.http.routers).map((key) => {
            return {
                name: key,
                ...routers[key],
            };
        });

        return {
            success: true,
            data,
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
        await checkAbility('read', 'Router');

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

export const createRouterAction = async (name: string, data: {rule: string; service: string; middlewares: string[]; entryPoints: string[]}) => {
    try {
        await checkAbility('create', 'Router');

        const config = await traefikRepository.getDynamicConfig();

        // check if router already exists
        if (config.http.routers[name]) throw new Error('Router already exists');

        config.http.routers[name] = {
            rule: data.rule,
            service: data.service,
            middlewares: data.middlewares.length > 0 ? data.middlewares : undefined,
            entryPoints: data.entryPoints,
        };

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Router created successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        if (error instanceof Error)
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

export const updateRouterAction = async (name: string, data: {rule: string; service: string; middlewares: string[]; entryPoints: string[]}) => {
    try {
        await checkAbility('update', 'Router');

        const config = await traefikRepository.getDynamicConfig();

        // check if router exists
        if (!config.http.routers[name]) throw new Error('Router not found');

        config.http.routers[name] = {
            rule: data.rule,
            service: data.service,
            middlewares: data.middlewares.length > 0 ? data.middlewares : undefined,
            entryPoints: data.entryPoints,
        };

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Router updated successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        if (error instanceof Error)
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

export const deleteRouterAction = async (name: string) => {
    try {
        await checkAbility('delete', 'Router');

        const config = await traefikRepository.getDynamicConfig();

        // check if router exists
        if (!config.http.routers[name]) throw new Error('Router not found');

        delete config.http.routers[name];

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Router deleted successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        if (error instanceof Error)
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
