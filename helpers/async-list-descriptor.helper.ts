import {SortDescriptor} from '@react-types/shared';

export function asyncListDescriptor<D extends Record<string, 'asc' | 'desc'>, F>(sortDescriptor?: SortDescriptor, filter: string = '{}') {
    let page = 1;

    if (!isNaN(Number(sortDescriptor?.column))) page = Number(sortDescriptor?.column ?? 1);

    return {
        page,
        descriptor: (sortDescriptor && isNaN(Number(sortDescriptor.column))
            ? {
                  [sortDescriptor.column as string]: sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
              }
            : {
                  createdAt: 'desc',
              }) as D,
        filter: JSON.parse(filter) as F,
    };
}

export function asyncListShortDescriptor<T>(sortDescriptor?: SortDescriptor, defaultShortDescriptor?: T): {page: number; short: T} {
    let page = 1;

    if (!isNaN(Number(sortDescriptor?.column))) page = Number(sortDescriptor?.column ?? 1);

    return {
        page,
        short: (sortDescriptor && isNaN(Number(sortDescriptor.column))
            ? {
                  [sortDescriptor.column as string]: sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
              }
            : (defaultShortDescriptor ?? {
                  createdAt: 'desc',
              })) as T,
    };
}

export function objectToJsonString<T>(obj: T) {
    return JSON.stringify(obj);
}
