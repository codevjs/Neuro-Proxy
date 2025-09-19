'use client';

import {User} from '@heroui/user';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from '@heroui/dropdown';
import {FC} from 'react';
import {toast} from 'sonner';
import {usePathname} from 'next/navigation';
import {useRouter} from '@bprogress/next';

import {ThemeSwitch} from './theme-switch';

import {signOutAction} from '@/app/auth/_actions/auth.action';

interface Props {
    name: string;
    email: string;
    role: string;
    image: string | null;
}

const UserDropdown: FC<Props> = ({name, email, role, image}) => {
    const pathname = usePathname();
    const router = useRouter();

    const signOut = () => {
        toast.promise(signOutAction(), {
            loading: 'Signing out...',
            success: (data) => {
                router.push(`/auth/signin?callbackUrl=${pathname}`);
                router.refresh();

                return data.message;
            },
            error: (data) => data.message,
            classNames: {
                icon: 'mr-4',
                title: 'text-base',
                error: 'border-none',
                success: 'border-none',
                loading: 'border-none text-base',
            },
        });
    };

    return (
        <Dropdown
            backdrop='blur'
            placement='bottom-start'
        >
            <DropdownTrigger className='cursor-pointer'>
                <User
                    avatarProps={{
                        name: name,
                        src: image ?? '',
                        isBordered: true,
                        size: 'sm',
                    }}
                    description={email.length > 20 ? `${email.slice(0, 20)}...` : email}
                    name={name.length > 13 ? `${name.slice(0, 13)}...` : name}
                />
            </DropdownTrigger>
            <DropdownMenu
                aria-label='User Actions'
                variant='flat'
            >
                <DropdownItem
                    key='profile'
                    className='h-14 cursor-default gap-2'
                    isReadOnly={true}
                    textValue='profile'
                >
                    <User
                        avatarProps={{
                            name: name,
                            src: image ?? '',
                        }}
                        description={email}
                        name={name}
                    />
                </DropdownItem>
                <DropdownItem
                    key='dashboard'
                    href='/panel/dashboard'
                    textValue='settings'
                >
                    Dashboard
                </DropdownItem>
                <DropdownItem
                    key='logout'
                    showDivider
                    color='danger'
                    textValue='logout'
                    onClick={signOut}
                >
                    Sign Out
                </DropdownItem>
                <DropdownItem
                    key='theme'
                    className='cursor-default'
                    endContent={<ThemeSwitch />}
                    isReadOnly={true}
                    textValue='theme'
                >
                    Theme
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default UserDropdown;
