import {useAsyncList} from '@react-stately/data';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';
import {useState} from 'react';

import {getAllContainerAction} from '../_action/action';

import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useLogs = () => {
    const [meta, setMeta] = useState<PageNumberPagination & PageNumberCounters>({
        pageCount: 1,
        totalCount: 1,
        currentPage: 1,
        isFirstPage: true,
        isLastPage: true,
        previousPage: null,
        nextPage: null,
    });

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;

            const {page, descriptor} = asyncListDescriptor(sortDescriptor);

            const result = await getAllContainerAction();

            console.log(descriptor);

            const data = (result.data ?? []).filter((item) => {
                if (!filterText || filterText === '') return true;

                return item.Names[0]?.toLowerCase().includes(filterText.toLowerCase());
            });

            // sort the data by status
            data.sort((a, b) => {
                if (descriptor.state === 'asc') {
                    if (a.Status < b.Status) return -1;
                    if (a.Status > b.Status) return 1;

                    return 0;
                } else if (descriptor.state === 'desc') {
                    if (a.Status < b.Status) return 1;
                    if (a.Status > b.Status) return -1;

                    return 0;
                } else {
                    return 0;
                }
            });

            data.sort((a, b) => {
                if (descriptor.name === 'asc') {
                    if (a.Names[0] < b.Names[0]) return -1;
                    if (a.Names[0] > b.Names[0]) return 1;

                    return 0;
                } else if (descriptor.name === 'desc') {
                    if (a.Names[0] < b.Names[0]) return 1;
                    if (a.Names[0] > b.Names[0]) return -1;

                    return 0;
                } else {
                    return 0;
                }
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

    return {
        list,
        meta,
    };
};

export default useLogs;
