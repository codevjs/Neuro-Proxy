import {Metadata} from 'next';

import Table from './table';

import {siteConfig} from '@/config/site';
import {auth} from '@/auth';

export const metadata: Metadata = {
    title: {
        default: 'Tokens & Whitelist IP',
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
                <h1 className='text-2xl font-semibold'>Access Tokens & Whitelist IP</h1>
                <p className='text-sm text-default-500'>
                    Integrate API tokens into the request header to allow restricted access. Supports IP whitelisting.{' '}
                    <a
                        href='https://github.com/Aetherinox/traefik-api-token-middleware'
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
