'use client';

import {Button} from '@heroui/button';
import {Tooltip} from '@heroui/tooltip';
// import {useEffect, useState} from 'react';
import Ansi from 'ansi-to-react'; // Convert ANSI logs into colored HTML
import {Logs, RefreshCw} from 'lucide-react';
import {useRouter} from '@bprogress/next';
import {useEffect, useRef} from 'react';

const LogViewer = ({logs}: {logs: string}) => {
    const router = useRouter();
    const logContainerRef = useRef<HTMLDivElement | null>(null);

    const refreshLogs = () => {
        router.refresh();
        if (logContainerRef.current) {
            logContainerRef.current.scrollTo({top: logContainerRef.current.scrollHeight, behavior: 'smooth'});
        }
    };

    // Auto-scroll when logs update
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTo({top: logContainerRef.current.scrollHeight, behavior: 'smooth'});
        }
    }, [logs]); // Run whenever `logs` updates

    return (
        <div
            ref={logContainerRef}
            className='flex h-full w-full flex-col gap-4 overflow-y-auto rounded-xl border border-default-100 pb-4 shadow dark:bg-content1'
            id='console-container'
        >
            <div className='sticky top-0 z-10 flex w-full items-center gap-4 bg-default-100 p-4 dark:bg-content2'>
                <div className='flex items-center gap-2'>
                    <Logs size={20} />
                    <h1>Logs</h1>
                </div>
                <Tooltip content='Refresh logs'>
                    <Button
                        color='secondary'
                        isIconOnly={true}
                        radius='full'
                        size='sm'
                        variant='flat'
                        onPress={refreshLogs}
                    >
                        <RefreshCw size={16} />
                    </Button>
                </Tooltip>
            </div>

            <div className='px-4'>
                <div
                    className='flex flex-col gap-4'
                    style={{
                        borderRadius: '5px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    <Ansi className='text-sm'>{logs}</Ansi>
                </div>
            </div>
        </div>
    );
};

export default LogViewer;
