'use client';

import {ServerCrash, ServerOff, Clock, Globe, Shield} from 'lucide-react';
import {FC, memo, useEffect, useState} from 'react';
import {Chip} from '@heroui/chip';

import {getOneRouterAction} from '../_action/action';

import {ITreafikRouterApi} from '@/repositories/api/traefik/traefik.api.interface';

interface Props {
    router: ITreafikRouterApi;
}

const InstanceList: FC<Props> = ({router}) => {
    const [status, setStatus] = useState<'enabled' | 'disabled'>(router.status);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            setIsChecking(true);
            try {
                const res = await getOneRouterAction(router.name);

                if (res.success && res.data) {
                    setStatus(res.data.status);
                    setLastChecked(new Date());
                }
            } catch (error) {
                console.error('Failed to check router status:', error);
            } finally {
                setIsChecking(false);
            }
        }, 3000); // Check every 3 seconds for more real-time updates

        return () => clearInterval(interval);
    }, [router.name]);

    const formatLastChecked = () => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;

        return `${Math.floor(diff / 3600)}h ago`;
    };

    const getEntryPoints = () => {
        return router.entryPoints?.join(', ') || 'Unknown';
    };

    const hasMiddlewares = () => {
        return router.middlewares && router.middlewares.length > 0;
    };

    return (
        <div className='flex w-full flex-col gap-3 rounded-xl bg-default-100 p-4 transition-all hover:bg-default-200'>
            <div className='flex w-full items-start justify-between'>
                <div className='flex items-center gap-2'>
                    {status === 'enabled' ? (
                        <ServerCrash
                            className={`text-success ${isChecking ? 'animate-pulse' : 'animate-blink'}`}
                            size={20}
                        />
                    ) : (
                        <ServerOff
                            className={`text-danger ${isChecking ? 'animate-pulse' : 'animate-blink'}`}
                            size={20}
                        />
                    )}
                    <div className='flex flex-col gap-1'>
                        <h1 className='text-sm font-medium'>{router.name}</h1>
                        <div className='flex items-center gap-1 text-xs text-default-500'>
                            <Clock size={12} />
                            <span>{formatLastChecked()}</span>
                        </div>
                    </div>
                </div>
                <Chip
                    color={status === 'enabled' ? 'success' : 'danger'}
                    size='sm'
                    variant='flat'
                >
                    {status}
                </Chip>
            </div>

            <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-1 text-xs text-default-600'>
                    <Globe size={12} />
                    <span className='font-mono'>{router.rule}</span>
                </div>

                <div className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-1 text-default-500'>
                        <span>Entry: {getEntryPoints()}</span>
                    </div>
                    {hasMiddlewares() && (
                        <div className='flex items-center gap-1 text-warning-600'>
                            <Shield size={12} />
                            <span>{router.middlewares?.length} middleware(s)</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(InstanceList);
