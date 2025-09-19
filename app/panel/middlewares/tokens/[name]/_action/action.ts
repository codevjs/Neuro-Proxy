'use server';

import {ForbiddenError} from '@casl/ability';
import {createId} from '@paralleldrive/cuid2';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {IPluginMiddleware} from '@/repositories/file/traefik/treafik.file.interface';
import {TokenRepository} from '@/repositories/database/panel/middlewares/tokens/token.db';

const traefikRepository = container.resolve(TreafikConfigRepository);
const tokenRepository = container.resolve(TokenRepository);

export const getOneMiddlewareAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        const middleware = config.http.middlewares[middlewareName];

        if (!middleware) throw new Error('Middleware not found');

        return {
            success: true,
            data: {
                name: middlewareName,
                ...middleware,
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

export const getAllTokenAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const middleware = middlewares[middlewareName] as IPluginMiddleware;

        const tokenData = await tokenRepository.getAll();

        const mappedData = (middleware.plugin.api_token_middleware.tokens ?? []).map((token) => {
            const found = tokenData.find((item) => item.token === token);

            return {
                id: createId(),
                token,
                name: found?.name ?? null,
            };
        });

        return {
            success: true,
            data: mappedData,
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

export const getAllWhitelistIPAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const middleware = middlewares[middlewareName] as IPluginMiddleware;

        return {
            success: true,
            data: (middleware.plugin.api_token_middleware.whitelistIPs ?? []).map((ip) => ({
                id: createId(),
                ip,
            })),
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

export const createTokenAction = async (middlewareName: string, token: string, name?: string) => {
    try {
        await checkAbility('create', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IPluginMiddleware;

        if (middleware.plugin.api_token_middleware.tokens?.includes(token)) throw new Error('Token already exists');

        config.http.middlewares[middlewareName] = {
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
                    tokens: [...((config.http.middlewares[middlewareName] as IPluginMiddleware).plugin.api_token_middleware.tokens ?? []), token],
                    whitelistIPs: middleware.plugin.api_token_middleware.whitelistIPs ?? [],
                },
            },
        };

        await traefikRepository.updateDynamicConfig(config);
        await tokenRepository.create({
            name,
            token,
        });

        return {
            success: true,
            message: 'Token created successfully',
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

export const createWhitelistIPAction = async (middlewareName: string, ip: string) => {
    try {
        await checkAbility('create', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IPluginMiddleware;

        if (middleware.plugin.api_token_middleware.whitelistIPs?.includes(ip)) throw new Error('IP already exists');

        config.http.middlewares[middlewareName] = {
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
                    tokens: middleware.plugin.api_token_middleware.tokens,
                    whitelistIPs: [
                        ...((config.http.middlewares[middlewareName] as IPluginMiddleware).plugin.api_token_middleware.whitelistIPs ?? []),
                        ip,
                    ],
                },
            },
        };

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'IP added successfully',
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

export const deleteTokenAction = async (middlewareName: string, token: string) => {
    try {
        await checkAbility('delete', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IPluginMiddleware;

        const result = middleware.plugin.api_token_middleware.tokens?.filter((cr) => cr !== token);

        (config.http.middlewares[middlewareName] as IPluginMiddleware).plugin.api_token_middleware.tokens =
            result && result.length > 0 ? result : null;

        await traefikRepository.updateDynamicConfig(config);
        await tokenRepository.delete({
            token,
        });

        return {
            success: true,
            message: 'Token deleted successfully',
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

export const deleteWhitelistAction = async (middlewareName: string, ip: string) => {
    try {
        await checkAbility('delete', 'Token');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IPluginMiddleware;

        const result = middleware.plugin.api_token_middleware.whitelistIPs?.filter((cr) => cr !== ip);

        (config.http.middlewares[middlewareName] as IPluginMiddleware).plugin.api_token_middleware.whitelistIPs =
            result && result.length > 0 ? result : null;

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'IP deleted successfully',
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
