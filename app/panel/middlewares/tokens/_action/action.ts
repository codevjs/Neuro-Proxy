'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {IPluginMiddleware} from '@/repositories/file/traefik/treafik.file.interface';

const traefikRepository = container.resolve(TreafikConfigRepository);

export const getAllMiddlewareAction = async () => {
    try {
        await checkAbility('read', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const data = Object.keys(config.http.middlewares)
            .filter((item) => {
                const plugin = middlewares[item] as IPluginMiddleware;

                return plugin.plugin?.api_token_middleware;
            })
            .map((key) => {
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

export const createMiddlewareAction = async (name: string) => {
    try {
        await checkAbility('create', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        // check if middleware already exists
        if (config.http.middlewares[name]) throw new Error('Middleware already exists');

        config.http.middlewares[name] = {
            plugin: {
                api_token_middleware: {
                    authenticationErrorMsg: 'Access Denied',
                    authenticationHeader: 'true',
                    authenticationHeaderName: 'X-API-TOKEN',
                    bearerHeader: 'true',
                    bearerHeaderName: 'Authorization',
                    permissiveMode: 'false',
                    removeHeadersOnSuccess: 'true',
                    removeTokenNameOnFailure: 'false',
                    timestampUnix: 'false',
                    tokens: null,
                    whitelistIPs: null,
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
        await checkAbility('delete', 'Token');

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
