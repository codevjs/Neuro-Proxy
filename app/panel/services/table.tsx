'use client';

import {Input} from '@heroui/input';
import {FC, useCallback, useState, useEffect} from 'react';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Chip} from '@heroui/chip';
import {Container, Cpu, Route, Activity, WifiOff, Wifi, RefreshCw} from 'lucide-react';
import {Button} from '@heroui/button';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@heroui/modal';
import {Controller, useForm} from 'react-hook-form';
import {Input as HeroInput} from '@heroui/input';
import {Select, SelectItem} from '@heroui/select';

import {createRouterAction} from '../routers/_action/action';
import useMiddlewares from '../routers/_hook/middleware.hook';
import useEntryPoint from '../routers/_hook/entrypoint.hook';

import useServices from './_hook/service.hook';

import {Can} from '@/contexts/casl.context';
import {toastError, toastSuccess} from '@/helpers/toast.helper';
import Loading from '@/components/loading';
import {ITreafikServiceApi} from '@/repositories/api/traefik/traefik.api.interface';
import {SearchIcon} from '@/components/icons';
import Pagination from '@/components/pagination';

interface Props {}

const TableService: FC<Props> = () => {
    const {list, meta} = useServices();
    const middlewares = useMiddlewares();
    const entryPoints = useEntryPoint();
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();
    const [selectedService, setSelectedService] = useState<string>('');
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            list.reload();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh, list]);

    // Load health data when items change
    useEffect(() => {
        if (list.items.length > 0) {
            list.loadHealthData();
        }
    }, [list.items.length, list.loadHealthData]);

    const {control, formState, handleSubmit, reset} = useForm<{
        name: string;
        rule: string;
        middlewares: string[];
        entrypoints: string[];
    }>({
        defaultValues: {
            name: '',
            rule: '',
            middlewares: [],
            entrypoints: [],
        },
    });

    const onSubmit = useCallback(
        async (data: {name: string; rule: string; middlewares: string[]; entrypoints: string[]}) => {
            try {
                const result = await createRouterAction(data.name, {
                    rule: data.rule,
                    service: selectedService,
                    middlewares: data.middlewares,
                    entryPoints: data.entrypoints,
                });

                if (!result.success) throw new Error(result.message);

                toastSuccess('Router created')(result.message);
                reset();
                onClose();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to create router')(error.message);
            }
        },
        [selectedService, reset, onClose]
    );

    const renderCell = useCallback(
        (data: ITreafikServiceApi, columnKey: React.Key): React.ReactElement => {
            switch (columnKey) {
                case 'serviceName':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-sm'>{data.name}</p>
                        </div>
                    );
                case 'type':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-sm'>{data.type ?? '-'}</p>
                        </div>
                    );
                case 'provider':
                    return (
                        <div className='flex items-center gap-2'>
                            {data.provider === 'docker' ? (
                                <Container
                                    className='text-blue-500'
                                    size={20}
                                />
                            ) : (
                                <Cpu
                                    className='text-green-500'
                                    size={20}
                                />
                            )}
                            <p className='text-sm'>{data.provider ?? '-'}</p>
                        </div>
                    );
                case 'status':
                    return (
                        <div className='flex flex-col'>
                            <Chip
                                className='uppercase'
                                color={data.status === 'enabled' ? 'success' : 'danger'}
                                size='sm'
                            >
                                {data.status}
                            </Chip>
                        </div>
                    );
                case 'serverStatus':
                    return data.serverStatus ? (
                        <div className='flex w-full flex-col gap-2'>
                            {Object.keys(data.serverStatus).map((key, index) => (
                                <Chip
                                    key={index}
                                    color={data.serverStatus![key] === 'UP' ? 'success' : 'danger'}
                                    radius='full'
                                    size='sm'
                                >
                                    {key}
                                </Chip>
                            ))}
                        </div>
                    ) : (
                        <div>-</div>
                    );
                case 'health':
                    const health = (data as any).health;

                    if (!health) return <div>-</div>;

                    return (
                        <div className='flex items-center gap-2'>
                            {health.status === 'up' ? (
                                <Wifi className='h-4 w-4 text-success' />
                            ) : health.status === 'down' ? (
                                <WifiOff className='h-4 w-4 text-danger' />
                            ) : (
                                <Activity className='h-4 w-4 text-warning' />
                            )}
                            <div className='flex flex-col gap-1'>
                                <Chip
                                    color={health.status === 'up' ? 'success' : health.status === 'down' ? 'danger' : 'warning'}
                                    size='sm'
                                    variant='flat'
                                >
                                    {health.status}
                                </Chip>
                                {health.responseTime && <span className='text-tiny text-default-400'>{health.responseTime}ms</span>}
                            </div>
                        </div>
                    );
                case 'action':
                    return (
                        <div className='flex justify-center gap-2'>
                            <Can
                                I={'create'}
                                a={'Router'}
                            >
                                <Button
                                    color='primary'
                                    isDisabled={data.name.includes('kalla_proxy')}
                                    isIconOnly={true}
                                    size='sm'
                                    variant='light'
                                    onPress={() => {
                                        setSelectedService(data.name);
                                        reset();
                                        onOpen();
                                    }}
                                >
                                    <Route size={20} />
                                </Button>
                            </Can>
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [onOpen, reset]
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
                    placeholder='Search'
                    radius='full'
                    startContent={<SearchIcon className='pointer-events-none flex-shrink-0 text-base text-default-400' />}
                    onValueChange={list.setFilterText}
                />

                <div className='flex gap-x-2'>
                    <Button
                        radius='full'
                        size='sm'
                        startContent={<RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />}
                        variant={autoRefresh ? 'flat' : 'bordered'}
                        onPress={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? 'Auto Refreshing' : 'Auto Refresh'}
                    </Button>
                    <Button
                        isIconOnly
                        radius='full'
                        size='sm'
                        variant='light'
                        onPress={() => list.reload()}
                    >
                        <RefreshCw className='h-4 w-4' />
                    </Button>
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
                        {name: 'Service Name', id: 'serviceName'},
                        {name: 'Type', id: 'type'},
                        {name: 'Provider', id: 'provider'},
                        {name: 'Status', id: 'status'},
                        {name: 'Health Check', id: 'health'},
                        {name: 'Server Status', id: 'serverStatus'},
                        {name: 'Action', id: 'action'},
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
                    items={list.items as ITreafikServiceApi[]}
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
                            list.sort({column: `${page}`, direction: `ascending`});
                        }}
                    />
                </div>
            ) : null}

            {/* Create Router Modal */}
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
                                <ModalHeader className='flex flex-col gap-1'>Create Router for {selectedService}</ModalHeader>
                                <ModalBody>
                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={control}
                                            name='name'
                                            render={({field, fieldState}) => (
                                                <HeroInput
                                                    {...field}
                                                    description='Note: Router name must be unique, and no space allowed.'
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Router Name'
                                                    placeholder='Enter router name'
                                                    value={field.value.replace(/ /g, '_')}
                                                />
                                            )}
                                            rules={{required: 'Router name is required', validate: (value) => value.trim().length > 0}}
                                        />

                                        <Controller
                                            control={control}
                                            name='rule'
                                            render={({field, fieldState}) => (
                                                <HeroInput
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
                                            rules={{required: 'Rule is required', validate: (value) => value.trim().length > 0}}
                                        />

                                        <Controller
                                            control={control}
                                            name='entrypoints'
                                            render={({field, fieldState}) => {
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
                                                        {(entryPoints.list.items as {name: string}[]).map((entryPoint) => (
                                                            <SelectItem key={entryPoint.name}>{entryPoint.name}</SelectItem>
                                                        ))}
                                                    </Select>
                                                );
                                            }}
                                        />

                                        <Controller
                                            control={control}
                                            name='middlewares'
                                            render={({field, fieldState}) => {
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
                                                        {(middlewares.list.items as {name: string}[]).map((middleware) => (
                                                            <SelectItem key={`${middleware.name}@file`}>{middleware.name}</SelectItem>
                                                        ))}
                                                    </Select>
                                                );
                                            }}
                                        />

                                        <div className='text-sm text-default-500'>
                                            <strong>Service:</strong> {selectedService}
                                        </div>
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
                                        Create Router
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
