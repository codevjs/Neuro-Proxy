import {Metadata} from 'next';

import Table from './table';

import {siteConfig} from '@/config/site';
import {auth} from '@/auth';

export const metadata: Metadata = {
    title: {
        default: 'Strip Prefix Middleware',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

const Page = async () => {
    const session = await auth();

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>Strip Prefix</h1>
                <p className='text-sm text-default-500'>
                    Removing prefixes from the path before rorwarding the request{' '}
                    <a
                        href='https://doc.traefik.io/traefik/middlewares/http/stripprefix/'
                        rel='noreferrer noopener'
                        target='_blank'
                    >
                        <span className='text-blue-500'>[Docs]</span>
                    </a>
                </p>
            </div>

            <Table session={session!} />
        </div>
    );
};

export default Page;
