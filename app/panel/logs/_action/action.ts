'use server';

import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {TreafikLogsRepository} from '@/repositories/file/logs/logs.file';

const treafikLogsRepository = container.resolve(TreafikLogsRepository);

export const getAllLogsAction = async (search?: string) => {
    try {
        await checkAbility('read', 'AccessLog');

        const result = await treafikLogsRepository.getAll(search);

        return {
            success: true,
            data: result
                .map((log) => ({...log, time: new Date(log.time)}))
                // Filter out internal kalla-proxy service logs
                .filter((log) => {
                    const isInternalService = log.ServiceName === 'kalla-proxy-service@file';
                    const isLocalhost = log.ServiceURL === 'http://localhost:3000';

                    return !isInternalService && !isLocalhost;
                })
                .sort((a, b) => b.time.getTime() - a.time.getTime())
                .slice(0, 100),
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
