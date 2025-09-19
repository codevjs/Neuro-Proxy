'use client';

import Dockerode from 'dockerode';
import {Box, Container, Network} from 'lucide-react';
import {FC} from 'react';
import {Chip} from '@heroui/chip';
import {Button} from '@heroui/button';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Controller} from 'react-hook-form';
import {Autocomplete, AutocompleteItem} from '@heroui/autocomplete';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Input} from '@heroui/input';

import useContainer from '../_hooks/container.hook';
import useNetwork from '../_hooks/network.hook';

import AlertDialog from '@/components/alert-dialog';
import {Can} from '@/contexts/casl.context';
import {calculateCPUUsage} from '@/helpers/calculate-cpu-usage.helper';

interface Props {
    data: Dockerode.ContainerInspectInfo;
    stats: Dockerode.ContainerStats;
    supports: Dockerode.ContainerInfo[];
}

const Detail: FC<Props> = ({data, stats, supports}) => {
    const network = useNetwork(data.Id);
    const container = useContainer(data.Id);

    return (
        <>
            <div className='flex w-full flex-col gap-4'>
                {/* <Can
                    I={'update'}
                    a={'Container'}
                >
                    <div className='flex w-full justify-end gap-2'>
                        {supports.length > 0 ? (
                            <AlertDialog
                                trigger={
                                    <Button
                                        size='sm'
                                        radius='full'
                                        color='danger'
                                        startContent={<Scaling size={18} />}
                                    >
                                        Stop Scalling
                                    </Button>
                                }
                                title={'Stop scalling this container?'}
                                message={'This action will stop scalling the container, are you sure?'}
                                okText='Stop'
                                type='success'
                                onOk={async () => {
                                    await container.stopScaleContainer(supports.map((support) => support.Id));
                                }}
                            />
                        ) : (
                            <Button
                                size='sm'
                                radius='full'
                                startContent={<Scaling size={18} />}
                                onPress={container.onOpenChange}
                                isDisabled={data.State.Status !== 'running'}
                            >
                                Scalling
                            </Button>
                        )}

                        <AlertDialog
                            trigger={
                                <Button
                                    size='sm'
                                    radius='full'
                                    startContent={<Play size={18} />}
                                    isDisabled={data.State.Status === 'running'}
                                >
                                    Start
                                </Button>
                            }
                            title={`Start this container?`}
                            message={`This action will start the container, are you sure?`}
                            okText='Start'
                            type='success'
                            onOk={async () => {
                                await container.startContainer();
                            }}
                        />

                        <AlertDialog
                            trigger={
                                <Button
                                    size='sm'
                                    color='danger'
                                    radius='full'
                                    startContent={<Square size={18} />}
                                    isDisabled={data.State.Status !== 'running'}
                                >
                                    Stop
                                </Button>
                            }
                            title={`Stop this container?`}
                            message={`This action will stop the container, are you sure?`}
                            okText='Stop'
                            onOk={async () => {
                                await container.stopContainer();
                            }}
                        />

                        <AlertDialog
                            trigger={
                                <Button
                                    size='sm'
                                    radius='full'
                                    startContent={<RotateCcw size={18} />}
                                >
                                    Restart
                                </Button>
                            }
                            title={`Restart this container?`}
                            message={`This action will restart the container, are you sure?`}
                            okText='Restart'
                            type='success'
                            onOk={async () => {
                                await container.restartContainer();
                            }}
                        />
                    </div>
                </Can> */}

                <div className='flex w-full flex-col gap-4 rounded-xl border border-default-100 pb-4 shadow dark:bg-content1'>
                    <div className='flex w-full items-center justify-between gap-2 rounded-t-xl bg-default-100 px-4 py-5 dark:bg-content2'>
                        <div className='flex items-center gap-2'>
                            <Box size={20} />
                            <h1>Status</h1>
                        </div>
                    </div>

                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-20 px-4'>
                            <span className='w-1/3 text-sm text-default-500'>Name</span>
                            <span className='w-2/3 text-sm text-default-500'>{data.Name.replace('/', '')}</span>
                        </div>

                        <div className='border-b border-default-100' />
                        <div className='flex gap-20 px-4'>
                            <span className='w-1/3 text-sm text-default-500'>Image</span>
                            <span className='w-2/3 text-sm text-default-500'>{data.Config.Image}</span>
                        </div>

                        <div className='border-b border-default-100' />
                        <div className='flex gap-20 px-4'>
                            <span className='w-1/3 text-sm text-default-500'>CPU Usage</span>
                            <span className='w-2/3 text-sm text-default-500'>
                                <div className='w-2/3'>{calculateCPUUsage(stats).toFixed(2)}%</div>
                            </span>
                        </div>

                        <div className='border-b border-default-100' />
                        <div className='flex gap-20 px-4'>
                            <span className='w-1/3 text-sm text-default-500'>State</span>
                            <div className='w-2/3'>
                                <Chip
                                    color={data.State.Status === 'running' ? 'success' : 'danger'}
                                    size='sm'
                                >
                                    {data.State.Status}
                                </Chip>
                            </div>
                        </div>
                    </div>
                </div>

                {supports.length > 0 ? (
                    <div className='flex w-full flex-col gap-4 rounded-xl border border-default-100 pb-4 shadow dark:bg-content1'>
                        <div className='flex w-full items-center justify-between gap-2 rounded-t-xl bg-default-100 px-4 py-5 dark:bg-content2'>
                            <div className='flex items-center gap-2'>
                                <Container size={20} />
                                <h1>Container Support</h1>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            {supports.map((s) => (
                                <div
                                    key={s.Id}
                                    className='flex gap-20 px-4'
                                >
                                    <a
                                        className='w-2/3 text-sm text-primary'
                                        href={`/panel/container/${s.Id}`}
                                        rel='noreferrer'
                                        target='_blank'
                                    >
                                        {s.Names[0]?.replace(`-${data.Id}`, '')}
                                    </a>
                                    <div className='w-1/3'>
                                        <Chip
                                            color={s.State === 'running' ? 'success' : 'danger'}
                                            size='sm'
                                        >
                                            {s.State}
                                        </Chip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className='flex w-full flex-col gap-4 rounded-xl border border-default-100 pb-4 shadow dark:bg-content1'>
                    <div className='flex w-full items-center gap-2 rounded-t-xl bg-default-100 px-4 py-5 dark:bg-content2'>
                        <Network size={20} />
                        <h1>Network</h1>
                    </div>

                    <div className='flex flex-col'>
                        <div className='flex w-full items-center gap-4 px-4'>
                            <Can
                                I={'update'}
                                a={'Container'}
                            >
                                <form
                                    className='flex w-full items-center gap-2'
                                    onSubmit={network.handleSubmit(network.joinNetworkContainer)}
                                >
                                    <Controller
                                        control={network.control}
                                        name='network'
                                        render={({field, fieldState}) => (
                                            <Autocomplete
                                                ref={field.ref}
                                                className='w-full'
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={fieldState.invalid}
                                                isLoading={network.list.isLoading}
                                                isRequired={true}
                                                label='Network'
                                                name={field.name}
                                                radius='full'
                                                selectedKey={field.value}
                                                size='sm'
                                                onSelectionChange={field.onChange}
                                            >
                                                {network.list.items.map((network) => (
                                                    <AutocompleteItem key={network.Id}>{network.Name}</AutocompleteItem>
                                                ))}
                                            </Autocomplete>
                                        )}
                                        rules={{required: 'Network is required'}}
                                    />

                                    <Button
                                        color='primary'
                                        isLoading={network.formState.isSubmitting}
                                        radius='full'
                                        type='submit'
                                    >
                                        Join
                                    </Button>
                                </form>
                            </Can>
                        </div>

                        <Table
                            aria-label='Network'
                            isCompact={true}
                            isStriped={true}
                            radius='lg'
                            shadow={'none'}
                        >
                            <TableHeader>
                                <TableColumn>Name</TableColumn>
                                <TableColumn>IP Address</TableColumn>
                                <TableColumn>Gateway</TableColumn>
                                <TableColumn>Action</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {data.NetworkSettings.Networks &&
                                    Object.keys(data.NetworkSettings.Networks).map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className='py-4'>{item}</TableCell>
                                            <TableCell className='py-4'>{data.NetworkSettings.Networks[item].IPAddress}</TableCell>
                                            <TableCell className='py-4'>{data.NetworkSettings.Networks[item].Gateway}</TableCell>
                                            <TableCell
                                                align='right'
                                                className='py-4'
                                            >
                                                <Can
                                                    I={'update'}
                                                    a={'Container'}
                                                >
                                                    <AlertDialog
                                                        message='This action cannot be undone, are you sure?'
                                                        okText='Leave'
                                                        title={`Leave this netwrok?`}
                                                        trigger={
                                                            <Button
                                                                color='danger'
                                                                radius='full'
                                                                size='sm'
                                                            >
                                                                Leave network
                                                            </Button>
                                                        }
                                                        onOk={async () => {
                                                            await network.leaveNetworkContainer(data.NetworkSettings.Networks[item].NetworkID);
                                                        }}
                                                    />
                                                </Can>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                backdrop='blur'
                isDismissable={false}
                isOpen={container.isOpen}
                placement='top'
                onOpenChange={container.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => {
                        return (
                            <form onSubmit={container.handleSubmit(container.scaleContainer)}>
                                <ModalHeader className='flex flex-col gap-1'>Scalling container</ModalHeader>
                                <ModalBody>
                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={container.control}
                                            name='totalSupport'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    description='Total duplicate container'
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Total Support'
                                                    placeholder='Enter total support'
                                                    type='number'
                                                    value={`${field.value}`}
                                                    onChange={(e) => {
                                                        field.onChange(Number(e.target.value));
                                                    }}
                                                />
                                            )}
                                            rules={{
                                                required: 'Total support is required',
                                                validate: (value) => {
                                                    if (value < 0 || value === 0) {
                                                        return 'Total support must be greater than 0';
                                                    }

                                                    return true;
                                                },
                                            }}
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color='danger'
                                        isDisabled={container.formState.isSubmitting}
                                        variant='light'
                                        onPress={onClose}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        color='primary'
                                        isLoading={container.formState.isSubmitting}
                                        type='submit'
                                    >
                                        Save
                                    </Button>
                                </ModalFooter>
                            </form>
                        );
                    }}
                </ModalContent>
            </Modal>
        </>
    );
};

export default Detail;
