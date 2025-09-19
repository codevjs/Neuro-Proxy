'use client';

import * as React from 'react';
import {RawRule} from '@casl/ability';

import {AbilityContext} from '@/contexts/casl.context';
import {defineAbility} from '@/libs/casl-client-ability.lib';

export interface ProvidersProps {
    children: React.ReactNode;
    permissions: RawRule[];
}

export function Providers({children, permissions}: ProvidersProps) {
    const ability = defineAbility(permissions);

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
