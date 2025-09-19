import {Metadata} from 'next';

import ScalingManager from './_components/scaling-manager';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Manual Scaling',
        template: `%s - ${siteConfig.name}`,
    },
    description: 'Manual scaling management for Docker containers with Traefik load balancing',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function ScalingPage() {
    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Manual Scaling</h1>
                <p className='text-sm text-default-500'>Scale your Docker containers manually and manage load balancing with Traefik.</p>
            </div>

            <ScalingManager />
        </div>
    );
}
