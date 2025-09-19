'use client';

import {FC} from 'react';
import {Switch, SwitchProps} from '@heroui/switch';
import {useTheme} from 'next-themes';
import {useIsSSR} from '@react-aria/ssr';

import {SunIcon, MoonIcon} from '@/components/icons';

export interface ThemeSwitchProps {
    className?: string;
    classNames?: SwitchProps['classNames'];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = () => {
    const {theme, setTheme} = useTheme();

    const isSSR = useIsSSR();

    const onChange = () => {
        theme === 'light' ? setTheme('dark') : setTheme('light');
    };

    return (
        <Switch
            color='default'
            isSelected={theme === 'light' || isSSR}
            size='sm'
            thumbIcon={({isSelected, className}) => (isSelected ? <SunIcon className={className} /> : <MoonIcon className={className} />)}
            onChange={onChange}
        />
    );
};
