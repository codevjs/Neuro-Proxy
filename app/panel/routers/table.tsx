'use client';

import { Input } from '@heroui/input';
import { FC, useCallback } from 'react';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { PencilIcon, PlusIcon, Trash2 } from 'lucide-react';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Controller, useWatch } from 'react-hook-form';
import { Tooltip } from '@heroui/tooltip';
import { Select, SelectItem } from '@heroui/select';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';

import useServices from '../services/_hook/service.hook';

import useRouters from './_hook/router.hook';
import useMiddlewares from './_hook/middleware.hook';
import CheckStatus from './_components/check-status';
import useEntryPoint from './_hook/entrypoint.hook';

import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import { IRouter } from '@/repositories/file/traefik/treafik.file.interface';
import { Can } from '@/contexts/casl.context';
import { SearchIcon } from '@/components/icons';
import Pagination from '@/components/pagination';

interface Props { }

const TableService: FC<Props> = () => {
    const routers = useRouters();

    const services = useServices();

    const middlewares = useMiddlewares();

    const entryPoints = useEntryPoint();

    const renderCell = useCallback((data: IRouter & { name: string }, columnKey: React.Key): React.ReactElement => {
        switch (columnKey) {
            case 'routerName':
                return (
                    <div className='flex flex-col'>
                        <p className='text-sm'>{data.name}</p>
                    </div>
                );
            case 'rule':
                return (
                    <div className='flex flex-col'>
                        <p className='text-sm'>{data.rule}</p>
                    </div>
                );
            case 'entryPoints':
                return (
                    <div className='flex flex-col gap-2'>
                        {data.entryPoints?.map((entryPoint, i) => (
                            <Chip
                                key={i}
                                size='sm'
                            >
                                {entryPoint}
                            </Chip>
                        ))}
                    </div>
                );
            case 'middlewares':
                return (
                    <div className='flex flex-col gap-2'>
                        {data.middlewares?.map((middleware, i) => (
                            <Chip
                                key={i}
                                size='sm'
                            >
                                {middleware}
                            </Chip>
                        ))}
                    </div>
                );
            case 'service':
                return (
                    <div className='flex flex-col'>
                        <Chip size='sm'>{data.service}</Chip>
                    </div>
                );
            case 'status':
                return <CheckStatus name={`${data.name}@file`} />;
            case 'action':
                return (
                    <div className='flex justify-center gap-2'>
                        <Can
                            I={'update'}
                            a={'Router'}
                        >
                            <Button
                                color='secondary'
                                isDisabled={data.service?.includes('neuro_proxy_service')}
                                isIconOnly={true}
                                size='sm'
                                variant='light'
                                onPress={() => {
                                    services.list.setFilterText(data.service ?? '');

                                    routers.reset();

                                    routers.setValue('isEdit', true);
                                    routers.setValue('name', data.name);
                                    routers.setValue('rule', data.rule);
                                    routers.setValue('entrypoints', data.entryPoints ?? []);
                                    routers.setValue('middlewares', data.middlewares ?? []);
                                    routers.setValue('service', data.service);

                                    routers.onOpen();
                                }}
                            >
                                <PencilIcon size={20} />
                            </Button>
                        </Can>
                        <Can
                            I={'delete'}
                            a={'Router'}
                        >
                            <AlertDialog
                                message='This action cannot be undone, are you sure?'
                                okText='Delete'
                                title={`Delete this router?`}
                                trigger={
                                    <Button
                                        color='danger'
                                        isDisabled={data.service.endsWith('api@internal') || data.service?.includes('neuro_proxy_service')}
                                        isIconOnly={true}
                                        size='sm'
                                        variant='light'
                                    >
                                        <Trash2 size={20} />
                                    </Button>
                                }
                                onOk={async () => {
                                    await routers.onDelete(data.name);
                                }}
                            />
                        </Can>
                    </div>
                );
            default:
                return <div />;
        }
    }, []);

    const [isEdit, service] = useWatch({ control: routers.control, name: ['isEdit', 'service'] });

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
                    onValueChange={routers.list.setFilterText}
                />

                <div className='flex gap-x-2'>
                    <Can
                        I={'create'}
                        a={'Router'}
                    >
                        <Tooltip content='Create router'>
                            <Button
                                color='primary'
                                radius='full'
                                startContent={<PlusIcon size={20} />}
                                onPress={() => {
                                    routers.reset();
                                    routers.onOpen();
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
            >
                <TableHeader
                    columns={[
                        { name: 'Router Name', id: 'routerName' },
                        { name: 'Rule', id: 'rule' },
                        { name: 'Entry Points', id: 'entryPoints' },
                        { name: 'Middlewares', id: 'middlewares' },
                        { name: 'Service', id: 'service' },
                        { name: 'Status', id: 'status' },
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
                    items={routers.list.items as (IRouter & { name: string })[]}
                    loadingContent={<Loading />}
                    loadingState={routers.list.loadingState}
                >
                    {(item) => (
                        <TableRow key={item.name}>{(columnKey) => <TableCell className='py-4'>{renderCell(item, columnKey)}</TableCell>}</TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {routers.list.items.length > 0 ? (
                <div className='flex w-full justify-end'>
                    <Pagination
                        limit={15}
                        meta={routers.meta}
                        onChange={(page) => {
                            routers.list.sort({ column: `${page}`, direction: `ascending` });
                        }}
                    />
                </div>
            ) : null}

            {/* Modal */}
            <Modal
                backdrop='blur'
                isDismissable={false}
                isOpen={routers.isOpen}
                placement='top'
                onOpenChange={routers.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={routers.handleSubmit(routers.onSubmit)}>
                                <ModalHeader className='flex flex-col gap-1'>{isEdit ? 'Edit' : 'Add'} Router</ModalHeader>
                                <ModalBody>
                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={routers.control}
                                            name='name'
                                            render={({ field, fieldState }) => (
                                                <Input
                                                    {...field}
                                                    description='Note: Router name must be unique, and no space allowed.'
                                                    errorMessage={fieldState.error?.message}
                                                    isDisabled={isEdit}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Router Name'
                                                    placeholder='Enter router name'
                                                    value={field.value.replace(/ /g, '_')}
                                                />
                                            )}
                                            rules={{ required: 'Router name is required', validate: (value) => value.trim().length > 0 }}
                                        />

                                        <Controller
                                            control={routers.control}
                                            name='rule'
                                            render={({ field, fieldState }) => (
                                                <Input
                                                    {...field}
                                                    description={
                                                        <span className='text-xs'>
                                                            Please read treafik rule{' '}
                                                            <a
                                                                className='text-primary'
                                                                href='https://doc.traefik.io/traefik/routing/routers/'
                                                                target='__blank'
                                                            >
                                                                Here.
                                                            </a>
                                                        </span>
                                                    }
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Rule'
                                                    placeholder='Host(`example.domain.com`), PathPrefix(`/products`)'
                                                    value={field.value}
                                                />
                                            )}
                                            rules={{ required: 'Rule is required', validate: (value) => value.trim().length > 0 }}
                                        />

                                        <Controller
                                            control={routers.control}
                                            name='entrypoints'
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <Select
                                                        errorMessage={fieldState.error?.message}
                                                        isInvalid={fieldState.invalid}
                                                        label='Entry Points'
                                                        placeholder='Please select entry points'
                                                        selectedKeys={new Set(field.value)}
                                                        selectionMode='multiple'
                                                        onSelectionChange={(keys) => {
                                                            field.onChange(Array.from(keys));
                                                        }}
                                                    >
                                                        {(entryPoints.list.items as { name: string }[]).map((entryPoint) => (
                                                            <SelectItem key={entryPoint.name}>{entryPoint.name}</SelectItem>
                                                        ))}
                                                    </Select>
                                                );
                                            }}
                                        />

                                        <Controller
                                            control={routers.control}
                                            name='middlewares'
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <Select
                                                        errorMessage={fieldState.error?.message}
                                                        isInvalid={fieldState.invalid}
                                                        label='Middleware'
                                                        placeholder='Please select middleware'
                                                        selectedKeys={new Set(field.value)}
                                                        selectionMode='multiple'
                                                        onSelectionChange={(keys) => {
                                                            field.onChange(Array.from(keys));
                                                        }}
                                                    >
                                                        {(middlewares.list.items as { name: string }[]).map((middleware) => (
                                                            <SelectItem key={`${middleware.name}@file`}>{middleware.name}</SelectItem>
                                                        ))}
                                                    </Select>
                                                );
                                            }}
                                        />

                                        <Controller
                                            control={routers.control}
                                            name='service'
                                            render={({ field, fieldState }) => (
                                                <Autocomplete
                                                    ref={field.ref}
                                                    errorMessage={fieldState.error?.message}
                                                    isDisabled={service?.includes('api@internal')}
                                                    isInvalid={fieldState.invalid}
                                                    isLoading={services.list.isLoading}
                                                    isRequired={true}
                                                    label='Service'
                                                    name={field.name}
                                                    placeholder='Please select service'
                                                    selectedKey={field.value}
                                                    onInputChange={services.list.setFilterText}
                                                    onSelectionChange={field.onChange}
                                                >
                                                    {(services.list.items as { name: string }[]).map((service) => (
                                                        <AutocompleteItem key={service.name}>{service.name}</AutocompleteItem>
                                                    ))}
                                                </Autocomplete>
                                            )}
                                            rules={{ required: 'Serivce is required' }}
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color='danger'
                                        isDisabled={routers.formState.isSubmitting}
                                        variant='light'
                                        onPress={onClose}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        color='primary'
                                        isLoading={routers.formState.isSubmitting}
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

export default TableService;
