"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./column";
import {remarkColumns} from './remarkColumn'
import exportToExcel from "@/lib/exportToExcel";
import { LuFileSpreadsheet } from "react-icons/lu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface description{
  startDate: string;
  endDate: string;
  budget: string;
  locationName: string;
}


export default function Payroll() {

  const routeParam = useParams<{ id: string }>();



const [data, setData] = useState<any[]>([]);
const  [description, setDescription] = useState<description>();
const [fetchLoading, setFetchLoading] = useState(true);
const [error, setError] = useState(false);
const [success, setSuccess] = useState(false);
const [remark, setRemark] = useState<any[]>([]);


const fetchPayrollData = async () => {
  try {
    const res = await axios.get(`/api/payrolls/${routeParam?.id}`);
    if (res.status === 200) {
      console.log(res.data)
      setSuccess(true);
      setData(res.data.payroll.employees);
      setDescription({
        startDate: res.data.payroll.startDate,
        endDate: res.data.payroll.endDate,
        budget: res.data.payroll.budget,
        locationName: res.data.payroll.locationName,
      });
      setRemark(res.data.attendances)
      setFetchLoading(false);
      setTimeout(() => {
      setSuccess(false);
    }, 5000);
    } 
   
  } catch (e: any) {
    // setError(true)
    // // setSaveErrorMessage(e.response.data.message);
    // setTimeout(() => {
    //   setError(false);
    // }, 5000);
  } finally {
    setFetchLoading(false);
  }
}

const excel_columns = [
  { header: "Employee Number", key: "employeeNumber", width: 30 },
  { header: "Overtime Hours", key: "name", width: 30 },
  { header: "Projected Hour", key: "projectedHour", width: 30 },
  { header: "Overtime Pay", key: "overtimePay", width: 30 },
  { header: "Total Worked Hours", key: "totalWorkedHours", width: 30 },
  { header: "Earnings", key: "earnings", width: 30 },
];

const exportExcel = () => {
  exportToExcel(data, excel_columns, "Employee Report");
};

useEffect(() => { 
  fetchPayrollData();
}, []);




return (

  <div className="flex h-screen w-full flex-col">
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="ml-auto flex items-center gap-2">
         <Button
              
                variant="outline"
                className="gap-1"
                onClick={exportExcel}
              >
                <LuFileSpreadsheet className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              </div>
              <Tabs defaultValue="payroll" className="" >
  <TabsList className="grid w-[450px] grid-cols-2">
    <TabsTrigger value="payroll">Payroll</TabsTrigger>
    <TabsTrigger value="remark">Remark</TabsTrigger>
  </TabsList>
  <TabsContent value="payroll">
          <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>
                Payroll
                
                </CardTitle>
              <CardDescription>
                List of payroll records {
                  !fetchLoading ? (
                    <span>
                    from { description?.startDate } to { description?.endDate }
                  </span>
                  ) : <></>
                }
               

                </CardDescription>
            </CardHeader>
            <CardContent>

              <DataTable
                columns={columns}
                data={[...data]}
                loading={fetchLoading}
                search="employeeNumber"
              />
           
            </CardContent>
          </Card>
          </TabsContent>
    <TabsContent value="remark">
    <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>
               Remarks
                
                </CardTitle>
              <CardDescription>
                List of remarks saved {
                  !fetchLoading ? (
                    <span>
                    from { description?.startDate } to { description?.endDate }
                  </span>
                  ) : <></>
                }
               

                </CardDescription>
            </CardHeader>
            <CardContent>

              <DataTable
                columns={remarkColumns}
                data={[...remark]}
                loading={fetchLoading}
                search="employeeNumber"
              />
           
            </CardContent>
          </Card>
    </TabsContent>
    </Tabs>
        </main>
      </div>
    </div>

  );
}
        