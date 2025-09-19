'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {DockerApiRepository} from '@/repositories/api/docker/docker.api';
import {isContainerSupport} from '@/helpers/docker-support-checker.helper';

const dockerApiRepository = container.resolve(DockerApiRepository);

export const joinNetworkContainerAction = async (containerId: string, network: string) => {
    try {
        await checkAbility('update', 'Container');

        await dockerApiRepository.joinNetwork(containerId, network);

        return {
            success: true,
            message: 'Container joined network',
        };
    } catch (error) {
        console.error(error);

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

export const leaveNetworkContainerAction = async (containerId: string, network: string) => {
    try {
        await checkAbility('update', 'Container');

        await dockerApiRepository.leaveNetwork(containerId, network);

        return {
            success: true,
            message: 'Container leave the network',
        };
    } catch (error) {
        console.error(error);

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

export const getAllContainerSupportAction = async (containerId: string) => {
    try {
        await checkAbility('read', 'Container');

        const containers = await dockerApiRepository.getAllContainer();

        return {
            success: true,
            data: containers.filter((container) => container.Names[0].endsWith(containerId)),
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

export const getAllNetworkContainerAction = async () => {
    try {
        await checkAbility('read', 'Container');

        const networks = await dockerApiRepository.getAllNetwork();

        return {
            success: true,
            data: networks,
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

export const restartContainerAction = async (containerId: string) => {
    try {
        await checkAbility('update', 'Container');

        const container = dockerApiRepository.getOneContainer(containerId);

        await container.restart();

        return {
            success: true,
            message: 'Container restarted',
        };
    } catch (error) {
        console.error(error);

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

export const startContainerAction = async (containerId: string) => {
    try {
        await checkAbility('update', 'Container');

        const container = dockerApiRepository.getOneContainer(containerId);

        await container.start();

        return {
            success: true,
            message: 'Container started',
        };
    } catch (error) {
        console.error(error);

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

export const stopContainerAction = async (containerId: string) => {
    try {
        await checkAbility('update', 'Container');

        const container = dockerApiRepository.getOneContainer(containerId);

        await container.stop();

        return {
            success: true,
            message: 'Container stopped',
        };
    } catch (error) {
        console.error(error);

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

export const scaleContainerAction = async (containerId: string, data: {totalSupport: number}) => {
    try {
        await checkAbility('update', 'Container');

        const container = dockerApiRepository.getOneContainer(containerId);

        const inspect = await container.inspect();

        // check if container is not supported container
        if (isContainerSupport(inspect.Name)) throw new Error(`Container can't be scaled, because it's already a support container`);

        for (let i = 0; i < data.totalSupport; i++) {
            const name = `support-${i + 1}-${containerId}`;

            await dockerApiRepository.duplicateContainer(containerId, name);
        }

        return {
            success: true,
            message: 'Container scaled',
        };
    } catch (error) {
        console.error(error);

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

export const stopScaleContainerAction = async (containerId: string[]) => {
    try {
        await checkAbility('update', 'Container');

        // delete container
        for (let i = 0; i < containerId.length; i++) {
            await dockerApiRepository.removeContainer(containerId[i]);
        }

        return {
            success: true,
            message: 'Container scale stopped',
        };
    } catch (error) {
        console.error(error);

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
