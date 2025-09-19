import {Metadata} from 'next';
import {redirect} from 'next/navigation';

import {getOneContainerAction} from '../_action/action';

import {getAllContainerSupportAction} from './_actions/action';
import Breadcrumb from './_components/breadcrumb';
import Detail from './_components/detail';
import Log from './_components/log';

import {isContainerSupport} from '@/helpers/docker-support-checker.helper';
import {siteConfig} from '@/config/site';

export const metadata: Metadata = {
    title: {
        default: 'Container detail',
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

type Props = {
    params: Promise<{id: string}>;
};

const Page = async (props: Props) => {
    const params = await props.params;

    const [container, support] = await Promise.all([getOneContainerAction(params.id), getAllContainerSupportAction(params.id)]);

    if (!container.success || !container.data) redirect('/404');

    const [info, logs, stats] = await Promise.all([
        container.data.inspect(),
        container.data.logs({follow: false, stdout: true, stderr: true, tail: 100, timestamps: false}),
        container.data.stats({stream: false}),
    ]);

    return (
        <div className='flex h-full w-full flex-col gap-y-6'>
            <div className='flex w-full flex-col gap-2'>
                <h1 className='text-2xl font-semibold'>{info.Name.replace('/', '')}</h1>
                <div className='flex justify-between'>
                    <Breadcrumb name={info.Name.replace('/', '')} />
                </div>
            </div>

            <div className='flex h-full w-full gap-4'>
                {!isContainerSupport(info.Name) ? (
                    <Detail
                        data={info}
                        stats={stats}
                        supports={support.data ?? []}
                    />
                ) : null}
                <Log logs={logs.toString('utf-8')} />
            </div>
        </div>
    );
};

export default Page;
