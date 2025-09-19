import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {PageNumberCounters, PageNumberPagination} from 'prisma-extension-pagination/dist/types';

import {deleteUserAction, getAllUserAction, updateUserAction, createUserAction} from '../_action/action';

import {toastError} from '@/helpers/toast.helper';

const useUser = () => {
    const [meta, setMeta] = useState<PageNumberPagination & PageNumberCounters>({
        pageCount: 1,
        totalCount: 1,
        currentPage: 1,
        isFirstPage: true,
        isLastPage: true,
        previousPage: null,
        nextPage: null,
    });

    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{
        id?: string;
        name: string;
        email: string;
        role: string;
        password?: string;
        company?: string;
    }>({
        defaultValues: {
            id: undefined,
            name: '',
            email: '',
            role: '',
            password: undefined,
            company: undefined,
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            let page = 1;

            if (!isNaN(Number(sortDescriptor?.column))) page = sortDescriptor ? Number(sortDescriptor.column) : 1;

            const result = await getAllUserAction(
                page,
                15,
                {
                    name: {
                        contains: filterText,
                    },
                    role: {
                        isNot: null,
                    },
                },
                sortDescriptor && isNaN(Number(sortDescriptor.column))
                    ? {
                          [sortDescriptor.column as string]: sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
                      }
                    : {
                          name: 'asc',
                      }
            );

            if (!result.success || !result.data) throw new Error(result.message);

            setMeta(result.data.meta);

            return {items: result.data.data};
        },
    });

    const onSubmit: SubmitHandler<{id?: string; name: string; email: string; role: string; password?: string; company?: string}> = useCallback(
        async (data) => {
            try {
                const result = data.id ? await updateUserAction(data.id, data) : await createUserAction({...data, password: data.password ?? ''});

                if (!result.success) throw new Error(result.message);

                reset();

                onClose();

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to save user')(error.message);
            }
        },
        [reset, onClose, list]
    );

    const onDelete = useCallback(
        async (id: string) => {
            try {
                const result = await deleteUserAction(id);

                if (!result.success) throw new Error(result.message);

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to delete user')(error.message);
            }
        },
        [list]
    );

    return {
        list,
        control,
        formState,
        isOpen,
        meta,
        onDelete,
        onSubmit,
        setValue,
        handleSubmit,
        reset,
        resetField,
        onOpen,
        onClose,
        onOpenChange,
    };
};

export default useUser;
