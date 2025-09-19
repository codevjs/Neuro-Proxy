'use client';

import {CircleAlert, CircleCheck, Route, ServerCog, TriangleAlert, Workflow} from 'lucide-react';
import {FC, useContext} from 'react';

import {ITreafikOverviewApi} from '@/repositories/api/traefik/traefik.api.interface';
import {AbilityContext} from '@/contexts/casl.context';

interface Props {
    overview?: ITreafikOverviewApi;
}

const Statistic: FC<Props> = ({overview}) => {
    const ability = useContext(AbilityContext);

    if (ability.cannot('read', 'Dashboard')) {
        return null;
    }

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='grid grid-cols-3 gap-4'>
                {/* Services */}
                <div className='flex w-full justify-between gap-2 rounded-xl bg-default-100 p-4'>
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-base font-medium'>Services</h1>
                        </div>
                        <ServerCog
                            className='text-primary'
                            size={48}
                        />
                    </div>

                    <div className='flex w-full flex-col gap-4'>
                        {/* Success */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleCheck className='text-success' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Success</span>
                                </div>
                            </div>
                            <span className='text-sm'>{(overview?.http.services.total ?? 0) - (overview?.http.services.errors ?? 0)}</span>
                        </div>

                        {/* Warning */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleAlert className='text-warning' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Warning</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.services.warnings ?? 0}</span>
                        </div>

                        {/* Error */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <TriangleAlert className='text-danger' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Error</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.services.errors ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Middlewares */}
                <div className='flex w-full justify-between gap-2 rounded-xl bg-default-100 p-4'>
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-base font-medium'>Middlewares</h1>
                        </div>
                        <Workflow
                            className='text-secondary'
                            size={48}
                        />
                    </div>

                    <div className='flex w-full flex-col gap-4'>
                        {/* Success */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleCheck className='text-success' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Success</span>
                                </div>
                            </div>
                            <span className='text-sm'>{(overview?.http.middlewares.total ?? 0) - (overview?.http.middlewares.errors ?? 0)}</span>
                        </div>

                        {/* Warning */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleAlert className='text-warning' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Warning</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.middlewares.warnings ?? 0}</span>
                        </div>

                        {/* Error */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <TriangleAlert className='text-danger' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Error</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.middlewares.errors ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Routers */}
                <div className='flex w-full justify-between gap-2 rounded-xl bg-default-100 p-4'>
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-base font-medium'>Routers</h1>
                        </div>
                        <Route
                            className='text-blue-500'
                            size={48}
                        />
                    </div>

                    <div className='flex w-full flex-col gap-4'>
                        {/* Success */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleCheck className='text-success' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Success</span>
                                </div>
                            </div>
                            <span className='text-sm'>{(overview?.http.routers.total ?? 0) - (overview?.http.routers.errors ?? 0)}</span>
                        </div>

                        {/* Warning */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <CircleAlert className='text-warning' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Warning</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.routers.warnings ?? 0}</span>
                        </div>

                        {/* Error */}
                        <div className='flex justify-between gap-4'>
                            <div className='flex gap-4'>
                                <TriangleAlert className='text-danger' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>Error</span>
                                </div>
                            </div>
                            <span className='text-sm'>{overview?.http.routers.errors ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistic;
