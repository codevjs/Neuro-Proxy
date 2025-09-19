import Dockerode from 'dockerode';
import {useAsyncList} from '@react-stately/data';
import {useRouter} from '@bprogress/next';
import {SubmitHandler, useForm} from 'react-hook-form';

import {getAllNetworkContainerAction, joinNetworkContainerAction, leaveNetworkContainerAction} from '../_actions/action';

import {toastError} from '@/helpers/toast.helper';

const useNetwork = (containerId: string) => {
    const router = useRouter();

    const {control, formState, setValue, handleSubmit, reset, resetField} = useForm<{
        network: string;
    }>({
        defaultValues: {network: ''},
    });

    const list = useAsyncList<Dockerode.NetworkInspectInfo>({
        async load({filterText}) {
            const result = await getAllNetworkContainerAction();

            return {
                // ascending sort by name
                items: result.data ?? [],
            };
        },
    });

    const joinNetworkContainer: SubmitHandler<{network: string}> = async (data) => {
        try {
            const result = await joinNetworkContainerAction(containerId, data.network);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            reset();
        } catch (error) {
            if (error instanceof Error) toastError('Failed to join network')(error.message);
        }
    };

    const leaveNetworkContainer = async (network: string) => {
        try {
            const result = await leaveNetworkContainerAction(containerId, network);

            if (!result.success) throw new Error(result.message);

            router.refresh();

            reset();
        } catch (error) {
            if (error instanceof Error) toastError('Failed to leave network')(error.message);
        }
    };

    return {
        list,
        control,
        formState,
        router,

        joinNetworkContainer,
        leaveNetworkContainer,
        setValue,
        handleSubmit,
        reset,
        resetField,
    };
};

export default useNetwork;
