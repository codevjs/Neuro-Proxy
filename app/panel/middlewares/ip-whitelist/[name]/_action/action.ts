'use server';

import {ForbiddenError} from '@casl/ability';
import {createId} from '@paralleldrive/cuid2';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {IIPWhitelistMiddleware} from '@/repositories/file/traefik/treafik.file.interface';
import {IPWhitelistRepository} from '@/repositories/database/panel/middlewares/ip-whitelist/ip-whitelist.db';

const traefikRepository = container.resolve(TreafikConfigRepository);
const ipWhitelistRepository = container.resolve(IPWhitelistRepository);

export const getOneMiddlewareAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'IPWhitelist');

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

export const getAllWhitelistIPAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const middleware = middlewares[middlewareName] as IIPWhitelistMiddleware;

        // Get all IPs from the database
        const whitelistData = await ipWhitelistRepository.getAll();

        const mappedData = (middleware.ipwhitelist.sourcerange ?? []).map((ip) => {
            const found = whitelistData.find((item) => item.ip === ip);

            return {
                id: createId(),
                ip,
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

export const createWhitelistIPAction = async (middlewareName: string, ip: string, name?: string) => {
    try {
        await checkAbility('create', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IIPWhitelistMiddleware;

        if (middleware.ipwhitelist.sourcerange?.includes(ip)) throw new Error('IP already exists');

        config.http.middlewares[middlewareName] = {
            ipwhitelist: {
                sourcerange: [...((config.http.middlewares[middlewareName] as IIPWhitelistMiddleware).ipwhitelist.sourcerange ?? []), ip],
                ipStrategy: {
                    depth: 1,
                },
            },
        };

        await traefikRepository.updateDynamicConfig(config);
        await ipWhitelistRepository.create({
            name,
            ip,
        });

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

export const deleteWhitelistAction = async (middlewareName: string, ip: string) => {
    try {
        await checkAbility('delete', 'IPWhitelist');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IIPWhitelistMiddleware;

        const result = middleware.ipwhitelist.sourcerange?.filter((cr) => cr !== ip);

        (config.http.middlewares[middlewareName] as IIPWhitelistMiddleware).ipwhitelist.sourcerange = result && result.length > 0 ? result : null;

        await traefikRepository.updateDynamicConfig(config);

        await ipWhitelistRepository.delete({
            ip,
        });

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
