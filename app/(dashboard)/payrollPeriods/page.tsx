"use client";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import axios from "axios";

import { PlusCircle } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { PiSpinner } from "react-icons/pi";
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
import { RxCaretSort } from "react-icons/rx";

import { Location} from "@/app/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select"
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
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    locationId: "",
    budget:0

  });

  const [saveError, setSaveError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<Location[]>([]);
  const [locationLoading, setlocationLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [id, setId] = useState("")
  const [title, setTitle] = useState("Register Payroll Period")
  const [subtitle, setSubtitle] = useState("Add a new Payroll Period to the system")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("")
  const { toast } = useToast();

  const fetchPayrollData = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`/api/configs/payrollPeriods`);
      console.log(res.data)
      if (res.status === 200) {
        setData(res.data);
        setFetchLoading(false);

      } 
      
    } catch (e: any) {
     
    
     
    } finally {
      setFetchLoading(false);
    }
  }

  const fetchLocationData = async () => {
    try {
      const res = await axios.get("/api/configs/location");
      if (res.status === 200) {
       
        setLocation(res.data.locations);
        setIsManager(res.data.isManager);
      }
      else if(res.status === 401){
        window.location.href = "/login";
      }
    } catch (e: any) {
      
      // if(e.response.status === 401){
      //   window.location.href = "/login";
      // }
    } finally {
      setlocationLoading(false);
    }
  };


  const saveUserData = async (e: any) => {
    e.preventDefault();
    try {
      setFetchLoading(true);
      let res
      if(id == ""){
        res = await axios.post(`/api/configs/payrollPeriods`, {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          locationId: formData.locationId,
          budget: formData.budget
        });

      }else{
        res = await axios.put(`/api/configs/payrollPeriods/${id}`, {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          locationId: formData.locationId,
          budget: formData.budget
        });
      }
      if (res.status >= 200) {
        setSuccess(true);
        fetchPayrollData();
        setFetchLoading(false);
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
      setFetchLoading(false);
    }
  };
    
  const deletePayroll = async () => {
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
      if(deleteId !=""){
      const res = await axios.delete(`/api/configs/payrollPeriods/${deleteId}`);
      if (res.status === 200) {
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
            
        });
        fetchPayrollData();
       
      }}
    } catch (error: any) {
      
      toast({
        description: "Failed to delete  data",
        className:
          "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    }
  }
  const columns: ColumnDef<any>[] = [  
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
      header:  ({ column }) => {
        return (
          <div></div>
        )
      },
      cell: ({ row }) => {
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
            <DropdownMenuItem onClick={()=>{
              setTitle("Edit Payroll Period")
              setSubtitle("Edit selected payroll period")
              fetchPayrollDetail(row.original.id)
              setSheetOpen(!sheetOpen)}}>
              Edit Payroll Period</DropdownMenuItem>
              <DropdownMenuItem
              onClick={()=>{
              setDeleteDialogOpen(true)
              setDeleteId(row.original.id)}}>
                  Delete Payroll Period
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>  
        </>
        )
      },
    },
  ];
  
  const fetchPayrollDetail = async(id:string)=>{
    try{
      const response = await axios.get(`/api/configs/payrollPeriods/${id}`)
      setId(id)
      if(response.status == 200){
        console.log(response)
      setFormData({
        ...response.data
      })} 
    }
    catch(e){
      console.log(e)
    }
  }


  useEffect(() => { 
    fetchLocationData();
    fetchPayrollData();
  }, []);
  useEffect(()=>{
    if(!sheetOpen){
      setTitle("Register Payroll Period")
      setSubtitle("Add a new Payroll Period to the system")
      setFormData({
        startDate: "",
        endDate: "",
        locationId: "",
        budget:0
    
      })
    }
  }, [sheetOpen])

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" className="h-7 gap-1" onClick={()=>{setSheetOpen(!sheetOpen)}}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Payroll Period
                    </span>
                  </Button>
                  <Sheet open={sheetOpen} onOpenChange={()=>{setSheetOpen(!sheetOpen)}}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                     {subtitle}
                    </SheetDescription>
                  </SheetHeader>
                  {
                    saveError &&(
                      <div className="border border-red-100 p-2 w-full mx-auto rounded-md bg-red-50/50 mt-2 text-red-700 flex items-center gap-4 justify-center text-xs">
                      <MdErrorOutline />
                      <span>
                        {saveErrorMessage || "Something went wrong"}
                      </span>
                    </div>

                    )
                  }
                  {
                    success && (
                      <div className="border border-emerald-100 p-2 w-full mx-auto rounded-md bg-emerald-50/50 mt-2 text-emerald-700 flex items-center gap-4 justify-center ">
                      <BsCheck2Circle />
                        <p>
                          Payroll period saved successfully
                        </p>
                      </div>

                    )
                  }
                  <form onSubmit={saveUserData}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Start Date
                        </Label>
                        <Input
                          id="employeeNumber"
                          type="datetime-local"
                          className="col-span-3"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        End Date
                        </Label>
                        <Input
                          id="name"
                          type="datetime-local"
                          placeholder="John Doe"
                          className="col-span-3"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                        />
                      </div>

                          <div className="flex justify-between items-center gap-4">
                          <Label htmlFor="location" className="text-right">
                            Location
                          </Label>
                          <Select
       onValueChange={(value) => setFormData((prevFormData) => ({
    ...prevFormData,
    locationId: value,
  }))}
        value={formData.locationId as string}
         
      >
        <SelectTrigger className="w-full bg-transparent">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        {locationLoading ? (
          <SelectContent>Loading...</SelectContent>
        ) : location.length === 0 ? (
          <SelectContent>No location found</SelectContent>
        ) : (
          <SelectContent className="dark:bg-gray-900 dark:text-white">
            {location.map((group) => (
              <SelectGroup key={group.id}>
                <SelectItem
                  value={group.id}
                >
                  {group.name}
                </SelectItem>
              </SelectGroup>
            ))}
          </SelectContent>
        )}
      </Select>
      </div>


                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="budget" className="text-right">
                          Budget
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="Enter budget"
                          className="col-span-3"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: parseFloat(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit" onClick={saveUserData} disabled={fetchLoading}>
                          {fetchLoading ? (
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
          <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>Payroll Periods</CardTitle>
              <CardDescription>List of payroll period records</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={data}
                loading={fetchLoading}
                search="startDate"
              />
            </CardContent>
          </Card>
          <AlertDialog open={deleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete selected payroll data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {setDeleteDialogOpen(false); deletePayroll()}} className="bg-red-800 px-4 py-2 text-white transition hover:bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
        </main>
      </div>
    </div>
  );
}
