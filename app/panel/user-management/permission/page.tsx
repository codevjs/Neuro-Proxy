import {Metadata} from 'next';

import Table from './table';
import {getAllSubjectAction} from './_action/action';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Permission',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = async () => {
    const subjects = await getAllSubjectAction();

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Permission</h1>
                <p className='text-sm text-default-500'>Manage all user permission</p>
            </div>

            <Table subjects={subjects.data} />
        </div>
    );
};

export default Page;
