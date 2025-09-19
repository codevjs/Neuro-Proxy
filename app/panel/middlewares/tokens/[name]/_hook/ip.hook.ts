import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';

import {createWhitelistIPAction, deleteWhitelistAction, getAllWhitelistIPAction} from '../_action/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';
import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useWhitelistIP = (middlewareName: string) => {
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

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{ip: string}>({
        defaultValues: {
            ip: '',
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page} = asyncListDescriptor(sortDescriptor);

            const result = await getAllWhitelistIPAction(middlewareName);

            const data = (result.data ?? []).filter((item) => {
                if (!filterText || filterText === '') return true;

                return item.ip.toLowerCase().includes(filterText.toLowerCase());
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

    const onSubmit: SubmitHandler<{ip: string}> = useCallback(
        async (data) => {
            try {
                const result = await createWhitelistIPAction(middlewareName, data.ip);

                if (!result.success) throw new Error(result.message);

                list.reload();

                toastSuccess('IP created')(result.message);

                reset();

                onClose();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to create IP')(error.message);
            }
        },
        [list, reset, onClose]
    );

    const onDelete = useCallback(async (ip: string) => {
        try {
            const result = await deleteWhitelistAction(middlewareName, ip);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('IP deleted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to delete ip')(error.message);
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

export default useWhitelistIP;
