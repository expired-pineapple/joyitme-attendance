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
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./column";

interface description{
  startDate: string;
  endDate: string;
  budget: string;
  locationName: string;
}


export default function Dashboard() {

  const routeParam = useParams<{ id: string }>();



const [data, setData] = useState<any[]>([]);
const  [description, setDescription] = useState<description>();
const [fetchLoading, setFetchLoading] = useState(true);
const [error, setError] = useState(false);
const [success, setSuccess] = useState(false);


const fetchPayrollData = async () => {
  try {
    const res = await axios.get(`/api/payrolls/${routeParam?.id}`);
    if (res.status === 200) {
      setSuccess(true);
      setData(res.data.employees);
      setDescription({
        startDate: res.data.startDate,
        endDate: res.data.endDate,
        budget: res.data.budget,
        locationName: res.data.locationName,
      });
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

useEffect(() => { 
  fetchPayrollData();
}, []);




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
                List of payroll records {
                  !fetchLoading ? (
                    <span>
                    From { description?.startDate } to { description?.endDate }
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

        </main>
      </div>
    </div>
  );
}
        