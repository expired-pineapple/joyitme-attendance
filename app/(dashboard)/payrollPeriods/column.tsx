"use client";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";



export const columns: ColumnDef<any>[] = [  
  {
    accessorKey: "startDate",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Start Date
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{new Date(row.getValue("startDate")).toDateString()}</div>,
  },
  {
    accessorKey: "endDate",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        End Date
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{new Date(row.getValue("endDate")).toDateString()}</div>,
  },
  {
    accessorKey: "location",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Location
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => 
    {
      return (
    <div className="text-left">{row.getValue("location")}</div>)}
  },
  {
    accessorKey: "budget",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Budget
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => 
    {
      return (
    <div className="text-left">{row.getValue("budget")}</div>)}
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payrollPeriod = row.original;        
      return (
      <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <Link href={`/payrolls/${row.original.id}`} passHref>
          <DropdownMenuItem >Payroll Details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem >Edit Payroll Period</DropdownMenuItem>
            <DropdownMenuItem>
                Delete Employee
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>  
      </>
      )
    },
  },
];
