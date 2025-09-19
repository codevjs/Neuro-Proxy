import {Metadata} from 'next';

import {getOneMiddlewareAction} from './_action/action';
import Breadcrumb from './_components/breadcrumb';
import Table from './_components/table';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'IP Whitelist Middleware',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

type Props = {
    params: Promise<{name: string}>;
};

const Page = async (props: Props) => {
    const params = await props.params;

    const [middleware] = await Promise.all([getOneMiddlewareAction(params.name)]);

    if (!middleware.success) throw new Error(middleware.message);

    if (!middleware.data) throw new Error('Middleware not found');

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex w-full flex-col gap-2'>
                <h1 className='text-2xl font-semibold'>{middleware.data.name}@file</h1>
                <div>
                    <Breadcrumb name={middleware.data.name} />
                </div>
            </div>

            <Table name={middleware.data.name} />
        </div>
    );
};

export default Page;
