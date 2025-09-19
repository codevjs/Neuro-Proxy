import {redirect} from 'next/navigation';

import {Providers} from './providers';

import {auth} from '@/auth';
import {getPermissions} from '@/libs/permission.lib';
import Sidebar from '@/components/sidebar';

export default async function Layout({children}: {children: React.ReactNode}) {
    const session = await auth();

    if (!session) redirect('/auth/signin');

    const permissions = await getPermissions(session);

    return (
        <Providers permissions={permissions}>
            <div className='relative flex h-screen p-6 pr-0'>
                <Sidebar session={session} />
                <main className='flex h-full w-full flex-col overflow-y-auto px-6'>
                    <section className='min-h-full w-full'>{children}</section>
                </main>
            </div>
        </Providers>
    );
}
