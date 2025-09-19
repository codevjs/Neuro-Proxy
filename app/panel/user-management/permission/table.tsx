'use client';

import {PencilIcon, PlusIcon, Trash2} from 'lucide-react';
import {Input, Textarea} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller} from 'react-hook-form';
import {Autocomplete, AutocompleteItem} from '@heroui/autocomplete';
import {Checkbox, CheckboxGroup} from '@heroui/checkbox';
import {Chip} from '@heroui/chip';

import usePermission from './_hook/permission.hook';

import {Can} from '@/contexts/casl.context';
import {PermissionType} from '@/repositories/database/panel/user-management/permission/schema.zod';
import {SearchIcon} from '@/components/icons';
import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import Pagination from '@/components/pagination';

interface Props {
    subjects: {
        value: string;
        label: string;
    }[];
}

const TablePermission: FC<Props> = ({subjects}) => {
    const {list, control, formState, isOpen, meta, onDelete, onSubmit, setValue, handleSubmit, reset, onOpen, onOpenChange} = usePermission();

    const renderCell = useCallback(
        (permission: PermissionType, columnKey: React.Key) => {
            const cellValue = permission[columnKey as keyof PermissionType];

            switch (columnKey) {
                case 'group':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue}</p>
                        </div>
                    );
                case 'name':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue}</p>
                        </div>
                    );
                case 'subject':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm capitalize'>{cellValue}</p>
                        </div>
                    );
                case 'description':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-sm'>{cellValue}</p>
                        </div>
                    );
                case 'actions':
                    return (
                        <div className='flex gap-2'>
                            {(cellValue as string[]).map((action, index) => (
                                <Chip
                                    key={index}
                                    className='capitalize'
                                    color='primary'
                                >
                                    {action}
                                </Chip>
                            ))}
                        </div>
                    );
                case 'action':
                    return (
                        <div className='relative flex w-full items-center justify-center gap-4'>
                            <Can
                                I={'update'}
                                a={'Permission'}
                            >
                                <Tooltip content='Edit Permission'>
                                    <Button
                                        color='secondary'
                                        isIconOnly={true}
                                        size='sm'
                                        variant='light'
                                        onPress={() => {
                                            reset();
                                            setValue('id', permission.id);
                                            setValue('name', permission.name);
                                            setValue('group', permission.group);
                                            setValue('subject', permission.subject);
                                            setValue('description', permission.description);
                                            setValue('actions', permission.actions);
                                            onOpen();
                                        }}
                                    >
                                        <PencilIcon size={20} />
                                    </Button>
                                </Tooltip>
                            </Can>
                            <Can
                                I={'delete'}
                                a={'Permission'}
                            >
                                <AlertDialog
                                    message='Are you sure you want to delete this permission?'
                                    okText='Delete'
                                    title={`Delete ${permission.name}`}
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
                                        await onDelete(permission.id ?? '');
                                    }}
                                />
                            </Can>
                        </div>
                    );
                default:
                    return cellValue;
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
                        a={'Permission'}
                    >
                        <Tooltip content='Create new permission'>
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
                        {name: 'Group', id: 'group', allowSorting: true},
                        {name: 'Name', id: 'name', allowSorting: true},
                        {name: 'Subject', id: 'subject', allowSorting: true},
                        {name: 'Description', id: 'description'},
                        {name: 'Permission', id: 'actions'},
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
                    items={list.items as PermissionType[]}
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
                size='xl'
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ModalHeader className='flex flex-col gap-1'>Add Permission</ModalHeader>
                                <ModalBody className='flex flex-col gap-y-4'>
                                    <div className='flex w-full gap-4'>
                                        <Controller
                                            control={control}
                                            name='group'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Group Name'
                                                    placeholder='Please enter group name'
                                                />
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name='name'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Permission Name'
                                                    placeholder='Please enter permission name'
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={control}
                                            name='subject'
                                            render={({field, fieldState}) => (
                                                <Autocomplete
                                                    ref={field.ref}
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Subject'
                                                    name={field.name}
                                                    placeholder='Please select subject'
                                                    selectedKey={field.value}
                                                    onSelectionChange={(value) => {
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    {subjects.map((subject) => (
                                                        <AutocompleteItem key={subject.value}>{subject.label}</AutocompleteItem>
                                                    ))}
                                                </Autocomplete>
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
                                                    label='Description'
                                                    placeholder={"Please enter permission's description"}
                                                />
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name='actions'
                                            render={({field, fieldState}) => (
                                                <CheckboxGroup
                                                    {...field}
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    label='Select actions'
                                                >
                                                    <Checkbox value='create'>Create</Checkbox>
                                                    <Checkbox value='read'>Read</Checkbox>
                                                    <Checkbox value='update'>Update</Checkbox>
                                                    <Checkbox value='delete'>Delete</Checkbox>
                                                </CheckboxGroup>
                                            )}
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

export default TablePermission;
