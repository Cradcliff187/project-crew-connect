import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  defaultSorting?: {
    columnId: string;
    direction: 'asc' | 'desc';
  };
  searchPlaceholder?: string;
  compact?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  defaultSorting,
  searchPlaceholder = 'Filter...',
  compact = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSorting
      ? [{ id: defaultSorting.columnId, desc: defaultSorting.direction === 'desc' }]
      : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      {filterColumn && (
        <div className="flex items-center py-2">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
            onChange={event => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
            className="max-w-sm h-8 text-sm"
          />
        </div>
      )}
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className={cn(compact ? 'h-8' : '')}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className={cn(compact ? 'py-1 px-2 text-xs' : '')}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(compact ? 'h-7 hover:bg-muted/30' : '')}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={cn(compact ? 'py-1 px-2 text-xs' : '')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className={cn('h-24 text-center', compact ? 'text-xs' : '')}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div
        className={cn(
          'flex items-center justify-between space-x-2 py-2',
          compact ? 'py-1' : 'py-4'
        )}
      >
        <div className={cn('flex-1 text-sm text-muted-foreground', compact ? 'text-xs' : '')}>
          {compact
            ? `${table.getFilteredRowModel().rows.length} rows`
            : `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to 
            ${Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of ${table.getFilteredRowModel().rows.length} entries`}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size={compact ? 'xs' : 'sm'}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <ChevronsLeft className={cn('h-4 w-4', compact ? 'h-3 w-3' : '')} />
          </Button>
          <Button
            variant="outline"
            size={compact ? 'xs' : 'sm'}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <ChevronLeft className={cn('h-4 w-4', compact ? 'h-3 w-3' : '')} />
          </Button>

          {!compact && (
            <span className="flex items-center gap-1 text-sm">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </strong>
            </span>
          )}

          <Button
            variant="outline"
            size={compact ? 'xs' : 'sm'}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <ChevronRight className={cn('h-4 w-4', compact ? 'h-3 w-3' : '')} />
          </Button>
          <Button
            variant="outline"
            size={compact ? 'xs' : 'sm'}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className={compact ? 'h-6 w-6 p-0' : ''}
          >
            <ChevronsRight className={cn('h-4 w-4', compact ? 'h-3 w-3' : '')} />
          </Button>

          {!compact && (
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {compact && (
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-6 w-12 text-xs">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map(pageSize => (
                  <SelectItem key={pageSize} value={pageSize.toString()} className="text-xs py-1">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
