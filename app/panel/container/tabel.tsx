'use client';

import {FC, useCallback} from 'react';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Chip} from '@heroui/chip';
import {createId} from '@paralleldrive/cuid2';
import {SearchIcon} from 'lucide-react';
import {Input} from '@heroui/input';
import Link from 'next/link';
import Dockerode from 'dockerode';

import useLogs from './_hook/logs.hook';

import Loading from '@/components/loading';
import Pagination from '@/components/pagination';

interface Props {}

const TableLogs: FC<Props> = () => {
    const {list, meta} = useLogs();

    const renderCell = useCallback((data: Dockerode.ContainerInfo, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'name':
                return (
                    <Link
                        className='flex flex-col text-sm text-primary'
                        href={`/panel/container/${data.Id}`}
                    >
                        {data.Names[0]?.replace('/', '')}
                    </Link>
                );
            case 'state':
                return (
                    <Chip
                        className='uppercase'
                        classNames={{content: 'text-xs'}}
                        color={data.State === 'running' ? 'success' : 'danger'}
                        size='sm'
                    >
                        {data.State}
                    </Chip>
                );
            case 'image':
                return <div className='flex flex-col text-sm'>{data.Image}</div>;
            case 'status':
                return <div className='flex flex-col text-sm'>{data.Status}</div>;
            case 'netowrks':
                return (
                    <div className='flex flex-col gap-1'>
                        {Object.keys(data.NetworkSettings.Networks).map((key, i) => {
                            return (
                                <Chip
                                    key={i}
                                    classNames={{content: 'text-xs'}}
                                    size='sm'
                                >
                                    {key}
                                </Chip>
                            );
                        })}
                    </div>
                );
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
                    className='w-full max-w-[230px]'
                    classNames={{input: 'text-sm'}}
                    labelPlacement='outside'
                    placeholder='Search'
                    radius='full'
                    startContent={<SearchIcon className='pointer-events-none flex-shrink-0 text-base text-default-400' />}
                    onValueChange={list.setFilterText}
                />

                <div className='flex gap-x-2' />
            </div>

            {/* Table */}
            <Table
                aria-label='container table'
                className='rounded-2xl border dark:border-default-100'
                isCompact={true}
                isStriped={true}
                radius='lg'
                shadow={'none'}
                sortDescriptor={list.sortDescriptor}
                onSortChange={list.sort}
            >
                <TableHeader
                    columns={[
                        {name: 'Name', id: 'name', allowSorting: true},
                        {name: 'Image', id: 'image'},
                        {name: 'Status', id: 'status'},
                        {name: 'Networks', id: 'netowrks'},
                        {name: 'State', id: 'state', allowSorting: true},
                    ]}
                >
                    {(column) => (
                        <TableColumn
                            key={column.id}
                            align={column.id === 'action' ? 'end' : 'start'}
                            allowsSorting={column.allowSorting}
                            width={column.id === 'action' ? 100 : undefined}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={'No rows to display.'}
                    items={list.items as Dockerode.ContainerInfo[]}
                    loadingContent={<Loading />}
                    loadingState={list.loadingState}
                >
                    {(item) => (
                        <TableRow key={createId()}>{(columnKey) => <TableCell className='py-4'>{renderCell(item, columnKey)}</TableCell>}</TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {list.items.length > 0 ? (
                <div className='flex w-full justify-end'>
                    <Pagination
                        limit={15}
                        meta={meta}
                        onChange={(page) => {
                            list.sort({column: `${page}`, direction: `ascending`});
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default TableLogs;
