import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  // Pagination,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filter?: boolean;
  onRow?: (value: any) => void;
  width?: number;
  isColumnsTrue?: boolean;
}

export function DataTable<TData, TValue>({
  data,
  columns,
  filter,
  onRow,
  isColumnsTrue,
  width,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const handlePageChange = (selectedPageIndex: number) => {
    table.setPageIndex(selectedPageIndex);
  };
  return (
    <div className={`w-full overflow-x-auto relative py-1`}>
      {filter && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter product..."
            value={
              (table.getColumn("product")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("product")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="absolute z-20 top-5 right-5">
        {!isColumnsTrue &&
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MixerHorizontalIcon className="h-6 w-6 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="!w-[200px]">
              <DropdownMenuLabel>Chọn cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column: any) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column: any) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column?.columnDef?.header}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      </div>
      <div className={`rounded-md border  overflow-x-auto max-w-full max-lg:w-[900px]`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-[14px]" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel().rows?.length ? (
              table?.getRowModel().rows.map((row: any) => (
                <TableRow
                  className="cursor-pointer"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onDoubleClick={() => {
                    if (onRow) {
                      onRow(row["original"]["id"]);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className="!py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu .
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
      {/* <div className="flex items-center relative justify-end space-x-2 py-6 w-full">
        <div className="fixed right-0 mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(table.getState().pagination.pageIndex - 1)
                  }
                  className={
                    table.getState().pagination.pageIndex === 0
                      ? "disabled"
                      : ""
                  }
                />
              </PaginationItem>
              {[0, 1, 2].map((item: number) => (
                <PaginationItem
                  onClick={() => handlePageChange(item)}
                  key={item}
                >
                  <PaginationLink
                    isActive={item === table.getState().pagination.pageIndex}
                  >
                    {item + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(table.getState().pagination.pageIndex + 1)
                  }
                  className={
                    table.getState().pagination.pageIndex ===
                    table.getPageCount() - 1
                      ? "disabled"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div> */}
    </div>
  );
}
