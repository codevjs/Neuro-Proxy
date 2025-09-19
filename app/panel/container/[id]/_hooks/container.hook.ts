import {useRouter} from '@bprogress/next';
import {useForm} from 'react-hook-form';
import {useDisclosure} from '@heroui/modal';

import {restartContainerAction, scaleContainerAction, startContainerAction, stopContainerAction, stopScaleContainerAction} from '../_actions/action';

import {toastError, toastSuccess} from '@/helpers/toast.helper';

const useContainer = (containerId: string) => {
    const router = useRouter();

    const {control, formState, reset, handleSubmit} = useForm<{totalSupport: number}>({
        defaultValues: {
            totalSupport: 0,
        },
    });

    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

    const startContainer = async () => {
        try {
            const result = await startContainerAction(containerId);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            toastSuccess('Container started')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to start container')(error.message);
        }
    };

    const stopContainer = async () => {
        try {
            const result = await stopContainerAction(containerId);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            toastSuccess('Container stopped')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to stop container')(error.message);
        }
    };

    const restartContainer = async () => {
        try {
            const result = await restartContainerAction(containerId);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            toastSuccess('Container restarted')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to restart container')(error.message);
        }
    };

    const scaleContainer = async (data: {totalSupport: number}) => {
        try {
            const result = await scaleContainerAction(containerId, {totalSupport: data.totalSupport});

            if (!result.success) throw new Error(result.message);

            router.refresh();

            onClose();

            reset();

            toastSuccess('Container scaled')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to scale container')(error.message);
        }
    };

    const stopScaleContainer = async (containerId: string[]) => {
        try {
            const result = await stopScaleContainerAction(containerId);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            toastSuccess('Container stopped')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to stop scale container')(error.message);
        }
    };

    return {
        control,
        formState,
        isOpen,
        onOpen,
        onClose,
        onOpenChange,
        reset,
        handleSubmit,
        restartContainer,
        stopContainer,
        startContainer,
        scaleContainer,
        stopScaleContainer,
    };
};

export default useContainer;
