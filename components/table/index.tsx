import {flexRender, Table as TanStackTableTypes} from '@tanstack/react-table';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';

import Loading from '@/components/loading';

type TablePropsTypes<D extends object = object> = {
    table: TanStackTableTypes<D>;
    isLoading?: boolean;
    isError?: boolean;
};

export default function ReactTable<D extends object>({table, isLoading, isError}: TablePropsTypes<D>) {
    return (
        <Table
            isCompact
            isHeaderSticky
            isStriped
            border={0}
            radius='lg'
            shadow='sm'
        >
            <TableHeader
                columns={table
                    .getAllColumns()
                    .filter((c) => c.getCanSort())
                    .map((c) => ({key: c.id, label: c.columnDef.header as any}))}
            >
                {(column) => (
                    <TableColumn
                        key={column.key}
                        allowsSorting
                    >
                        {flexRender(table.getColumn(column.key)!.columnDef.header, {} as any)}
                    </TableColumn>
                )}
            </TableHeader>

            <TableBody
                emptyContent={isError ? 'Error while fetching data. Please check your connection' : 'No rows to display.'}
                isLoading={isLoading}
                loadingContent={<Loading />}
            >
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell, index) => (
                            <TableCell
                                key={cell.id}
                                className='flex-start py-4'
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
