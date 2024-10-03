"use client";
import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CiFilter } from "react-icons/ci";
import Link from "next/link";
import { constants } from "buffer";
import { PiSpinner } from "react-icons/pi";

interface buttonObj {
  name: string;
  url: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: string;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  loading,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // const demo = () =>{
  //   toast({
  //     variant: "destructive",
  //     title: "Uh oh! Something went wrong.",
  //     description: "There was a problem with your request.",
  //   })
  // }
  return (
    <div className="w-full bg-white dark:bg-black p-4 rounded-md mt-4">
      <Input
        placeholder="Search..."
        value={(table.getColumn(`${search}`)?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn(`${search}`)?.setFilterValue(event.target.value)
        }
        className="w-full bg-transparent mb-4"
        id="search"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-transparent hover:bg-transparent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-transparent hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                {loading ? (
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                      <div className="flex items-center justify-center">
                        <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                        <p>Loading...</p>
                      </div>
                  </TableCell>
                ) : (
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data available.
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-transparent font-medium"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-transparent font-medium"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
