'use client';

import {PlusIcon, SearchIcon, Sparkles, Trash2, Clipboard, ClipboardX} from 'lucide-react';
import {Input, Textarea} from '@heroui/input';
import {Button} from '@heroui/button';
import {FC, useCallback, useEffect, useState} from 'react';
import {Tooltip} from '@heroui/tooltip';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal';
import {Controller} from 'react-hook-form';

import useTokens from '../_hook/tokens.hook';

import AlertDialog from '@/components/alert-dialog';
import Loading from '@/components/loading';
import {Can} from '@/contexts/casl.context';
import {isClipboardSupported} from '@/helpers/clipboard.helper';
import Pagination from '@/components/pagination';

interface Props {
    name: string;
}

const TableTokens: FC<Props> = ({name}) => {
    const {list, meta, control, formState, isOpen, handleCopy, handleSubmit, reset, onOpen, onOpenChange, onSubmit, onDelete, onGenerate} =
        useTokens(name);

    const [clipboardSupported, setClipboardSupported] = useState(true);

    useEffect(() => {
        setClipboardSupported(isClipboardSupported());
    }, []);

    const renderCell = useCallback(
        (data: {id: string; token: string; name: string | null}, columnKey: React.Key): React.ReactElement => {
            switch (columnKey) {
                case 'token':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm'>{data.token.slice(0, 20)}...................................</p>
                        </div>
                    );
                case 'name':
                    return (
                        <div className='flex flex-col'>
                            <p className='text-bold text-sm'>{data.name}</p>
                        </div>
                    );
                case 'action':
                    return (
                        <div className='flex items-center justify-end gap-2'>
                            <Tooltip content={clipboardSupported ? 'Copy token to clipboard' : 'Copy token (legacy method)'}>
                                <Button
                                    color={clipboardSupported ? 'secondary' : 'warning'}
                                    isIconOnly={true}
                                    variant='light'
                                    onPress={handleCopy(data.token)}
                                >
                                    {clipboardSupported ? <Clipboard size={20} /> : <ClipboardX size={20} />}
                                </Button>
                            </Tooltip>
                            <Can
                                I={'delete'}
                                a={'Token'}
                            >
                                <AlertDialog
                                    message='This action cannot be undone, are you sure?'
                                    okText='Revoke'
                                    title={`Revoke this token?`}
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
                                        await onDelete(data.token);
                                    }}
                                />
                            </Can>
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [clipboardSupported, handleCopy, onDelete]
    );

    return (
        <div className='flex w-full flex-col gap-4'>
            <p className='text-sm text-default-500'>A list of tokens that will accepted for each authentication.</p>

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
                        <AlertDialog
                            message='This action cannot be undone, are you sure?'
                            okText='Generate'
                            title={`Generate access token?`}
                            trigger={
                                <Button
                                    color='secondary'
                                    radius='full'
                                    startContent={<Sparkles size={20} />}
                                    variant='flat'
                                >
                                    Generate new Token
                                </Button>
                            }
                            type='primary'
                            onOk={async () => {
                                await onGenerate();
                            }}
                        />
                    </Can>
                    <Can
                        I={'create'}
                        a={'Token'}
                    >
                        <Tooltip content='Create access token'>
                            <Button
                                color='secondary'
                                radius='full'
                                startContent={<PlusIcon size={20} />}
                                onPress={() => {
                                    reset();
                                    onOpen();
                                }}
                            >
                                Create new token
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
                        {name: 'Access Token', id: 'token'},
                        {name: 'Name', id: 'name'},
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
                    items={list.items as {id: string; token: string; name: string | null}[]}
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
                                    <div className='flex w-full flex-col gap-4'>
                                        <Controller
                                            control={control}
                                            name='token'
                                            render={({field, fieldState}) => (
                                                <Textarea
                                                    {...field}
                                                    description="Note: Access Token must be unique and can't be changed later."
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={true}
                                                    label='Access Token'
                                                    placeholder='Enter Access Token'
                                                    value={field.value.replace(/ /g, '')}
                                                />
                                            )}
                                            rules={{
                                                required: 'Token is required',
                                                validate: (value) => {
                                                    if (value.trim().length === 0) return 'Token is required';

                                                    if (value.trim().length !== 64) return 'Token must be 64 character';

                                                    return true;
                                                },
                                            }}
                                        />
                                        <Controller
                                            control={control}
                                            name='name'
                                            render={({field, fieldState}) => (
                                                <Input
                                                    {...field}
                                                    description='Note: use descriptive name for your access token.'
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={fieldState.invalid}
                                                    isRequired={false}
                                                    label='Access Token Name'
                                                    placeholder='Enter Access Token Name'
                                                    value={field?.value}
                                                />
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

export default TableTokens;
