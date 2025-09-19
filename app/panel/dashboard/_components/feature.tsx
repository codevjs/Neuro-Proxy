'use client';

import {ToggleLeft, ToggleRight} from 'lucide-react';
import {FC, useContext} from 'react';

import {AbilityContext} from '@/contexts/casl.context';

interface Props {
    features?: {
        tracing: boolean;
        metrics: boolean;
        accessLog: boolean;
    };
}

const Feature: FC<Props> = ({features}) => {
    const ability = useContext(AbilityContext);

    if (ability.cannot('read', 'Dashboard')) {
        return null;
    }

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='flex w-full items-center gap-2'>
                <ToggleRight size={20} />
                <h1>Features</h1>
            </div>

            <div className='flex w-full flex-col gap-4 rounded-xl bg-default-100 p-4'>
                <div className='flex justify-between gap-4'>
                    <span className='text-sm'>TRACING</span>
                    {features?.tracing === true ? <ToggleRight className='text-success' /> : <ToggleLeft className='text-danger' />}
                </div>
                <div className='flex justify-between gap-4'>
                    <span className='text-sm'>METRICS</span>
                    {features?.metrics === true ? <ToggleRight className='text-success' /> : <ToggleLeft className='text-danger' />}
                </div>
                <div className='flex justify-between gap-4'>
                    <span className='text-sm'>ACCESS LOGS</span>
                    {features?.accessLog === true ? <ToggleRight className='text-success' /> : <ToggleLeft className='text-danger' />}
                </div>
            </div>
        </div>
    );
};

export default Feature;
