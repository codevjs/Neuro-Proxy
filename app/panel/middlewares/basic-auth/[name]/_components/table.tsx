'use client';

import {PlusIcon, SearchIcon, Trash2, Clipboard} from 'lucide-react';
import {Input} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller} from 'react-hook-form';

import useTokens from '../_hook/basic-auth.hook';

import Loading from '@/components/loading';
import {Can} from '@/contexts/casl.context';
import AlertDialog from '@/components/alert-dialog';
import Pagination from '@/components/pagination';

interface Props {
    name: string;
}

const TableBasicAuth: FC<Props> = ({name}) => {
    const {list, meta, control, formState, isOpen, handleCopy, handleSubmit, reset, onOpen, onOpenChange, onSubmit, onDelete} = useTokens(name);

    const renderCell = useCallback((data: {id: string; user: string}, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'user':
                return (
                    <div className='flex flex-col'>
                        <p className='text-bold text-sm'>{data.user.slice(0, 30)}..........</p>
                    </div>
                );
            case 'action':
                return (
                    <div className='flex items-center justify-end gap-2'>
                        <Button
                            color='secondary'
                            isIconOnly={true}
                            variant='light'
                            onPress={handleCopy(data.user)}
                        >
                            <Clipboard size={20} />
                        </Button>
                        <Can
                            I={'delete'}
                            a={'BasicAuth'}
                        >
                            <AlertDialog
                                message='This action cannot be undone, are you sure?'
                                okText='Revoke'
                                title={`Revoke this user?`}
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
                                    await onDelete(data.user);
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

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'BasicAuth'}
                    >
                        <Tooltip content='Create access basic auth'>
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
                aria-label='basic auth table'
                border={0}
                isCompact={true}
                isHeaderSticky={true}
                isStriped={false}
                radius='lg'
                shadow={'sm'}
            >
                <TableHeader
                    columns={[
                        {name: 'User', id: 'user'},
                        {name: 'Action', id: 'action'},
                    ]}
                >
                    {(column) => (
                        <TableColumn
                            key={column.id}
                            align={column.id === 'action' ? 'end' : 'start'}
                            width={column.id === 'action' ? 100 : column.id === 'token' ? 300 : 0}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={'No rows to display.'}
                    items={list.items as {id: string; user: string}[]}
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
                                <ModalHeader className='flex flex-col gap-1'>Username</ModalHeader>
                                <ModalBody className='flex flex-col gap-y-4'>
                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={control}
                                            name='username'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    description="Note: Access username must be unique and can't be changed later."
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Username'
                                                    placeholder='Enter username'
                                                    value={field.value.replace(/ /g, '')}
                                                />
                                            )}
                                            rules={{
                                                required: 'Username is required',
                                            }}
                                        />

                                        <Controller
                                            control={control}
                                            name='password'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    description='Please remember the password because the password will not appear on the list'
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Password'
                                                    placeholder='Enter password'
                                                    value={field.value.replace(/ /g, '')}
                                                />
                                            )}
                                            rules={{
                                                required: 'Password is required',
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

export default TableBasicAuth;
