import {Metadata} from 'next';

import {getAllRouters, getOverviewAction} from './_action/action';
import Feature from './_components/feature';
import Instance from './_components/instance';
import Statistic from './_components/statistic';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Dashboard',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = async () => {
    const [overview, routers] = await Promise.all([getOverviewAction(), getAllRouters()]);

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Dashboard</h1>
                <p className='text-sm text-default-500'>
                    The Dashboard is responsible for displaying the overview of the services that are configured in Traefik.{' '}
                </p>
            </div>

            <Statistic overview={overview.data} />
            <Instance routers={routers.data ?? []} />

            <div className='flex w-full'>
                <div className='w-[1/5]'>
                    <Feature features={overview.data?.features} />
                </div>
            </div>
        </div>
    );
};

export default Page;
