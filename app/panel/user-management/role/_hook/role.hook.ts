import {zodResolver} from '@hookform/resolvers/zod';
import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {PageNumberCounters, PageNumberPagination} from 'prisma-extension-pagination/dist/types';

import {createRoleAction, deleteRoleAction, getAllRoleAction, updateRoleAction} from '../_action/action';

import {roleSchema, RoleType} from '@/repositories/database/panel/user-management/role/schema.zod';
import {toastError} from '@/helpers/toast.helper';

const useRole = () => {
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

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<RoleType>({
        resolver: zodResolver(roleSchema),
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            let page = 1;

            if (!isNaN(Number(sortDescriptor?.column))) page = sortDescriptor ? Number(sortDescriptor.column) : 1;

            const result = await getAllRoleAction(
                page,
                15,
                {
                    name: {
                        contains: filterText,
                    },
                },
                sortDescriptor && isNaN(Number(sortDescriptor.column))
                    ? {
                          [sortDescriptor.column as string]: sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
                      }
                    : {
                          createdAt: 'desc',
                      }
            );

            if (!result.success || !result.data) throw new Error(result.message);

            setMeta(result.data.meta);

            return {items: result.data.data};
        },
    });

    const onSubmit: SubmitHandler<RoleType> = useCallback(
        async (data) => {
            try {
                const result = data.id
                    ? await updateRoleAction(data.id, {
                          ...data,
                          name: data.name.toLowerCase(),
                      })
                    : await createRoleAction({
                          ...data,
                          name: data.name.toLowerCase(),
                      });

                if (!result.success) throw new Error(result.message);

                reset();

                onClose();

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to save role')(error.message);
            }
        },
        [reset, onClose, list]
    );

    const onDelete = useCallback(
        async (id: string) => {
            try {
                const result = await deleteRoleAction(id);

                if (!result.success) throw new Error(result.message);

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to delete role')(error.message);
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

export default useRole;
