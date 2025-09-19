import {zodResolver} from '@hookform/resolvers/zod';
import {useDisclosure} from '@heroui/modal';
import {useAsyncList} from '@react-stately/data';
import {useCallback, useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {PageNumberCounters, PageNumberPagination} from 'prisma-extension-pagination/dist/types';

import {createPermissionAction, deletePermissionAction, getAllPermissionAction, updatePermissionAction} from '../_action/action';

import {permissionSchema, PermissionType} from '@/repositories/database/panel/user-management/permission/schema.zod';
import {toastError} from '@/helpers/toast.helper';

const usePermission = () => {
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

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<PermissionType>({
        resolver: zodResolver(permissionSchema),
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            let page = 1;

            if (!isNaN(Number(sortDescriptor?.column))) page = sortDescriptor ? Number(sortDescriptor.column) : 1;

            const result = await getAllPermissionAction(
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
                          group: 'asc',
                      }
            );

            if (!result.success || !result.data) throw new Error(result.message);

            setMeta(result.data.meta);

            return {items: result.data.data};
        },
    });

    const onSubmit: SubmitHandler<PermissionType> = useCallback(
        async (data) => {
            try {
                const result = data.id
                    ? await updatePermissionAction(data.id, {
                          ...data,
                          group: data.group.toUpperCase(),
                          name: data.name.toUpperCase(),
                      })
                    : await createPermissionAction({
                          ...data,
                          group: data.group.toUpperCase(),
                          name: data.name.toUpperCase(),
                      });

                if (!result.success) throw new Error(result.message);

                reset();

                onClose();

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to save permission')(error.message);
            }
        },
        [reset, onClose, list]
    );

    const onDelete = useCallback(
        async (id: string) => {
            try {
                const result = await deletePermissionAction(id);

                if (!result.success) throw new Error(result.message);

                list.reload();
            } catch (error) {
                if (error instanceof Error) toastError('Failed to delete permission')(error.message);
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

export default usePermission;
