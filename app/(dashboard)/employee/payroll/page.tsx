"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Payroll } from "@/app/types";

interface description{
  startDate: string;
  endDate: string;
  budget: string;
  locationName: string;
}


export default function EmployeePayroll() {

const [data, setData] = useState<any[]>([]);
const [fetchLoading, setFetchLoading] = useState(true);
const [success, setSuccess] = useState(false);



const fetchPayrollData = async () => {
  try {
    const res = await axios.get(`/api/employee/payroll`);
    if (res.status === 200) {
      setSuccess(true);
      setData(res.data.table);
      setFetchLoading(false);
      setTimeout(() => {
      setSuccess(false);
    }, 5000);
    } 
   
  } catch (e: any) {
   
  } finally {
    setFetchLoading(false);
  }
}
useEffect(() => { 
  fetchPayrollData();
}, []);


const columns: ColumnDef<Payroll>[] = [  

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


];




return (
  <div className="flex h-screen w-full flex-col">
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">

             <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>
                Payroll
                
                </CardTitle>
              <CardDescription>
                List of payroll records 
                </CardDescription>
            </CardHeader>
            <CardContent>

              <DataTable
                columns={columns}
                data={[...data]}
                loading={fetchLoading}
              />
           
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
        