'use client';

import {
    CircleMinus,
    UsersRound,
    LayoutDashboard,
    ChevronsUpDown,
    ShieldCheck,
    Logs,
    Workflow,
    Route,
    ServerCog,
    Container,
    Settings,
    TestTube,
} from 'lucide-react';
import { Avatar } from '@heroui/avatar';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import { usePathname, useSearchParams, useSelectedLayoutSegments } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Session } from 'next-auth';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from '@bprogress/next';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Badge } from '@heroui/badge';
import Link from 'next/link';

import { ThemeSwitch } from './theme-switch';
import Logo from './logo';
import { TeafikLogo } from './icons';

import { AbilityContext } from '@/contexts/casl.context';
import { signOutAction } from '@/app/auth/_actions/auth.action';

interface Props {
    session: Session;
}

const Sidebar: FC<Props> = ({ session }) => {
    const pathname = usePathname();
    const router = useRouter();
    const segments = useSelectedLayoutSegments();
    const searchParams = useSearchParams();
    const ability = useContext(AbilityContext);

    const [open, setOpen] = useState<boolean>(true);

    const navbarItems = useMemo(
        () =>
            [
                {
                    title: 'Overview',
                    href: '#',
                    children: [
                        {
                            label: 'Dashboard',
                            subject: 'Dashboard',
                            icon: (
                                <LayoutDashboard
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/dashboard',
                            isActive: segments?.includes('dashboard'),
                        },
                    ].filter((item) => ability.can('read', item.subject)),
                },
                {
                    title: 'Docker',
                    href: '#',
                    children: [
                        {
                            label: 'Container',
                            subject: 'Container',
                            icon: (
                                <Container
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/container',
                            isActive: segments?.includes('container'),
                        },
                        // {
                        //     label: 'Scaling',
                        //     subject: 'Container',
                        //     icon: (
                        //         <Scaling
                        //             size={20}
                        //             strokeWidth={1}
                        //         />
                        //     ),
                        //     href: '/panel/scaling',
                        //     isActive: segments?.includes('scaling'),
                        // },
                    ].filter((item) => ability.can('read', item.subject)),
                },
                {
                    title: 'Traefik',
                    href: '#',
                    children: [
                        {
                            label: 'Access Logs',
                            icon: (
                                <Logs
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/logs',
                            isActive: segments?.includes('logs'),
                            subject: 'AccessLog',
                        },
                        {
                            label: 'Services',
                            icon: (
                                <ServerCog
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/services',
                            isActive: segments?.includes('services'),
                            subject: 'Service',
                        },
                        {
                            label: 'Middlewares',
                            icon: (
                                <Workflow
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '#',
                            subject: 'Middleware',
                            isActive: segments?.includes('middlewares'),
                            children: [
                                {
                                    label: 'Basic Auth',
                                    subject: 'BasicAuth',
                                    description: 'Manage all basic auth middleware',
                                    icon: null,
                                    href: '/panel/middlewares/basic-auth',
                                    isActive: segments?.includes('basic-auth'),
                                },
                                {
                                    label: 'Tokens',
                                    subject: 'Token',
                                    description: 'Manage all Access Token and whitelist IP',
                                    icon: null,
                                    href: '/panel/middlewares/tokens',
                                    isActive: segments?.includes('tokens'),
                                },
                                {
                                    label: 'Strip Prefix',
                                    subject: 'StripPrefix',
                                    description: 'Manage all Strip Prefix',
                                    icon: null,
                                    href: '/panel/middlewares/strip-prefix',
                                    isActive: segments?.includes('strip-prefix'),
                                },
                                {
                                    label: 'IP Whitelist',
                                    subject: 'IPWhitelist',
                                    description: 'Limits allowed requests based on the client IP.',
                                    icon: null,
                                    href: '/panel/middlewares/ip-whitelist',
                                    isActive: segments?.includes('ip-whitelist'),
                                },
                            ].filter((item) => ability.can('read', item.subject)),
                        },
                        {
                            label: 'Routers',
                            icon: (
                                <Route
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/routers',
                            subject: 'Router',
                            isActive: segments?.includes('routers'),
                        },
                        {
                            label: 'Config Editor',
                            icon: (
                                <Settings
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/config',
                            subject: 'Config',
                            isActive: segments?.includes('config'),
                        },
                        {
                            label: 'Route Tester',
                            icon: (
                                <TestTube
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/route-tester',
                            subject: 'Router',
                            isActive: segments?.includes('route-tester'),
                        },
                    ].filter((item) => ability.can('read', item.subject)),
                },
                {
                    title: 'Settings',
                    href: '#',
                    children: [
                        {
                            label: 'Users',
                            subject: 'User',
                            description: 'Manage all user account',
                            icon: (
                                <UsersRound
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/user-management/account',
                            isActive: segments?.includes('account'),
                        },
                        {
                            label: 'Role',
                            subject: 'Role',
                            description: 'Manage all user role',
                            icon: (
                                <ShieldCheck
                                    size={20}
                                    strokeWidth={1}
                                />
                            ),
                            href: '/panel/user-management/role',
                            isActive: segments?.includes('role'),
                        },
                        // {
                        //     label: 'Permission',
                        //     subject: 'Permission',
                        //     description: 'Manage all user permission',
                        //     icon: (
                        //         <ShieldHalf
                        //             size={20}
                        //             strokeWidth={1}
                        //         />
                        //     ),
                        //     href: '/panel/user-management/permission',
                        //     isActive: segments?.includes('permission'),
                        // },
                    ].filter((item) => ability.can('read', item.subject)),
                },
            ].filter((m) => m.children.length > 0),
        [segments, ability]
    );

    const signOut = () => {
        toast.promise(signOutAction(), {
            loading: 'Signing out...',
            success: (data) => {
                router.refresh();
                router.push(`/auth/signin?callbackUrl=${pathname}`);

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

    useEffect(() => {
        if (searchParams?.get('mode') === 'compact') {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [searchParams]);

    return (
        <div className='h-full w-[350px] pr-0'>
            <motion.div
                animate={{ width: open ? '300px' : '115px' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ height: '100%' }}
            >
                <Navbar
                    classNames={{
                        base: `relative  flex h-full w-full flex-col overflow-hidden justify-start bg-default-100 rounded-md border-divider p-6 pr-0 pb-2 relative`,
                        wrapper: 'w-full flex flex-col h-full px-0 justify-start flex-nowrap',
                        brand: 'flex-grow-0 items-center text-medium box-border flex flex-col w-full px-0 gap-y-8 pr-6 basis-auto',
                        content: 'w-full h-full flex flex-col justify-between overflow-x-hidden',
                        item: `relative box-border flex h-[44px] min-h-11 ${open ? 'w-full' : 'w-fit'} cursor-pointer items-center gap-2 rounded-large text-default-500 subpixel-antialiased outline-none tap-highlight-transparent hover:bg-default/40 hover:text-default-foreground hover:transition-colors focus:bg-default/40 data-[focus-visible=true]:z-10 data-[active=true]:text-primary data-[active=true]:font-normal data-[active=true]:bg-default/30 data-[selected=true]:bg-default-100`,
                    }}
                    position='static'
                >
                    <NavbarBrand>
                        <div className='w-full rounded-xl bg-content1 p-2'>{open ? <Logo /> : null}</div>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div>
                                    <Avatar
                                        isBordered
                                        name={session.user.name}
                                        size='md'
                                        src={session.user.image ?? ''}
                                    />
                                </div>
                                {open ? (
                                    <div className='flex flex-col'>
                                        <p className='text-small font-medium text-default-600'>{session.user.name}</p>
                                        <p className='text-tiny text-default-400'>@{session.user.role?.name}</p>
                                    </div>
                                ) : null}
                            </div>
                            <ThemeSwitch />
                        </div>
                    </NavbarBrand>

                    <NavbarContent>
                        <ScrollShadow className={`flex h-full w-full flex-col ${open ? 'pr-6' : 'overflow-x-hidden pr-2'} py-6`}>
                            {navbarItems.map((group, index) => (
                                <div
                                    key={`${group.title}-${index}`}
                                    className='flex flex-col gap-y-1'
                                >
                                    {open ? (
                                        <span className='py-2 pl-1 text-tiny text-foreground-500'>{group.title}</span>
                                    ) : index > 0 ? (
                                        // <div className='py-2'>{/* <Divider /> */}</div>
                                        <span className='py-2 pl-1 text-tiny text-foreground-500'>{group.title}</span>
                                    ) : null}

                                    {group.children.map((item, index) =>
                                        'children' in item ? (
                                            (item.children as any[])?.length > 0 ? (
                                                <Dropdown
                                                    key={index}
                                                    backdrop='blur'
                                                >
                                                    <NavbarItem
                                                        className='px-3'
                                                        isActive={item.isActive}
                                                    >
                                                        <DropdownTrigger>
                                                            <Button
                                                                disableRipple
                                                                className={`flex w-full min-w-0 items-center justify-between bg-transparent p-0 data-[hover=true]:bg-transparent ${item.isActive ? 'text-primary' : 'text-default-500'
                                                                    }`}
                                                                endContent={open ? <ChevronsUpDown size={20} /> : undefined}
                                                                isIconOnly={true}
                                                                radius='sm'
                                                                variant='light'
                                                            >
                                                                {open ? (
                                                                    <div className='flex items-center gap-2'>
                                                                        {item.icon}
                                                                        <span className='text-small'>{item.label}</span>
                                                                    </div>
                                                                ) : (
                                                                    item.icon
                                                                )}
                                                            </Button>
                                                        </DropdownTrigger>
                                                    </NavbarItem>
                                                    <DropdownMenu
                                                        itemClasses={{ base: 'gap-4' }}
                                                        variant='faded'
                                                    >
                                                        <DropdownSection title={item.label}>
                                                            {(item.children as any[])?.map((child) => (
                                                                <DropdownItem
                                                                    key={child.href}
                                                                    className={`w-[230px] ${child.isActive ? 'text-primary' : 'text-default-500'}`}
                                                                    classNames={{
                                                                        description: child.isActive ? 'text-primary' : 'text-default-500',
                                                                    }}
                                                                    description={child.description}
                                                                    href={child.href}
                                                                    startContent={child.icon}
                                                                >
                                                                    {child.label}
                                                                </DropdownItem>
                                                            ))}
                                                        </DropdownSection>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            ) : null
                                        ) : (
                                            <Badge
                                                key={index}
                                                color='danger'
                                                content={(item as any).badge}
                                                isInvisible={(item as any).badge === undefined}
                                                size='sm'
                                            >
                                                <NavbarItem isActive={item.isActive}>
                                                    <Link
                                                        className={`flex w-full gap-2 px-3 py-1.5`}
                                                        href={(item as any).isDisable ? '#' : item.href}
                                                    >
                                                        <div>{item.icon}</div>
                                                        {open ? <span className='text-small'>{item.label}</span> : null}
                                                    </Link>
                                                </NavbarItem>
                                            </Badge>
                                        )
                                    )}
                                </div>
                            ))}
                        </ScrollShadow>

                        <div className='flex w-full flex-col gap-y-1 pr-6'>
                            <NavbarItem
                                className='px-3 text-danger hover:bg-danger-100 hover:text-danger'
                                onClick={signOut}
                            >
                                <div>
                                    <CircleMinus size={20} />
                                </div>
                                {open ? <span className='flex-1 truncate text-small font-medium'>Sign Out</span> : null}
                            </NavbarItem>

                            <div className='px-3'>
                                <TeafikLogo />
                            </div>
                        </div>
                    </NavbarContent>
                </Navbar>
            </motion.div>
        </div>
    );
};

export default Sidebar;
