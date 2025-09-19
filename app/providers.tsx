'use client';

import * as React from 'react';
import {HeroUIProvider} from '@heroui/system';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {Toaster} from 'sonner';
import {BadgeAlert, BadgeCheck} from 'lucide-react';
import {AppProgressProvider, useRouter} from '@bprogress/next';

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

function InnerProviders({children, themeProps}: ProvidersProps) {
    const router = useRouter();

    return (
        <HeroUIProvider
            locale='id-ID'
            navigate={router.push}
        >
            <NextThemesProvider {...themeProps}>
                {children}
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

export function Providers(props: ProvidersProps) {
    return (
        <AppProgressProvider
            color='#C064F9'
            height='4px'
            options={{showSpinner: false}}
            shallowRouting={true}
        >
            <InnerProviders {...props} />
        </AppProgressProvider>
    );
}
