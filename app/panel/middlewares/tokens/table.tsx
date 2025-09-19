'use client';

import { PlusIcon, Trash2 } from 'lucide-react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { FC, useCallback } from 'react';
import { Tooltip } from '@heroui/tooltip';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Session } from 'next-auth';
import { Chip } from '@heroui/chip';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Controller } from 'react-hook-form';
import Link from 'next/link';

import useTokens from './_hook/tokens.hook';

import { IPluginMiddleware } from '@/repositories/file/traefik/treafik.file.interface';
import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import { Can } from '@/contexts/casl.context';
import { SearchIcon } from '@/components/icons';
import Pagination from '@/components/pagination';

interface Props {
    session: Session;
}

const TableMiddleware: FC<Props> = () => {
    const { list, meta, control, formState, isOpen, handleSubmit, reset, onOpen, onOpenChange, onSubmit, onDelete } = useTokens();

    const renderCell = useCallback((data: IPluginMiddleware & { name: string }, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'middlewareName':
                return (
                    <div className='flex flex-col'>
                        <Link
                            className='text-bold text-sm text-primary'
                            href={`/panel/middlewares/tokens/${data.name}`}
                        >
                            {data.name}
                        </Link>
                    </div>
                );
            case 'middlewareKey':
                return (
                    <div className='flex flex-col'>
                        <Chip
                            color='secondary'
                            radius='full'
                        >
                            {data.name}@file
                        </Chip>
                    </div>
                );
            case 'token':
                return (
                    <div className='flex flex-col'>
                        <p className='text-bold text-sm'>{data.plugin['api_token_middleware'].tokens?.length ?? 0} Tokens</p>
                    </div>
                );
            case 'ip':
                return (
                    <div className='flex flex-col'>
                        <p className='text-bold text-sm'>{data.plugin['api_token_middleware'].whitelistIPs?.length ?? 0} IPs</p>
                    </div>
                );
            case 'action':
                return (
                    <Can
                        I={'delete'}
                        a={'Token'}
                    >
                        <AlertDialog
                            message='This action cannot be undone, are you sure?'
                            okText='Delete'
                            title={`Delete this middleware?`}
                            trigger={
                                <Button
                                    color='danger'
                                    isDisabled={data.name?.includes('neuro_proxy')}
                                    isIconOnly={true}
                                    size='sm'
                                    variant='light'
                                >
                                    <Trash2 size={20} />
                                </Button>
                            }
                            onOk={async () => {
                                await onDelete(data.name);
                            }}
                        />
                    </Can>
                );
            default:
                return <div />;
        }
    }, []);

    return (
        <div className='flex w-full flex-col gap-4'>
            {/* Action */}
            <div className='flex items-center justify-between gap-3'>
                <Input
                    isClearable
                    className='w-full max-w-[230px]'
                    classNames={{ input: 'text-sm' }}
                    labelPlacement='outside'
                    placeholder='Search'
                    radius='full'
                    startContent={<SearchIcon className='pointer-events-none flex-shrink-0 text-base text-default-400' />}
                    onValueChange={list.setFilterText}
                />

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'Token'}
                    >
                        <Tooltip content='Create middleware'>
                            <Button
                                color='primary'
                                radius='full'
                                startContent={<PlusIcon size={20} />}
                                onPress={() => {
                                    reset();
                                    onOpen();
                                }}
                            >
                                Create
                            </Button>
                        </Tooltip>
                    </Can>
                </div>
            </div>

            {/* Table */}
            <Table
                aria-label='token'
                border={0}
                isCompact={true}
                isHeaderSticky={true}
                isStriped={false}
                radius='lg'
                shadow={'sm'}
            >
                <TableHeader
                    columns={[
                        { name: 'Middleware Name', id: 'middlewareName' },
                        { name: 'Middleware Key', id: 'middlewareKey' },
                        { name: 'Tokens', id: 'token' },
                        { name: 'Whitelist IP', id: 'ip' },
                        { name: 'Action', id: 'action' },
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
                    items={list.items as (IPluginMiddleware & { name: string })[]}
                    loadingContent={<Loading />}
                    loadingState={list.loadingState}
                >
                    {(item) => (
                        <TableRow key={item.name}>{(columnKey) => <TableCell className='py-4'>{renderCell(item, columnKey)}</TableCell>}</TableRow>
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
                            list.sort({ column: `${page}`, direction: `ascending` });
                        }}
                    />
                </div>
            ) : null}

            {/* Modal */}
            <Modal
                backdrop='blur'
                isDismissable={false}
                isOpen={isOpen}
                placement='top'
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ModalHeader className='flex flex-col gap-1'>Middleware</ModalHeader>
                                <ModalBody className='flex flex-col gap-y-4'>
                                    <div className='flex w-full gap-4'>
                                        <Controller
                                            control={control}
                                            name='name'
                                            render={({ field, fieldState }) => (
                                                <Input
                                                    {...field}
                                                    description="Note: Middleware name must be unique and can't be changed later."
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Middleware Name'
                                                    placeholder='Enter middleware name'
                                                    value={field.value.replace(/ /g, '_')}
                                                />
                                            )}
                                            rules={{ required: 'Middleware name is required', validate: (value) => value.trim().length > 0 }}
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color='danger'
                                        isDisabled={formState.isSubmitting}
                                        variant='light'
                                        onPress={onClose}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        color='primary'
                                        isLoading={formState.isSubmitting}
                                        type='submit'
                                    >
                                        Save changes
                                    </Button>
                                </ModalFooter>
                            </form>
                        );
                    }}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default TableMiddleware;
