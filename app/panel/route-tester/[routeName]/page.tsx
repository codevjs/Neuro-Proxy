import {Metadata} from 'next';

import RouteFlowVisualizer from '../_components/route-flow-visualizer';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Route Flow Test',
        template: `%s - ${siteConfig.name}`,
    },
    description: 'Visualize and test Traefik route flow through middlewares',
    icons: {
        icon: '/favicon.ico',
    },
};

interface Props {
    params: Promise<{
        routeName: string;
    }>;
}

export default async function RouteFlowPage({params}: Props) {
    const resolvedParams = await params;
    const decodedRouteName = decodeURIComponent(resolvedParams.routeName);

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Route Flow Test</h1>
                <p className='text-sm text-default-500'>
                    Test and visualize the request flow for route: <code className='rounded bg-default-100 px-1'>{decodedRouteName}</code>
                </p>
            </div>

            <RouteFlowVisualizer routeName={decodedRouteName} />
        </div>
    );
}
