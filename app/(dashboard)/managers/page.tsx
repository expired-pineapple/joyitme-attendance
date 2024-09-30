"use client";
import { useEffect, useState } from "react";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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

import { PiSpinner } from "react-icons/pi";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast";
import ManagerEditForm from "@/app/components/managerEdit";

import { Employee, Location } from "@/app/types";



export default function Manager() {


  const [formData, setFormData] = useState({
    employeeNumber: "",
    name: "",
    locations:[],
    formula:"",
    password:""
  });
  const [selectedLocations, setSelectedLocations] = useState(formData.locations || [])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState("");
  const [editFetchLoading, setEditFetchLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmployeeId, setResetEmployeeId] = useState("");
  const [password, setPassword] = useState('')


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

  const handleLocationChange = (locationId: string) => {
    setSelectedLocations((prev: any) => {
      const newSelection = prev.includes(locationId)
        ? prev.filter((id: string) => id !== locationId)
        : [...prev, locationId]

      setFormData((prevFormData) => ({
        ...prevFormData,
        locations: newSelection,
      }))

      return newSelection
    })
  }

  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [location, setLocation] = useState<Location[]>([]);
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setlocationLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);


  const [editformData, setEditformData] = useState({
    employeeNumber: "",
    name: "",
    locations:[],
    formula:""
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


  const { toast } = useToast();


  const fetchEmployeeData = async () => {
    try {
      const res = await axios.get("/api/employee/manager");
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

  const fetchLocationData = async () => {
    try {
      const res = await axios.get("/api/configs/location");
      if (res.status === 200) {
        setLocation(res.data.locations);
      }
      else if(res.status === 401){
        window.location.href = "/login";
      }
    } catch (e: any) {
      if(e.response.status === 401){
        window.location.href = "/login";
      }
    } finally {
      setlocationLoading(false);
    }
  };


  const saveUserData = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/employee/manager", formData);
      if (res.status === 201) {
        setFormData({
          employeeNumber: "",
          name: "",
          locations:[],
          formula:"",
          password:""
        });
        setSuccess(true);
        fetchEmployeeData();
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

  const columns: ColumnDef<Employee>[] = [  
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
      cell: ({ row }) =>{
        const locations = row.original.locations
        return <div className="flex flex-col sm:flex-row gap-2">
        {
          locations?.map((l:string, index)=>{
            return <div key={index}>{l}</div>
          })
        }
        </div>
        
      }

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
        const employee = row.original
        const banned = row.original.user?.isBanned;           
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
            <DropdownMenuItem
             onClick={() => {
              fetchEmployeeDataByID(employee.id)
              setEditEmployeeId(employee.id); setSheetOpen(true)} }
            >Edit Manager</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>{
                setResetDialogOpen(true)
                setResetEmployeeId(employee.id)}}>
                  Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem
              onClick={()=>{
                setDeleteDialogOpen(true)
                setDeleteEmployeeId(employee.id)}}
              >
                  Delete Manager
              </DropdownMenuItem>
          <DropdownMenuItem className={banned ? `text-emerald-700 bg-transparent` : `text-red-700 bg-transparent`} onClick={()=>{banEmployee(row.original.id)}}>
          {banned ? "Unban" : "Ban"}
            </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>  
        </>
        )
      },
    },
  
  ];
  



  useEffect(() => {
    fetchLocationData();
    fetchEmployeeData();
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Manager
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Register Manager</SheetTitle>
                    <SheetDescription>
                      Add a new manager to the system
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
                          Manager added successfully
                        </p>
                      </div>

                    )
                  }
                  <form onSubmit={saveUserData}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Employee Number
                        </Label>
                        <Input
                          id="employeeNumber"
                          placeholder="EN001"
                          className="col-span-3"
                          value={formData.employeeNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeNumber: e.target.value.trim(),
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
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
                    </div>

                    <div className="flex justify-between items-center mb-4 gap-4">
      <Label htmlFor="locations" className="text-right">
        Locations
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent">
            {selectedLocations.length > 0 
              ? `${selectedLocations.length} selected`
              : "Select locations"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 dark:bg-gray-900 dark:text-white">
          <DropdownMenuLabel>Locations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locationLoading ? (
            <DropdownMenuLabel>Loading...</DropdownMenuLabel>
          ) : location.length === 0 ? (
            <DropdownMenuLabel>No location found</DropdownMenuLabel>
          ) : (
            location.map((group) => (
              <DropdownMenuCheckboxItem
                key={group.id}
                checked={
                  // @ts-ignored
                  selectedLocations.includes(group.id)}
                onCheckedChange={() => handleLocationChange(group.id)}
              >
                {group.name}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="grid grid-cols-4 items-center gap-4 my-4">
<Label htmlFor="formula" className="text-right">
Password
</Label>
<div className="relative col-span-3">
      <Input
        type={showPassword ? 'text' : 'password'}
        className=""
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <CardTitle>Manager List</CardTitle>
              <CardDescription>List of manager records</CardDescription>
            </CardHeader>
              <DataTable
                columns={columns}
                data={[...data]}
                loading={fetchLoading}
                search="employeeNumber"
              />
          </Card>
          <ManagerEditForm sheetOpen={sheetOpen} id={editEmployeeId}  onChange={()=>{setSheetOpen(!sheetOpen)}} onSuccess={()=>fetchEmployeeData()}/>
          <AlertDialog open={deleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete manager data.
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
                <AlertDialogTitle>
                  <p>Reset Employee Password</p>
                  <span className="text-sm">This action cannot be undone.</span>
                  </AlertDialogTitle>
                <AlertDialogDescription>
                 
                  <div className="password">
    <label htmlFor="password" className="font-bold text-md">
      Password
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`block rounded-md dark:text-white border-0 py-1.5 pl-7 pr-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003949] sm:text-sm sm:leading-6`}
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
        </main>
      </div>
    </div>
  );
}
