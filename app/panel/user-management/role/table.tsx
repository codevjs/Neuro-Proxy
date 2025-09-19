'use client';

import {PencilIcon, PlusIcon, Settings2, Trash2} from 'lucide-react';
import {Input, Textarea} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller} from 'react-hook-form';
import Link from 'next/link';

import useRole from './_hook/role.hook';

import {RoleType} from '@/repositories/database/panel/user-management/role/schema.zod';
import {Can} from '@/contexts/casl.context';
import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import Pagination from '@/components/pagination';
import {SearchIcon} from '@/components/icons';

interface Props {}

const TableRole: FC<Props> = () => {
    const {list, control, formState, isOpen, meta, onDelete, onSubmit, setValue, handleSubmit, reset, onOpen, onOpenChange} = useRole();

    const renderCell = useCallback(
        (role: RoleType, columnKey: React.Key): React.ReactElement => {
            const cellValue: any = role[columnKey as keyof RoleType];

            switch (columnKey) {
                case 'name':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue}</p>
                        </div>
                    );
                case 'description':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue ?? '-'}</p>
                        </div>
                    );
                case 'permission':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue.flatMap((i: any) => i.action).length}</p>
                        </div>
                    );
                case 'action':
                    return (
                        <div className='relative flex w-full items-center justify-center gap-4'>
                            <Can
                                I={'update'}
                                a={'Role'}
                            >
                                <Tooltip content='Change Permission'>
                                    {role.name === 'superadmin' ? (
                                        <Button
                                            color='secondary'
                                            isDisabled={true}
                                            isIconOnly={true}
                                            size='sm'
                                            variant='light'
                                        >
                                            <Settings2 size={20} />
                                        </Button>
                                    ) : (
                                        <Link href={`/panel/user-management/role/${role.id}`}>
                                            <Button
                                                color='secondary'
                                                isIconOnly={true}
                                                size='sm'
                                                variant='light'
                                            >
                                                <Settings2 size={20} />
                                            </Button>
                                        </Link>
                                    )}
                                </Tooltip>
                            </Can>
                            <Can
                                I={'update'}
                                a={'Role'}
                            >
                                <Tooltip content='Edit Role'>
                                    {role.name === 'superadmin' ? (
                                        <Button
                                            color='secondary'
                                            isDisabled={true}
                                            isIconOnly={true}
                                            size='sm'
                                            variant='light'
                                        >
                                            <PencilIcon size={20} />
                                        </Button>
                                    ) : (
                                        <Button
                                            color='secondary'
                                            isIconOnly={true}
                                            size='sm'
                                            variant='light'
                                            onPress={() => {
                                                reset();
                                                setValue('id', role.id);
                                                setValue('name', role.name);
                                                setValue('description', role.description);
                                                onOpen();
                                            }}
                                        >
                                            <PencilIcon size={20} />
                                        </Button>
                                    )}
                                </Tooltip>
                            </Can>
                            <Can
                                I={'delete'}
                                a={'Role'}
                            >
                                {role.name === 'superadmin' ? (
                                    <span className='cursor-not-allowed text-lg text-danger opacity-30'>
                                        <Trash2 size={20} />
                                    </span>
                                ) : (
                                    <AlertDialog
                                        message='Are you sure you want to delete this role?'
                                        okText='Delete'
                                        title={`Delete ${role.name}`}
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
                                            await onDelete(role.id ?? '');
                                        }}
                                    />
                                )}
                            </Can>
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [onDelete, setValue, onOpen, reset]
    );

    return (
        <div className='flex w-full flex-col gap-4'>
            {/* Action */}
            <div className='flex items-center justify-between gap-3'>
                <Input
                    isClearable
                    className='w-full max-w-[230px]'
                    classNames={{input: 'text-sm'}}
                    labelPlacement='outside'
                    placeholder='Search by name'
                    radius='full'
                    startContent={<SearchIcon className='pointer-events-none flex-shrink-0 text-base text-default-400' />}
                    onValueChange={list.setFilterText}
                />

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'Role'}
                    >
                        <Tooltip content='Create new role'>
                            <Button
                                color='primary'
                                radius='full'
                                startContent={<PlusIcon size={20} />}
                                onPress={() => {
                                    onOpen();
                                    reset();
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
                aria-label='education level table'
                border={0}
                isCompact={true}
                isHeaderSticky={true}
                isStriped={false}
                radius='lg'
                shadow={'sm'}
                sortDescriptor={list.sortDescriptor}
                onSortChange={list.sort}
            >
                <TableHeader
                    columns={[
                        {name: 'Name', id: 'name', allowSorting: true},
                        {name: 'Description', id: 'description'},
                        {name: 'Permission', id: 'permission'},
                        {name: '', id: 'action'},
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
                    items={list.items as RoleType[]}
                    loadingContent={<Loading />}
                    loadingState={list.loadingState}
                >
                    {(item: RoleType) => (
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
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ModalHeader className='flex flex-col gap-1'>Add Role</ModalHeader>
                                <ModalBody className='flex flex-col gap-y-4'>
                                    <Controller
                                        control={control}
                                        name='name'
                                        render={({field, fieldState}) => (
                                            <Input
                                                {...field}
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isRequired={true}
                                                label='Role Name'
                                                placeholder='Please enter role name'
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name='description'
                                        render={({field, fieldState}) => (
                                            <Textarea
                                                {...field}
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isRequired={true}
                                                label='Description'
                                                placeholder='Please enter description'
                                                value={field.value ?? ''}
                                            />
                                        )}
                                    />
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

export default TableRole;
