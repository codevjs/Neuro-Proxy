import {Metadata} from 'next';
import {redirect} from 'next/navigation';

import {checkSuperAdmin} from '../_actions/auth.action';

import Form from './form';

import {siteConfig} from '@/config/site';
import {auth} from '@/auth';

export const metadata: Metadata = {
    title: {
        default: 'First Time Registration',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

type SearchParams = {callbackUrl: string | undefined};

const Page = async (props: {searchParams: Promise<SearchParams>}) => {
    const [session, superadmin, searchParams] = await Promise.all([auth(), checkSuperAdmin(), props.searchParams]);

    if (superadmin) redirect('/auth/signin');

    if (session) redirect('/panel/dashboard');

    return (
        <div className='relative flex h-screen flex-col gap-y-8 overflow-y-auto bg-default-100'>
            {/* <Navbar session={session} /> */}
            <Form callbackUrl={searchParams.callbackUrl} />
        </div>
    );
};

export default Page;
