import {useAsyncList} from '@react-stately/data';
import {PageNumberPagination, PageNumberCounters} from 'prisma-extension-pagination/dist/types';
import {useState, useCallback, useRef, useMemo} from 'react';
import {useDebouncedCallback} from 'use-debounce';

import {getAllServiceAction, getServicesHealthAction} from '../_action/action';

import {asyncListDescriptor} from '@/helpers/async-list-descriptor.helper';

const useServices = () => {
    const [meta, setMeta] = useState<PageNumberPagination & PageNumberCounters>({
        pageCount: 1,
        totalCount: 1,
        currentPage: 1,
        isFirstPage: true,
        isLastPage: true,
        previousPage: null,
        nextPage: null,
    });

    const [healthData, setHealthData] = useState<Record<string, any>>({});
    const [isHealthLoading, setIsHealthLoading] = useState(false);
    const currentFilterRef = useRef('');
    const currentPageRef = useRef(1);

    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const size = 15;
            const {page} = asyncListDescriptor(sortDescriptor);

            // Update refs for health check loading
            currentFilterRef.current = filterText || '';
            currentPageRef.current = page;

            const result = await getAllServiceAction({
                page,
                limit: size,
                search: filterText || '',
                includeHealth: false, // Don't load health data initially
            });

            if (result.success && result.meta) {
                setMeta(result.meta);
            }

            return {
                items: result.data ?? [],
            };
        },
    });

    // Debounced health check function
    const loadHealthData = useDebouncedCallback(async (serviceNames: string[]) => {
        if (serviceNames.length === 0) return;

        setIsHealthLoading(true);
        try {
            const result = await getServicesHealthAction(serviceNames);

            if (result.success) {
                setHealthData((prev) => ({...prev, ...result.data}));
            }
        } catch (error) {
            console.error('Failed to load health data:', error);
        } finally {
            setIsHealthLoading(false);
        }
    }, 500);

    // Load health data when items change
    const loadHealthDataForCurrentItems = useCallback(() => {
        const serviceNames = list.items.map((item: any) => item.name);

        loadHealthData(serviceNames);
    }, [list.items, loadHealthData]);

    // Enhanced items with health data
    const itemsWithHealth = useMemo(() => {
        return list.items.map((item: any) => ({
            ...item,
            health: healthData[item.name] || {status: 'unknown', lastCheck: new Date().toISOString()},
        }));
    }, [list.items, healthData]);

    // Enhanced list object
    const enhancedList = useMemo(
        () => ({
            ...list,
            items: itemsWithHealth,
            loadHealthData: loadHealthDataForCurrentItems,
            isHealthLoading,
        }),
        [list, itemsWithHealth, loadHealthDataForCurrentItems, isHealthLoading]
    );

    return {
        list: enhancedList,
        meta,
    };
};

export default useServices;
