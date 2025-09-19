import {useAsyncList} from '@react-stately/data';
import {useDebounceCallback} from 'usehooks-ts';

import {getAllLogsAction} from '../_action/action';

const useLogs = () => {
    const list = useAsyncList({
        async load({filterText}) {
            const result = await getAllLogsAction(filterText);

            return {items: result.data ?? []};
        },
    });

    const debounce = useDebounceCallback(list.setFilterText, 1000);

    return {
        list,
        debounce,
    };
};

export default useLogs;
