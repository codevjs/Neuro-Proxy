import {useAsyncList} from '@react-stately/data';
import {useDisclosure} from '@heroui/modal';
import {SubmitHandler, useForm} from 'react-hook-form';
import {useCallback, useState} from 'react';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';

import {createRouterAction, deleteRouterAction, getAllRouterAction, updateRouterAction} from '../_action/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';
import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useRouters = () => {
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
        isEdit: boolean;
        name: string;
        rule: string;
        service: string;
        middlewares: string[];
        entrypoints: string[];
    }>({
        defaultValues: {
            isEdit: false,
            name: '',
            rule: '',
            service: '',
            middlewares: [],
            entrypoints: [],
        },
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page} = asyncListDescriptor(sortDescriptor);

            const result = await getAllRouterAction();

            const data = (result.data ?? [])
                .filter((item) => !item.name.includes('kalla_proxy'))
                .filter((item) => {
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

    const onSubmit: SubmitHandler<{isEdit: boolean; name: string; rule: string; service: string; middlewares: string[]; entrypoints: string[]}> =
        useCallback(
            async (data) => {
                try {
                    const result = data.isEdit
                        ? await updateRouterAction(data.name, {
                              rule: data.rule,
                              service: data.service,
                              middlewares: data.middlewares,
                              entryPoints: data.entrypoints,
                          })
                        : await createRouterAction(data.name, {
                              rule: data.rule,
                              service: data.service,
                              middlewares: data.middlewares,
                              entryPoints: data.entrypoints,
                          });

                    if (!result.success) throw new Error(result.message);

                    list.reload();

                    toastSuccess(data.isEdit ? 'Router updated' : 'Rotuer created')(result.message);

                    reset();

                    onClose();
                } catch (error) {
                    if (error instanceof Error) toastError('Failed to create router')(error.message);
                }
            },
            [list, reset, onClose]
        );

    const onDelete = useCallback(async (name: string) => {
        try {
            const result = await deleteRouterAction(name);

            if (!result.success) throw new Error(result.message);

            list.reload();

            toastSuccess('Router deleted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to delete router')(error.message);
        }
    }, []);

    return {
        list,
        meta,
        control,
        formState,
        isOpen,
        onOpen,
        onClose,
        onOpenChange,
        setValue,
        handleSubmit,
        reset,
        resetField,
        onSubmit,
        onDelete,
    };
};

export default useRouters;
