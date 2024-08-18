"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { columns } from "./column";
import exportToExcel from "@/lib/exportToExcel";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { LuFileSpreadsheet } from "react-icons/lu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PiSpinner } from "react-icons/pi";
import { Employee } from "@/app/types";
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";

export default function Dashboard() {

  const [formData, setFormData] = useState({
    employeeNumber: "",
    name: ""
  });

  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");


  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const fetchEmployeeData = async () => {
    try {
      const res = await axios.get("/api/employee");
      if (res.status === 200) {
        setData(res.data);
      }
      else if(res.status === 401){
        window.location.href = "/login";
      }
    } catch (e: any) {
      if(e.response.status === 401){
        window.location.href = "/login";
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const excel_columns = [
    { header: "Employee Number", key: "employeeNumber", width: 30 },
    { header: "Name", key: "name", width: 30 },
  ];
  const exportExcel = () => {
    exportToExcel(data, excel_columns, "Employee Report");
  };

  const saveUserData = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/register", formData);
      if (res.status === 201) {
        setFormData({
          employeeNumber: "",
          name: ""
        });
        setSuccess(true);
        window.location.reload();
        setTimeout(() => {
        setSuccess(false);
      }, 5000);
      } 
      else if(res.status === 400){
        setSaveError(true)
        setSaveErrorMessage(res.data.message);
        setTimeout(() => {
          setSaveError(false);
        }, 5000);
      }
    } catch (e: any) {
      setSaveError(true)
      setSaveErrorMessage(e.response.data.message);
      setTimeout(() => {
        setSaveError(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
   
    fetchEmployeeData();
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex flex-col lg:gap-4 lg:py-4 lg:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 lg:px-6 lg:py-0 lg:gap-8">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Employee Payroll
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Register Employee</SheetTitle>
                    <SheetDescription>
                      Add a new employee to the system
                    </SheetDescription>
                  </SheetHeader>
                  {
                    saveError &&(
                      <div className="border border-red-100 p-2 w-full mx-auto rounded-md bg-red-50/50 mt-2 text-red-700 flex items-center gap-4 justify-center ">
                      <MdErrorOutline />
                      <span>
                        {saveErrorMessage}
                      </span>
                    </div>

                    )
                  }
                  {
                    success && (
                      <div className="border border-emerald-100 p-2 w-full mx-auto rounded-md bg-emerald-50/50 mt-2 text-emerald-700 flex items-center gap-4 justify-center ">
                      <BsCheck2Circle />
                        <p>
                          Employee added successfully
                        </p>
                      </div>

                    )
                  }
                  <form onSubmit={saveUserData}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-left">
                          Employee
                        </Label>
                        <Input
                          id="employeeNumber"
                          placeholder="EN001"
                          className="col-span-3"
                          value={formData.employeeNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="name" className="text-left">
                          Payroll Period
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className="col-span-3"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-left">
                          Formula
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className="col-span-3"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-space-between items-center gap-4 ">
                        <Label htmlFor="remark" className="">
                          Remark
                        </Label>
                        <Textarea  className="w-full"/>
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit" onClick={saveUserData} disabled={loading}>
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <PiSpinner className="h-4 w-4 mr-2 animate-spin text-white" />
                              <p>Loading</p>
                            </div>
                          ) : (
                            <p>Save</p>
                          )}
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Card className="lg:col-span-1 col-span-2 w-screen lg:w-full">
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>List of employee records</CardDescription>
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
