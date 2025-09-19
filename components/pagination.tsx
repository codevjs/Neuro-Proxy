import {Pagination as NextPagination} from '@heroui/pagination';
import {PageNumberCounters, PageNumberPagination} from 'prisma-extension-pagination/dist/types';
import {FC} from 'react';

interface Props {
    meta: PageNumberPagination & PageNumberCounters;
    limit: number;
    onChange: (page: number) => void;
}

const Pagination: FC<Props> = ({meta, limit, onChange}) => {
    // Calculate start row
    const currentResultCount = meta.currentPage * limit - limit + 1;

    // Calculate and row count
    const endResultCount = meta.currentPage * limit > meta.totalCount ? meta.totalCount : meta.currentPage * limit;

    return (
        <section className='flex w-full items-center justify-between'>
            <span className='text-sm text-default-700'>
                Rows per page {currentResultCount} - {endResultCount} of {meta.totalCount} total rows
            </span>

            <NextPagination
                boundaries={0}
                color='primary'
                dotsJump={1}
                initialPage={meta.currentPage}
                radius='full'
                showControls={true}
                total={meta.pageCount}
                onChange={onChange}
            />
        </section>
    );
};

export default Pagination;
