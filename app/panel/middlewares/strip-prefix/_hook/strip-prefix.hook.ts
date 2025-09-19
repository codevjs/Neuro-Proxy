import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';

import {createMiddlewareAction, deleteMiddlewareAction, getAllMiddlewareAction, updateMiddlewareAction} from '../_action/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';
import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useStripPrefixMiddleware = () => {
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

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{isEdit: boolean; name: string; prefixes: string}>({
        defaultValues: {
            isEdit: false,
            name: '',
            prefixes: '',
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page} = asyncListDescriptor(sortDescriptor);

            const result = await getAllMiddlewareAction();

            const data = (result.data ?? []).filter((item) => {
                if (!filterText || filterText === '') return true;

                return item.name.toLowerCase().includes(filterText.toLowerCase());
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

    const onSubmit: SubmitHandler<{isEdit: boolean; name: string; prefixes: string}> = useCallback(
        async (data) => {
            try {
                const result = data.isEdit
                    ? await updateMiddlewareAction(data.name, {prefixes: data.prefixes})
                    : await createMiddlewareAction(data.name, {prefixes: data.prefixes});

                if (!result.success) throw new Error(result.message);

                list.reload();

                toastSuccess('Middleware created')(result.message);

                reset();

                onClose();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to create middleware')(error.message);
            }
        },
        [list, reset, onClose]
    );

    const onDelete = useCallback(async (name: string) => {
        try {
            const result = await deleteMiddlewareAction(name);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('Middleware deleted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to delete middleware')(error.message);
        }
    }, []);

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
        reset,
        resetField,
        onOpen,
        onClose,
        onOpenChange,
        onSubmit,
        onDelete,
    };
};

export default useStripPrefixMiddleware;
