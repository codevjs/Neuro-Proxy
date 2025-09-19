'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';

const traefikRepository = container.resolve(TreafikConfigRepository);

export const getAllMiddlewareAction = async () => {
    try {
        await checkAbility('read', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const data = Object.keys(config.http.middlewares)
            .map((key) => {
                return {
                    name: key,
                    ...middlewares[key],
                };
            })
            .filter((item) => item['ipwhitelist']);

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

export const createMiddlewareAction = async (name: string) => {
    try {
        await checkAbility('create', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        // check if middleware already exists
        if (config.http.middlewares[name]) throw new Error('Middleware already exists');

        config.http.middlewares[name] = {
            ipwhitelist: {
                sourcerange: null,
                ipStrategy: {
                    depth: 1,
                },
            },
        };

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Middleware created successfully',
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

export const deleteMiddlewareAction = async (name: string) => {
    try {
        await checkAbility('delete', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        // check if middleware exists
        if (!config.http.middlewares[name]) throw new Error('Middleware not found');

        // check if middleware is used
        const used = Object.values(config.http.routers).filter((router) => router.middlewares?.includes(`${name}@file`));

        if (used.length) throw new Error(`Middleware is used in router service ${used.map((router) => router.service).join(', ')}`);

        delete config.http.middlewares[name];

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Middleware deleted successfully',
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
