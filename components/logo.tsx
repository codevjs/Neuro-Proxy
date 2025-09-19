'use client';

import {useState, useEffect} from 'react';

const Logo = () => {
    const [environmentMode, setEnvironmentMode] = useState('');

    useEffect(() => {
        const url = window.location.href;

        if (url.includes('localhost')) {
            setEnvironmentMode('development localhost');
        } else if (url.includes('dev')) {
            setEnvironmentMode('development');
        } else {
            setEnvironmentMode('production');
        }
    }, []);

    return (
        <div className='flex items-center gap-2'>
            <img
                alt='Logo'
                className='aspect-square w-8'
                src='/logo.svg'
            />
            <div className=''>
                <h1 className='text-xl'>Kalla Proxy</h1>
                <p className='text-xs capitalize text-default-500'>{environmentMode}</p>
            </div>
        </div>
    );
};

export default Logo;
