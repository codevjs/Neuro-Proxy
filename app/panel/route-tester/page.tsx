import {Metadata} from 'next';

import RouteTestList from './_components/route-test-list';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Route Tester',
        template: `%s - ${siteConfig.name}`,
    },
    description: 'Test and visualize Traefik route flows with middleware chains',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RouteTestPage() {
    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Route Tester</h1>
                <p className='text-sm text-default-500'>Test your Traefik routes and visualize the request flow through middlewares to services.</p>
            </div>

            <RouteTestList />
        </div>
    );
}
