'use client';

import {Server} from 'lucide-react';
import {FC, useContext} from 'react';

import InstanceList from './instence-list';

import {ITreafikRouterApi} from '@/repositories/api/traefik/traefik.api.interface';
import {AbilityContext} from '@/contexts/casl.context';

interface Props {
    routers: ITreafikRouterApi[];
}

const Instance: FC<Props> = ({routers}) => {
    const ability = useContext(AbilityContext);

    if (ability.cannot('read', 'Dashboard')) {
        return null;
    }

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='flex w-full items-center gap-2'>
                <Server size={20} />
                <h1>Routes</h1>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {routers.map((router) => (
                    <InstanceList
                        key={router.name}
                        router={router}
                    />
                ))}
                {routers.length === 0 && (
                    <div className='col-span-full flex flex-col items-center justify-center py-8 text-center'>
                        <Server
                            className='mb-2 text-default-300'
                            size={48}
                        />
                        <p className='text-sm text-default-500'>No routes configured</p>
                        <p className='text-xs text-default-400'>Add routes in Traefik configuration to see them here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Instance;
