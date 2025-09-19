import {Metadata} from 'next';

import {getAllRoleAction} from './_action/action';
import Table from './table';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Account',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = async () => {
    const role = await getAllRoleAction();

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Account</h1>
                <p className='text-sm text-default-500'>Manage all account user.</p>
            </div>

            <Table roles={role.data?.data ?? []} />
        </div>
    );
};

export default Page;
