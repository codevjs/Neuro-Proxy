'use client';

import * as React from 'react';
import {HeroUIProvider} from '@heroui/system';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {Toaster} from 'sonner';
import {BadgeAlert, BadgeCheck} from 'lucide-react';
import {AppProgressProvider} from '@bprogress/next';

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

import {useRouter} from '@bprogress/next';

export function Providers({children, themeProps}: ProvidersProps) {
    const router = useRouter();

    return (
        <HeroUIProvider
            locale='id-ID'
            navigate={router.push}
        >
            <NextThemesProvider {...themeProps}>
                {children}
                <AppProgressProvider
                    color='#C064F9'
                    height='4px'
                    options={{showSpinner: false}}
                    shallowRouting={true}
                />
                <Toaster
                    expand={false}
                    icons={{
                        error: <BadgeAlert />,
                        success: <BadgeCheck />,
                    }}
                    richColors={true}
                />
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
