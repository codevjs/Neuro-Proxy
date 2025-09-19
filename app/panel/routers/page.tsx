import {Metadata} from 'next';

import Table from './table';

import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Treafik Services',
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
                <h1 className='text-2xl font-semibold'>Routers</h1>
                <p className='text-sm text-default-500'>
                    A router is in charge of connecting incoming requests to the services that can handle them.{' '}
                    <a
                        href='https://doc.traefik.io/traefik/routing/routers/'
                        rel='noreferrer noopener'
                        target='_blank'
                    >
                        <span className='text-blue-500'>[Docs]</span>
                    </a>
                </p>
            </div>

            <Table />
        </div>
    );
};

export default Page;
