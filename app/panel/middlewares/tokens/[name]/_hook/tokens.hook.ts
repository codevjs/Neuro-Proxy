import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';

import {createTokenAction, deleteTokenAction, getAllTokenAction} from '../_action/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';
import {copyToClipboard} from '@/helpers/clipboard.helper';
import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useTokens = (middlewareName: string) => {
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

    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{token: string; name?: string}>({
        defaultValues: {
            token: '',
            name: '',
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page} = asyncListDescriptor(sortDescriptor);

            const result = await getAllTokenAction(middlewareName);

            const data = (result.data ?? []).filter((item) => {
                if (!filterText || filterText === '') return true;

                return item.token.toLowerCase().includes(filterText.toLowerCase());
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

    const onSubmit: SubmitHandler<{token: string; name?: string}> = useCallback(
        async (data) => {
            try {
                const result = await createTokenAction(middlewareName, data.token, data.name);

                if (!result.success) throw new Error(result.message);

                list.reload();

                toastSuccess('Token created')(result.message);

                reset();

                onClose();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to create token')(error.message);
            }
        },
        [list, reset, onClose]
    );

    const onGenerate = useCallback(async () => {
        try {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = '';
            const array = new Uint8Array(64);

            crypto.getRandomValues(array);

            for (let i = 0; i < 64; i++) {
                token += characters[array[i] % characters.length];
            }

            console.log(token);

            const result = await createTokenAction(middlewareName, token);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('Token created')('New token generated successfully');
        } catch (error) {
            if (error instanceof Error) toastError('Failed to create token')(error.message);
        }
    }, []);

    const onDelete = useCallback(async (token: string) => {
        try {
            const result = await deleteTokenAction(middlewareName, token);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('Token deleted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to delete token')(error.message);
        }
    }, []);

    const handleCopy = useCallback(
        (text: string) => () => {
            copyToClipboard(text, {
                onSuccess: (copiedText) => {
                    toastSuccess('Copied!')(copiedText);
                },
                onError: (error) => {
                    console.error('Failed to copy!', error);
                    toastError('Copy failed')('Unable to copy to clipboard');
                },
            });
        },
        []
    );

    return {
        list,
        meta,
        control,
        formState,
        isOpen,
        editLoading,
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
        onGenerate,
    };
};

export default useTokens;
