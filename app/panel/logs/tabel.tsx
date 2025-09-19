'use client';

import {FC, useCallback} from 'react';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Chip} from '@heroui/chip';
import {createId} from '@paralleldrive/cuid2';
import {Input} from '@heroui/input';
import {SearchIcon, Shield, Globe} from 'lucide-react';
import dayjs from 'dayjs';
import {Tooltip} from '@heroui/tooltip';

import useLogs from './_hook/logs.hook';

import Loading from '@/components/loading';
import {extractRealIP, formatIPDisplay} from '@/helpers/ip-extractor.helper';
import {ITreafikLogs} from '@/repositories/file/logs/logs.file.interface';

interface Props {}

const TableLogs: FC<Props> = () => {
    const {list, debounce} = useLogs();

    const renderCell = useCallback((data: ITreafikLogs, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'date':
                return <div className='flex flex-col text-xs'>{dayjs(data.time).format('DD/MM/YYYY HH:MM:ss')}</div>;
            case 'level':
                return (
                    <Chip
                        className='uppercase'
                        color={
                            data.level === 'info' ? 'secondary' : data.level === 'warning' ? 'warning' : data.level === 'error' ? 'danger' : 'primary'
                        }
                        size='sm'
                    >
                        {data.level}
                    </Chip>
                );
            case 'realIP':
                const ipResult = extractRealIP(data);
                const displayInfo = formatIPDisplay(ipResult, data.ClientAddr);

                const content = (
                    <div className='flex items-center gap-2'>
                        <div className='flex flex-col text-xs'>
                            <div className='flex items-center gap-1'>
                                {ipResult.isPrivate ? <Shield className='h-3 w-3 text-orange-500' /> : <Globe className='h-3 w-3 text-green-500' />}
                                <span className='font-mono'>{displayInfo.mainIP}</span>
                                {ipResult.source !== 'ClientAddr' && (
                                    <Chip
                                        className='text-tiny'
                                        size='sm'
                                        variant='flat'
                                    >
                                        {ipResult.source}
                                    </Chip>
                                )}
                            </div>
                            {displayInfo.subtitle && <span className='font-mono text-tiny text-default-400'>{displayInfo.subtitle}</span>}
                        </div>
                    </div>
                );

                return displayInfo.tooltip ? (
                    <Tooltip
                        content={displayInfo.tooltip}
                        placement='top'
                    >
                        {content}
                    </Tooltip>
                ) : (
                    content
                );
            case 'clientAddress':
                return <div className='flex flex-col text-xs'>{data.ClientAddr}</div>;
            case 'clientUsername':
                return <div className='flex flex-col text-xs'>{data.ClientUsername}</div>;
            case 'requestAddr':
                return <div className='flex flex-col text-xs'>{data.RequestAddr}</div>;
            case 'requestMethod':
                return <div className='flex flex-col text-xs'>{data.RequestMethod}</div>;
            case 'requestPath':
                return <div className='flex max-w-xs flex-col overflow-auto text-xs'>{data.RequestPath}</div>;
            case 'requestScheme':
                return <div className='flex flex-col text-xs'>{data.RequestScheme}</div>;
            case 'originStatus':
                return <div className='flex flex-col text-xs'>{data.OriginStatus}</div>;
            case 'routerName':
                return <div className='flex flex-col text-xs'>{data.RouterName}</div>;
            case 'serviceName':
                return <div className='flex flex-col text-xs'>{data.ServiceName}</div>;
            case 'serviceURL':
                return <div className='flex flex-col text-xs'>{data.ServiceURL}</div>;
            default:
                return <div />;
        }
    }, []);

    return (
        <div className='flex w-full flex-col gap-4 pb-4'>
            {/* Action */}
            <div className='flex items-center justify-between gap-3'>
                <Input
                    isClearable
                    className='w-full max-w-[250px]'
                    classNames={{input: 'text-sm'}}
                    labelPlacement='outside'
                    placeholder='Search...'
                    radius='full'
                    startContent={<SearchIcon className='pointer-events-none flex-shrink-0 text-base text-default-400' />}
                    onValueChange={debounce}
                />

                <div className='flex gap-x-2' />
            </div>

            {/* Table */}
            <Table
                className='rounded-2xl border dark:border-default-100'
                isCompact={true}
                isStriped={true}
                radius='lg'
                shadow={'none'}
            >
                <TableHeader
                    columns={[
                        {name: 'Date', id: 'date'},
                        {name: 'Level', id: 'level'},
                        {name: 'Real IP', id: 'realIP'},
                        {name: 'Client Address', id: 'clientAddress'},
                        {name: 'Request Method', id: 'requestMethod'},
                        {name: 'Request Path', id: 'requestPath'},
                        {name: 'Request Scheme', id: 'requestScheme'},
                        {name: 'Origin Status', id: 'originStatus'},
                        {name: 'Router Name', id: 'routerName'},
                        {name: 'Service Name', id: 'serviceName'},
                        {name: 'Service URL', id: 'serviceURL'},
                    ]}
                >
                    {(column) => (
                        <TableColumn
                            key={column.id}
                            align={column.id === 'action' ? 'end' : 'start'}
                            width={column.id === 'action' ? 100 : undefined}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={'No rows to display.'}
                    items={list.items as ITreafikLogs[]}
                    loadingContent={<Loading />}
                    loadingState={list.loadingState}
                >
                    {(item) => (
                        <TableRow key={createId()}>{(columnKey) => <TableCell className='py-4'>{renderCell(item, columnKey)}</TableCell>}</TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableLogs;
