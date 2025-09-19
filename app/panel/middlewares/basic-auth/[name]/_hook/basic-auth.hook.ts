import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {useCopyToClipboard} from 'usehooks-ts';
import {PageNumberCounters, PageNumberPagination} from 'prisma-extension-pagination/dist/types';

import {createBasicAuthAction, deleteBasicAuthAction, getAllBasicAuthAction} from '../_action/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';
import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useBasicAuth = (middlewareName: string) => {
    const [meta, setMeta] = useState<PageNumberPagination & PageNumberCounters>({
        pageCount: 1,
        totalCount: 1,
        currentPage: 1,
        isFirstPage: true,
        isLastPage: true,
        previousPage: null,
        nextPage: null,
    });

    const [editLoading, setEditLoading] = useState<boolean>(false);

    const [copiedText, copy] = useCopyToClipboard();

    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{username: string; password: string}>({
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page} = asyncListDescriptor(sortDescriptor);

            const result = await getAllBasicAuthAction(middlewareName);

            const data = (result.data ?? []).filter((item) => {
                if (!filterText || filterText === '') return true;

                return item.user.toLowerCase().includes(filterText.toLowerCase());
            });

            // make the data paginated by size
            const items = data.slice((page - 1) * size, page * size);

            // set meta
            setMeta({
                pageCount: Math.ceil(data.length / size),
                totalCount: data.length,
                currentPage: page,
                isFirstPage: page === 1,
                isLastPage: page === Math.ceil(data.length / size),
                previousPage: page - 1,
                nextPage: page + 1,
            });

            return {
                items,
            };
        },
    });

    const onSubmit: SubmitHandler<{username: string; password: string}> = useCallback(
        async (data) => {
            try {
                const result = await createBasicAuthAction(middlewareName, data);

                if (!result.success) throw new Error(result.message);

                list.reload();

                toastSuccess('Token created')(result.message);

                reset();

                onClose();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to create user')(error.message);
            }
        },
        [list, reset, onClose]
    );

    const onDelete = useCallback(async (user: string) => {
        try {
            const result = await deleteBasicAuthAction(middlewareName, user);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('User deleted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to delete token')(error.message);
        }
    }, []);

    const handleCopy = useCallback(
        (text: string) => () => {
            copy(text)
                .then(() => {
                    toastSuccess('Copied!')(text);
                })
                .catch((error) => {
                    console.error('Failed to copy!', error);
                });
        },
        [copy]
    );

    return {
        list,
        meta,
        control,
        formState,
        isOpen,
        editLoading,
        copiedText,
        setEditLoading,
        setValue,
        handleSubmit,
        handleCopy,
        reset,
        resetField,
        onOpen,
        onClose,
        onOpenChange,
        onSubmit,
        onDelete,
    };
};

export default useBasicAuth;
