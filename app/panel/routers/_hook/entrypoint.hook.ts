import {useAsyncList} from '@react-stately/data';

import {getAllEntryPointAction} from '../_action/action';

const useEntryPoint = () => {
    const list = useAsyncList<{name: string}>({
        async load({filterText}) {
            const result = await getAllEntryPointAction();

            return {items: result.data ?? []};
        },
    });

    return {
        list,
    };
};

export default useEntryPoint;
