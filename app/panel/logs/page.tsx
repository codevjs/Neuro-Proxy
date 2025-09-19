import {Metadata} from 'next';

import TableLogs from './tabel';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Treafik Logs',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = async () => {
    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Access Logs</h1>
                <p className='text-sm text-default-500'>This page is used to display the logs of the Traefik service.</p>
            </div>

            <TableLogs />
        </div>
    );
};

export default Page;
