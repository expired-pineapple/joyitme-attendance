"use client";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";

import { MdOutlineDeleteOutline } from "react-icons/md";
import { TbPencil } from "react-icons/tb";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import axios from "axios";

import { useParams } from "next/navigation";
import { Employee } from "../../../types";


const deleteItem = async (id: string) => {
  try {
    await axios.delete(`/api/inventory/${id}`);
    window.location.reload();
  } catch (error: any) {
    if (error?.response.status === 403) {
      window.location.href = "403";
    }
  }
};




export const columns: ColumnDef<Employee>[] = [  
  {
    accessorKey: "employeeNumber",
    header: () => <div className="text-left">Employee Number</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("employeeNumber")}</div>,
  },
  {
    accessorKey: "name",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Name
          <RxCaretSort className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.getValue("name")}</div>,
  },
];
