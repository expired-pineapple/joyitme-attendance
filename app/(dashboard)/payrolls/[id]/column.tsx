"use client";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button";
import { Payroll } from "../../../types";

export const columns: ColumnDef<Payroll>[] = [  
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

    cell: ({ row }) => <div className="text-left ">{row.getValue("employeeNumber")}</div>,
  },
  {
    accessorKey: "overtimeHours",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Overtime Hours
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("overtimeHours")}</div>,
  },
  {
    accessorKey: "projectedHour",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Projected Hour
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("projectedHour")}</div>,
  },
  {
    accessorKey: "overtimePay",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Overtime Earnings
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("overtimePay")}</div>,
  },
  {
    accessorKey: "totalWorkedHours",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Total Worked Hours
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("totalWorkedHours")}</div>,
  },
  {
    accessorKey: "earnings",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Earnings
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("earnings")}</div>,
  },

];
