"use client";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button";

export const remarkColumns: ColumnDef<any>[] = [  
  {
    accessorKey: "employeeNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Employee Number
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },

    cell: ({ row }) => <div className="text-left ">{row.original.employee?.user?.employeeNumber}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Date
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },

    cell: ({ row }) => <div className="text-left ">{new Date(row.getValue("date")).toDateString()}</div>,
  },
  {
    accessorKey: "remark",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Remarks
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("remark")}</div>,
  }

];
