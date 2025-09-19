'use client';

import {FC} from 'react';
import {Session} from 'next-auth';
import {Tabs, Tab} from '@heroui/tabs';

import TableTokens from './_components/table-tokens';
import TableIP from './_components/table-ip';

interface Props {
    session: Session;
    name: string;
}

const Wrapper: FC<Props> = ({name}) => {
    return (
        <div className='flex w-full flex-col'>
            <Tabs
                aria-label='Options'
                fullWidth={false}
                variant='underlined'
            >
                <Tab
                    key='tokens'
                    title='Tokens'
                >
                    <TableTokens name={name} />
                </Tab>
                <Tab
                    key='ip'
                    title='Whitelist IP Address'
                >
                    <TableIP name={name} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Wrapper;
