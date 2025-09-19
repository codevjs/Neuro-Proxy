'use client';

import {LoaderCircle} from 'lucide-react';
import {FC, memo, useCallback, useEffect, useState} from 'react';

import {getOneRouterAction} from '../_action/action';

import {ITreafikRouterApi} from '@/repositories/api/traefik/traefik.api.interface';

interface Props {
    name: string;
}

const CheckStatus: FC<Props> = ({name}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<ITreafikRouterApi | null>(null);

    const getOneRouter = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getOneRouterAction(name);

            if (!result.success || !result.data) throw new Error(result.message);

            setData(result.data);

            console.log(result.data);
        } catch (_error) {
            // Silently ignore errors during status check
        } finally {
            setLoading(false);
        }
    }, [name]);

    useEffect(() => {
        getOneRouter();
    }, [getOneRouter]);

    return (
        <div className='flex'>
            {loading ? (
                <LoaderCircle
                    className='animate-spin text-primary'
                    size={16}
                />
            ) : (
                <div className='flex flex-col gap-2'>
                    <div>
                        {data?.status === 'enabled' ? (
                            <div className='h-3 w-3 rounded-full bg-success' />
                        ) : (
                            <div className='h-3 w-3 rounded-full bg-danger' />
                        )}
                    </div>
                    {data?.error ? <span className='text-xs'>{data?.error?.join(', ')}</span> : null}
                </div>
            )}
        </div>
    );
};

export default memo(CheckStatus);
