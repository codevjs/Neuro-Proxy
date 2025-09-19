'use client';

import {PencilIcon, PlusIcon, Trash2} from 'lucide-react';
import {Input} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller, useWatch} from 'react-hook-form';
import {Autocomplete, AutocompleteItem} from '@heroui/autocomplete';
import {User} from '@heroui/user';
import {Prisma, Role, User as UserType} from '@prisma/client';

import useUser from './_hook/user.hook';

import {Can} from '@/contexts/casl.context';
import {SearchIcon} from '@/components/icons';
import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import Pagination from '@/components/pagination';

interface Props {
    roles: {
        permission: Prisma.JsonValue;
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
}

const TableUser: FC<Props> = ({roles}) => {
    const {list, control, formState, isOpen, meta, onDelete, onSubmit, setValue, handleSubmit, reset, onOpen, onOpenChange} = useUser();

    const renderCell = useCallback(
        (
            user: UserType & {
                role: Role;
            },
            columnKey: React.Key
        ) => {
            const cellValue = user[columnKey as keyof UserType];

            switch (columnKey) {
                case 'name':
                    return (
                        <User
                            avatarProps={{radius: 'full', src: user.image ?? ''}}
                            description={user.email}
                            name={cellValue as string}
                        >
                            {user.email}
                        </User>
                    );
                case 'role':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{user.role?.name ?? '-'}</p>
                            <p className='text-bold text-xs capitalize text-default-400'>{user.role?.description ?? '-'}</p>
                        </div>
                    );
                case 'action':
                    return (
                        <div className='relative flex w-full items-center justify-center gap-4'>
                            <Can
                                I={'update'}
                                a={'User'}
                            >
                                <Tooltip content='Edit User'>
                                    <Button
                                        color='secondary'
                                        isIconOnly={true}
                                        size='sm'
                                        variant='light'
                                        onPress={() => {
                                            reset();
                                            setValue('id', user.id);
                                            setValue('email', user.email);
                                            setValue('name', user.name);
                                            setValue('role', user.role.id);
                                            onOpen();
                                        }}
                                    >
                                        <PencilIcon size={20} />
                                    </Button>
                                </Tooltip>
                            </Can>
                            <Can
                                I={'delete'}
                                a={'User'}
                            >
                                <AlertDialog
                                    message='Are you sure you want to delete this user?'
                                    okText='Delete'
                                    title={`Delete ${user.name}`}
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
                                        await onDelete(user.id ?? '');
                                    }}
                                />
                            </Can>
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [onDelete, setValue, onOpen, reset]
    );

    const [id] = useWatch({control, name: ['id']});

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
                    onChange={(e) => list.setFilterText(e.target.value)}
                />

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'user'}
                    >
                        <Tooltip content='Create user'>
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
                aria-label='user table'
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
                        {name: 'Role', id: 'role'},
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
                    items={list.items as (UserType & {role: Role})[]}
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
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ModalHeader className='flex flex-col gap-1'>{id ? 'Update User' : 'Create User'}</ModalHeader>
                                <ModalBody className='flex flex-col gap-y-4'>
                                    <Controller
                                        control={control}
                                        name='name'
                                        render={({field, fieldState}) => (
                                            <Input
                                                ref={field.ref}
                                                color='primary'
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isRequired={true}
                                                label='Name'
                                                placeholder='Enter your name'
                                                value={field.value}
                                                variant='underlined'
                                                onChange={field.onChange}
                                            />
                                        )}
                                        rules={{required: 'name is required'}}
                                    />

                                    <Controller
                                        control={control}
                                        name='email'
                                        render={({field, fieldState}) => (
                                            <Input
                                                ref={field.ref}
                                                color='primary'
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isRequired={true}
                                                label='Email'
                                                placeholder='Enter your email'
                                                type='email'
                                                value={field.value}
                                                variant='underlined'
                                                onChange={field.onChange}
                                            />
                                        )}
                                        rules={{
                                            required: 'Email is required',
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message: 'Invalid email',
                                            },
                                        }}
                                    />

                                    <Controller
                                        control={control}
                                        name='role'
                                        render={({field, fieldState}) => (
                                            <Autocomplete
                                                ref={field.ref}
                                                color='primary'
                                                errorMessage={fieldState.error?.message}
                                                isClearable={false}
                                                isInvalid={fieldState.invalid}
                                                isRequired={true}
                                                label='Role'
                                                placeholder='Please select your role'
                                                selectedKey={field.value}
                                                variant='underlined'
                                                onSelectionChange={field.onChange}
                                            >
                                                {roles.map((role) => (
                                                    <AutocompleteItem key={role.id}>{role.name}</AutocompleteItem>
                                                ))}
                                            </Autocomplete>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name='password'
                                        render={({field, fieldState}) => (
                                            <Input
                                                ref={field.ref}
                                                color='primary'
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isRequired={!id}
                                                label='Password'
                                                placeholder='Enter your password'
                                                value={field.value}
                                                variant='underlined'
                                                onChange={field.onChange}
                                            />
                                        )}
                                        rules={{required: !id ? 'Password is required' : false}}
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

export default TableUser;
