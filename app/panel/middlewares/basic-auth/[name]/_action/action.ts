'use server';

import {ForbiddenError} from '@casl/ability';
import {createId} from '@paralleldrive/cuid2';
import {hashSync} from 'bcrypt';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikConfigRepository} from '@/repositories/file/traefik/traefik.file';
import {IBasicAuthMiddleware} from '@/repositories/file/traefik/treafik.file.interface';

const traefikRepository = container.resolve(TreafikConfigRepository);

export const getOneMiddlewareAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'BasicAuth');

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

export const getAllBasicAuthAction = async (middlewareName: string) => {
    try {
        await checkAbility('read', 'BasicAuth');

        const config = await traefikRepository.getDynamicConfig();

        const middlewares = config.http.middlewares;

        const middleware = middlewares[middlewareName] as IBasicAuthMiddleware;

        return {
            success: true,
            data: (middleware.basicAuth.users ?? []).map((user) => ({
                id: createId(),
                user,
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

export const createBasicAuthAction = async (middlewareName: string, data: {username: string; password: string}) => {
    try {
        await checkAbility('create', 'BasicAuth');

        const config = await traefikRepository.getDynamicConfig();

        const user = `${data.username}:${hashSync(data.password, 10)}`;

        let middleware = config.http.middlewares[middlewareName] as IBasicAuthMiddleware;

        if (middleware.basicAuth.users?.includes(user)) throw new Error('User already exists');

        config.http.middlewares[middlewareName] = {
            basicAuth: {
                users: [...((config.http.middlewares[middlewareName] as IBasicAuthMiddleware).basicAuth.users ?? []), user],
            },
        };

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'User created successfully',
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

export const deleteBasicAuthAction = async (middlewareName: string, user: string) => {
    try {
        await checkAbility('delete', 'BasicAuth');

        const config = await traefikRepository.getDynamicConfig();

        let middleware = config.http.middlewares[middlewareName] as IBasicAuthMiddleware;

        (config.http.middlewares[middlewareName] as IBasicAuthMiddleware).basicAuth.users =
            middleware.basicAuth.users?.filter((cr) => cr !== user) ?? [];

        await traefikRepository.updateDynamicConfig(config);

        return {
            success: true,
            message: 'Basic auth deleted successfully',
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
