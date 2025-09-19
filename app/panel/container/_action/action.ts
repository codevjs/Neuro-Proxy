'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {DockerApiRepository} from '@/repositories/api/docker/docker.api';
import {isContainerSupport} from '@/helpers/docker-support-checker.helper';

const dockerApiRepository = container.resolve(DockerApiRepository);

export const getAllContainerAction = async () => {
    try {
        await checkAbility('read', 'Container');

        const containers = await dockerApiRepository.getAllContainer();

        return {
            success: true,
            data: containers.filter((c) => !isContainerSupport(c.Names[0])),
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

export const getOneContainerAction = async (id: string) => {
    try {
        await checkAbility('read', 'Container');

        const contaier = dockerApiRepository.getOneContainer(id);

        return {
            success: true,
            data: contaier,
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
