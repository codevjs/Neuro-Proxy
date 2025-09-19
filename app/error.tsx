'use client';

import {Button} from '@heroui/button';
import {useEffect} from 'react';

export default function Error({error, reset}: {error: Error; reset: () => void}) {
    useEffect(() => {
        // Log the error to an error reporting service
        /* eslint-disable no-console */
        console.error(error);
    }, [error]);

    return (
        <div className='relative flex min-h-screen w-full flex-col items-center justify-center gap-4'>
            <div>
                <h1 className='text-center text-base'>{'Something when wrong!'}</h1>
                <div className='max-w-md text-center'>
                    <span className='text-base text-danger'>{error.message.toLowerCase()}</span>
                </div>
            </div>
            <Button
                className='px-8'
                color='primary'
                radius='full'
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>
        </div>
    );
}
