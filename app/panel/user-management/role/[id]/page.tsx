import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {MoveLeft} from 'lucide-react';
import {Prisma} from '@prisma/client';
import Link from 'next/link';

import {getAllPermissionAction, getOneRoleAction} from './_action/action';
import Table from './tabel';

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

type Params = Promise<{id: string}>;

const Page = async ({params}: {params: Params}) => {
    const {id} = await params;

    const role = await getOneRoleAction({id});

    if (!role.success || !role.data) redirect('/404');

    const permission = await getAllPermissionAction();

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex flex-col'>
                <Link href='/panel/user-management/role'>
                    <span className='flex cursor-pointer items-center gap-2 text-sm text-danger'>
                        <MoveLeft size={20} />
                        Back
                    </span>
                </Link>

                <h1 className='pt-2 text-2xl font-semibold capitalize'> {role.data.name} Permission</h1>
                <p className='text-sm text-default-500'>Manage {role.data.name} permission.</p>
            </div>

            <Table
                currentPermissions={((role.data.permission as Prisma.JsonObject[]) ?? []).map((data) => ({
                    subject: data.subject as string,
                    action: data.action as string[],
                }))}
                id={id}
                permissions={permission.data ?? []}
            />
        </div>
    );
};

export default Page;
