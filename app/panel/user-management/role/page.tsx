import {Metadata} from 'next';

import Table from './table';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Role',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = () => {
    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Role</h1>
                <p className='text-sm text-default-500'>Manage all role user account.</p>
            </div>

            <Table />
        </div>
    );
};

export default Page;
