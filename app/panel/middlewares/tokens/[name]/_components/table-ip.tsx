'use client';

import {PlusIcon, SearchIcon, Trash2} from 'lucide-react';
import {Input} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller} from 'react-hook-form';

import useWhitelistIP from '../_hook/ip.hook';

import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import {Can} from '@/contexts/casl.context';
import Pagination from '@/components/pagination';

interface Props {
    name: string;
}

const TableIP: FC<Props> = ({name}) => {
    const {list, meta, control, formState, isOpen, handleSubmit, reset, onOpen, onOpenChange, onSubmit, onDelete} = useWhitelistIP(name);

    const renderCell = useCallback((data: {id: string; ip: string}, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'ip':
                return (
                    <div className='flex flex-col'>
                        <p className='text-bold text-sm'>{data.ip}</p>
                    </div>
                );
            case 'action':
                return (
                    <div className='flex items-center justify-end gap-2'>
                        <Can
                            I={'delete'}
                            a={'Token'}
                        >
                            <AlertDialog
                                message='This action cannot be undone, are you sure?'
                                okText='Revoke'
                                title={`Delete this IP?`}
                                trigger={
                                    <Button
                                        color='danger'
                                        isIconOnly={true}
                                        size='sm'
                                        variant='light'
                                    >
                                        <Trash2 size={20} />
                                    </Button>
                                }
                                onOk={async () => {
                                    await onDelete(data.ip);
                                }}
                            />
                        </Can>
                    </div>
                );
            default:
                return <div />;
        }
    }, []);

    return (
        <div className='flex w-full flex-col gap-4'>
            <p className='text-sm text-default-500'>
                Allows you to specify a list of whitelisted IP addresses that will not have the API-token checked.
            </p>

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
                />

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'Token'}
                    >
                        <Tooltip content='Add new whitelist IP'>
                            <Button
                                color='secondary'
                                radius='full'
                                startContent={<PlusIcon size={20} />}
                                onPress={() => {
                                    reset();
                                    onOpen();
                                }}
                            >
                                Add Whitelist IP
                            </Button>
                        </Tooltip>
                    </Can>
                </div>
            </div>

            {/* Table */}
            <Table
                aria-label='whitelist ip table'
                border={0}
                isCompact={true}
                isHeaderSticky={true}
                isStriped={false}
                radius='lg'
                shadow={'sm'}
            >
                <TableHeader
                    columns={[
                        {name: 'IP', id: 'ip'},
                        {name: 'Action', id: 'action'},
                    ]}
                >
                    {(column) => (
                        <TableColumn
                            key={column.id}
                            align={column.id === 'action' ? 'end' : 'start'}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={'No rows to display.'}
                    items={list.items as {id: string; ip: string}[]}
                    loadingContent={<Loading />}
                    loadingState={list.loadingState}
                >
                    {(item) => (
                        <TableRow key={item.id}>{(columnKey) => <TableCell className='py-4'>{renderCell(item, columnKey)}</TableCell>}</TableRow>
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
                                            name='ip'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    description="Note: IP must be unique and can't be changed later."
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='IP'
                                                    placeholder='Enter IP'
                                                    value={field.value.replace(/ /g, '')}
                                                />
                                            )}
                                            rules={{
                                                required: 'ip is required',
                                            }}
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

export default TableIP;
