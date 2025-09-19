'use client';

import {ChevronLeft} from 'lucide-react';
import Link from 'next/link';
import {FC, ReactNode} from 'react';

interface Props {
    href: string;
    title?: string;
    action?: ReactNode;
}

const Header: FC<Props> = ({href, title, action}) => {
    return (
        <div className='sticky top-0 z-20 flex w-full max-w-md items-center justify-between bg-primary px-4 py-2'>
            <div>
                <Link href={href}>
                    <span className='flex cursor-pointer items-center gap-2 py-1 text-sm text-white'>
                        <ChevronLeft size={20} />
                    </span>
                </Link>
            </div>
            <div>
                <h1 className='font-medium text-white'>{title}</h1>
            </div>
            <div>{action}</div>
        </div>
    );
};

export default Header;
