'use client';

import {Navbar as NextUINavbar, NavbarContent, NavbarItem} from '@heroui/navbar';
import {FC, useState} from 'react';
import {Session} from 'next-auth';

import UserDropdown from './user-dropdown';

import {ThemeSwitch} from '@/components/theme-switch';

interface Props {
    session: Session | null;
}

export const Navbar: FC<Props> = ({session}) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    return (
        <NextUINavbar
            classNames={{
                base: 'z-[9999] fixed',
                item: [
                    'flex',
                    'relative',
                    'h-full',
                    'items-center',
                    "data-[active=true]:after:content-['']",
                    'data-[active=true]:after:absolute',
                    'data-[active=true]:after:-bottom-2',
                    'data-[active=true]:after:left-0',
                    'data-[active=true]:after:right-0',
                    'data-[active=true]:after:h-[3px]',
                    'data-[active=true]:after:w-[50%]',
                    'data-[active=true]:after:rounded-full',
                    'data-[active=true]:after:bg-primary',
                ],
            }}
            isBlurred={true}
            isBordered={false}
            isMenuOpen={isMenuOpen}
            maxWidth='full'
            position='sticky'
            shouldHideOnScroll={false}
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarContent
                className='hidden basis-1/5 items-center gap-x-2 laptop:flex laptop:basis-full'
                justify='end'
            >
                {session !== null && session !== undefined ? (
                    <div className='flex gap-2'>
                        <UserDropdown
                            email={session.user.email ?? ''}
                            image={session.user.image ?? ''}
                            name={session.user.name}
                            role={session.user.role?.name ?? ''}
                        />
                    </div>
                ) : (
                    <NavbarItem className='flex gap-2'>
                        <ThemeSwitch />
                    </NavbarItem>
                )}
            </NavbarContent>
        </NextUINavbar>
    );
};
