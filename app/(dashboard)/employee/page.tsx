"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PiSpinner } from "react-icons/pi";
import { GoEye } from "react-icons/go";
import { GoEyeClosed  } from "react-icons/go";
import exportToExcel from "@/lib/exportToExcel";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LuFileSpreadsheet } from "react-icons/lu";
import { Employee, Location } from "@/app/types";

import { RxCaretSort } from "react-icons/rx";
import { useToast } from "@/components/ui/use-toast";
import EmployeeForm from "@/app/components/employeeForm";
import EmployeeEditForm from "@/app/components/employeeEdit";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function Dashboard() {
  const [data, setData] = useState<Employee[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isManager, setIsManager] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmployeeId, setResetEmployeeId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editFetchLoading, setEditFetchLoading] = useState(true);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { toast } = useToast();




  const [editformData, setEditformData] =  useState({
    user:{
      employeeNumber: "",
      name:"",
      locationId:""
    },
    locationId:"",
    formula:"",
    projectedHour:0
  });
  

  const fetchEmployeeDataByID = async (id: string) => {
    try {
      const res = await axios.get(`/api/employee/${id}`);
      if (res.status === 200) {
        setEditformData(res.data);
      }
      else if(res.status === 401){
        window.location.href = "/login";
      }
    } catch (e: any) {
      
      // if(e.response.status === 401){
      //   window.location.href = "/login";
      // }
    } finally {
      setEditFetchLoading(false);
    }
  };

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
      toast({
        description: "Failed to fetch employee data",
        className:
          "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
      // if(e.status === 401){
      //   window.location.href = "/login";
      // }
    } finally {
      setFetchLoading(false);
    }
  };
  
const deleteEmployee = async () => {
  toast({
    description: (
      <>
        <div className="flex items-center justify-center">
                      <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                      <p>Loading</p>
        </div>
      </>
    ),
    className:
      "top-0 right-0 bg-blue-50 text-blue-900 border-blue-900",
  });

  try {
    if(deleteEmployeeId !=""){
    const res = await axios.delete(`/api/employee/${deleteEmployeeId}`);
    if (res.status === 200) {
      toast({
        description: res.data.message,
        className:
          "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
      });
      fetchEmployeeData();
     
    }}
  } catch (error: any) {
    toast({
      description: "Failed to delete user data",
      className:
        "top-0 right-0 bg-red-50 text-red-900 border-red-900",
    });
  }
}

const resetPassword = async () => {
  toast({
    description: (
      <>
        <div className="flex items-center justify-center">
                      <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                      <p>Loading</p>
        </div>
      </>
    ),
    className:
      "top-0 right-0 bg-blue-50 text-blue-900 border-blue-900",
  });

  try {
    if(resetEmployeeId !=""){
    const res = await axios.post(`/api/auth/admin/resetPassword/${resetEmployeeId}`, {password});
    if (res.status === 200) {
      toast({
        description: res.data.message,
        className:
          "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
      });
      fetchEmployeeData();
      setPassword("")
    }}
  } catch (error: any) {
    toast({
      description: "Failed to reset password",
      className:
        "top-0 right-0 bg-red-50 text-red-900 border-red-900",
    });
    setPassword("")
}
}

const banEmployee = async (id: string) => {
  toast({
    description: (
      <>
        <div className="flex items-center justify-center">
                      <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                      <p>Loading</p>
        </div>
      </>
    ),
    className:
      "top-0 right-0 bg-blue-50 text-blue-900 border-blue-900",
  });

  try {
    const res = await axios.put(`/api/employee/ban/${id}`);
    if (res.status === 200) {
      toast({
        description: res.data.message,
        className:
          "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
      });
      fetchEmployeeData();
     
    }
  } catch (error: any) {
    toast({
      description: "Something went wrong",
      className:
        "top-0 right-0 bg-red-50 text-red-900 border-red-900",
    });
  }
}

const excel_columns = [
    { header: "Employee Number", key: "employeeNumber", width: 30 },
    { header: "Name", key: "name", width: 30 },
    { header: "Location", key: "location", width: 30 },
    { header: "Formula", key: "formula", width: 30 },
    { header: "Projected Hour", key: "projectedHour", width: 30 },

  ];
  const exportExcel = () => {
    exportToExcel(data, excel_columns, "Employee Report");
  };


  const columns: ColumnDef<Employee>[] = [  
    {
      accessorKey: "employeeNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
          Employee Number
            <RxCaretSort className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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
      cell: ({ row }) => <div className="text-left">{row.getValue("location")}</div>,
    },
    {
      accessorKey: "projectedHour",
      header: () => <div className="text-left">Projected Hour</div>,
      cell: ({ row }) => {
        return <span className="text-left font-medium">{row.getValue("projectedHour")}</span>;
      },
    },
    {
      accessorKey: "formula",
      header: () => <div className="text-left">Formula</div>,
      cell: ({ row }) => {
        return <span className="text-left font-medium">{row.getValue("formula")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const banned =  row.original.user.isBanned;
        return <div className= {banned ? "border border-red-500 px-2 py-1 mx-auto rounded-full bg-red-50/50 text-red-700 font-medium text-center text-xs" : "border border-emerald-500 px-2 py-1 mx-auto rounded-full bg-emerald-50/50 text-emerald-700 font-medium text-center  text-xs"}>
          {banned ? "Banned" : "Active"}
        </div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const employee = row.original;        
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
            <DropdownMenuItem onClick={() => {
              fetchEmployeeDataByID(employee.id)
              setEditEmployeeId(employee.id); setSheetOpen(true)} }>Edit Employee</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{
                setDeleteDialogOpen(true)
                setDeleteEmployeeId(employee.id)}}>
                  Delete Employee
              </DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{
                setResetDialogOpen(true)
                setResetEmployeeId(employee.id)}}>
                  Reset Password
              </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>{
            banEmployee(employee.id)
            }}>
              {
                !employee.user.isBanned ? (
                  <span>Ban Employee</span>
                ):
                <span>Unban Employee</span>
              }
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>  
        </>
        )
      },
    },
  
  ];


  useEffect(() => {
    fetchEmployeeData();
  }, []);



  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1"
                onClick={(e) => {
                  exportExcel();
                }}
              >
                <LuFileSpreadsheet className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>

              <EmployeeForm isManager= {isManager} onSuccess={()=>fetchEmployeeData()}/>

            </div>
          </div>
          <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>List of employee records</CardDescription>
            </CardHeader>
              <DataTable
                columns={columns}
                data={[...data]}
                loading={fetchLoading}
                search="employeeNumber"
              />
          </Card>
          <AlertDialog open={deleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete employee data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {setDeleteDialogOpen(false); deleteEmployee()}} className="bg-red-800 px-4 py-2 text-white transition hover:bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
          <AlertDialog open={resetDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle className="mb-2">
                  <p>Reset Employee Password
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                  </p>
                  </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="password">
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`block rounded-md dark:text-white border-0 py-1.5 pl-4 pr-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003949] sm:text-sm sm:leading-6`}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value.toLowerCase())}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <GoEye /> : <GoEyeClosed />}
      </button>
    </div>
    </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setResetDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {setResetDialogOpen(false); resetPassword()}} className="bg-red-800 px-4 py-2 text-white transition hover:bg-red-600">Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
          <EmployeeEditForm isManager={isManager} sheetOpen={sheetOpen} id={editEmployeeId}  onChange={()=>{setSheetOpen(!sheetOpen)}} onSuccess={()=>fetchEmployeeData()}/>
        </main>
      </div>
    </div>
  );
}
