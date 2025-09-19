import {useAsyncList} from '@react-stately/data';

import {getAllMiddlewareAction} from '../_action/action';

const useMiddlewares = () => {
    const list = useAsyncList<{name: string}>({
        async load({filterText}) {
            const result = await getAllMiddlewareAction();

            return {
                // ascending sort by name
                items: (result.data ?? []).sort((a, b) => a.name.localeCompare(b.name)),
            };
        },
    });

    return {
        list,
    };
};

export default useMiddlewares;
