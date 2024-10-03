"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { formatInTimeZone, format } from 'date-fns-tz';
import { LuFileSpreadsheet } from "react-icons/lu";
import exportToExcel from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IoCalendarOutline } from "react-icons/io5";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTable } from "@/components/ui/data-table";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Attendance } from "../types";
import { PiSpinner } from "react-icons/pi";
import { useToast } from "@/components/ui/use-toast";
import { TbPencil } from "react-icons/tb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FiMapPin } from "react-icons/fi";
import { Location } from "@/app/types";
import { GoLog } from "react-icons/go";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";


export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Attendance[]>([]); 
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [editId, setEditId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [editValues, setEditValues] = useState({
    date:"",
    check_in_time: "",
    check_out_time: null as string | null,
    remark: null as string | null
  });
  const [location, setLocation] = useState<Location[]>([]);
  const [locationLoading, setlocationLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([])
  const [remark, setRemark] = useState("")
  const [remarkDialog, setRemarkDialog] = useState(false)
  const [remarkId, setRemarkId] = useState("")

  const excel_columns = [
    { header: "Employee Number", key: "employeeNumber", width: 30 },
    { header: "Name", key: "employeeName", width: 30 },
    { header: "Date", key: "date", width: 30 },
    { header: "Check In Time", key: "check_in_time", width: 30 },
    { header: "Check Out Time", key: "check_out_time", width: 30 },
    { header: "Duration", key: "duration", width: 30 },
  ];

  const fetchLocationData = async () => {
    try {
      const res = await axios.get("/api/configs/location");
      if (res.status === 200) {
        setLocation(res.data.locations);
      }
    } catch (e: any) {
     
    } finally {
      setlocationLoading(false);
    }
  };


  const exportExcel = async () => {
    setExportLoading(true);
    try {
      await exportToExcel(data, excel_columns, "Attendance Report");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        description: "Error exporting to Excel",
        className: "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      let params: any = {};
  
      // Apply date filter if available
      if (date?.from && date?.to) {
        params.startDate = date.from;
        params.endDate = date.to;
      }
  
      // Apply location filter if available
      if (selectedLocations) {
        params.locations = selectedLocations;
      }
  
      // Make the API call with all applicable params
      const res = await axios.get("/api/employee/attendance/", { params });
  
      if (res.status === 200) {
        const data = res.data.attendanceWithEmployeeName;
        const renderedData = data.map((item: any) => ({
          ...item,
          check_in_time: new Date(item.check_in_time).toLocaleTimeString(),
          check_out_time: item.check_out_time
            ? new Date(item.check_out_time).toLocaleTimeString()
            : "Haven't checked out",
        }));
  
        setData(renderedData);
        setHasCheckedIn(res.data.hasCheckInToday);
        setHasCheckedOut(res.data.hasCheckOutToday);
        setIsAdmin(res.data.isAdmin);
        setIsManager(res.data.isManager);
      }
    } catch (e: any) {
      setData([]);
      setError(e.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);
      const res = await axios.post("/api/employee/attendance/checkIn");
      if (res.status === 200) {
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
        });
        fetchEmployeeData();
      }
    } catch (e: any) {
      if (e.response?.status === 400) {
        toast({
          description: e.response.data.message,
          className: "top-0 right-0 bg-red-50 text-red-900 border-red-900",
        });
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckOutLoading(true);
      const res = await axios.post("/api/employee/attendance/checkOut");
      if (res.status === 200) {
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
        });
        fetchEmployeeData();
      }
    } catch (e: any) {
      if (e.response?.status === 400) {
        toast({
          description: e.response.data.message,
          className: "top-0 right-0 bg-red-50 text-red-900 border-red-900",
        });
      }
    } finally {
      setCheckOutLoading(false);
    }
  };

const fetchAttendance = async (id: string) => {
  setEditValues({
    date: "",
    check_in_time: "",
    check_out_time: null,
    remark: null
  });

  try {
    setIdLoading(true);
    const res = await axios.get(`/api/employee/attendance/${id}`);
    if (res.status === 200) {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const date = res.data.date
      const check_in_time = formatInTimeZone(new Date(res.data.check_in_time), userTimeZone, 'HH:mm:ss');
      const check_out_time = res.data.check_out_time 
        ? formatInTimeZone(new Date(res.data.check_out_time), userTimeZone, 'HH:mm:ss')
        : null;

      const fetchedRemark = res.data.remark

      setEditValues({
        date,
        check_in_time,
        check_out_time,
        remark:fetchedRemark
      });
    }
  } catch (e: any) {
    setError(e.response.data.message);
  } finally {
    setIdLoading(false);
  }
};

const editAttendance = async () => {          
  try {
    toast({
      description: (
        <>
          <div className="flex items-center justify-center">
            <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
            <p>Loading</p>
          </div>
        </>
      ),
      className: "top-0 right-0 bg-blue-50 text-blue-900 border-blue-900",
    });

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const check_in_date = new Date(now.toDateString() + ' ' + editValues.check_in_time);
    const check_out_date = editValues.check_out_time 
      ? new Date(now.toDateString() + ' ' + editValues.check_out_time)
      : null;

    const editData = {
      date: editValues.date,
      check_in_time: check_in_date.toISOString().slice(11, 19),
      check_out_time: check_out_date ? check_out_date.toISOString().slice(11, 19) : null,
      timezone: userTimeZone,
      remark: editValues.remark
    };
  
    const res = await axios.put(`/api/employee/attendance/${editId}`, editData);
    if (res.status === 200) {
      toast({
        description: res.data.message,
        className: "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
      });
      fetchEmployeeData();
    }
  } catch (e: any) {
    toast({
      description: "Something went wrong",
      className: "top-0 right-0 bg-red-50 text-red-900 border-red-900",
    });
  } finally {
    setIdLoading(false);
  }
};

const setAttendanceRemark = async ()=>{
  try {
    toast({
      description: (
        <>
          <div className="flex items-center justify-center">
            <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
            <p>Loading</p>
          </div>
        </>
      ),
      className: "top-0 right-0 bg-blue-50 text-blue-900 border-blue-900",
    });

   
    const res = await axios.put(`/api/employee/attendance/remark/${remarkId}`, {
      remark:remark
    });
    fetchEmployeeData();
    if (res.status === 200) {
      toast({
        description: res.data.message,
        className: "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
      });
    }
  } catch (e: any) {
    toast({
      description: "Something went wrong",
      className: "top-0 right-0 bg-red-50 text-red-900 border-red-900",
    });
  } finally {
    setIdLoading(false);
  }

}
  const handleLocationChange = (locationId: string) => {
    setSelectedLocations((prev: any) => {
      const newSelection = prev.includes(locationId)
        ? prev.filter((id: string) => id !== locationId)
        : [...prev, locationId]
      return newSelection
    })
  }


  const columns: ColumnDef<Attendance>[] = [  
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
      accessorKey: "locations",
  
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
          Location
            <RxCaretSort className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-left">{row.getValue("locations")}</div>,
    },
    {
      accessorKey: "date",
  
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
          Date
            <RxCaretSort className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell:  ({ row }) => {
        return ( <div className="text-left"><span></span>{row.getValue("date")}</div>
      )},
    },
    {
      accessorKey: "check_in_time",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Check In Time
            <RxCaretSort className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="text-left font-medium">{row.getValue("check_in_time")}</span>;
      },
    },
  
    {
      accessorKey: "check_out_time",
      header: () => <div className="text-left">Checkout Time</div>,
      cell: ({ row }) => {
        return( <span className="text-left font-medium">
          
          {row.getValue("check_out_time")}</span>)
      },
    },
  
    {
      accessorKey: "duration",
      header: () => <div className="text-left">Duration(hours)</div>,
      cell: ({ row }) => {
  
        return <span className="text-left font-medium">{row.getValue("duration")}</span>;
      },
    },
      
    {
      accessorKey: "remark",
      header: () => <div className="text-left">Remark</div>,
      cell: ({ row }) => {
  
        return <span className="text-left font-medium">{row.getValue("remark")}</span>;
      },
    },
    {
      accessorKey: "edited",
      header: () => <div className="text-left"></div>,
      cell: ({ row }) => {
        const edited = row.original.edited;
        return (
          <div className={edited ? "border border-red-500 px-2 py-1 mx-auto rounded-full bg-red-50/50 text-red-700 font-medium text-center text-xs" : "border border-emerald-500 px-2 py-1 mx-auto rounded-full bg-emerald-50/50 text-emerald-700 font-medium text-center text-xs"}>
            {edited ? "Edited" : "Unedited"}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-left"></div>,
      cell: ({ row }) => {
        if(isAdmin || isManager){
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
              <DropdownMenuItem onClick={()=>{
                fetchAttendance(row.original.id)
                setDialogOpen(true)
                setEditId(row.original.id)
              }}
                >
                Edit Attendance
                
                </DropdownMenuItem>
                <DropdownMenuItem
                           onClick={()=>{
                            setRemarkDialog(true)
                            setRemarkId(row.original.id)
                          }}>
                    Add Attendance Remark
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>  
          </>
                      
        )}}
    },
  ];
  


  useEffect(() => {
      fetchEmployeeData()
      fetchLocationData()
    
  }, [date, selectedLocations]);

  return (
    <div className="flex h-screen w-full flex-col  mx-auto">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
              {(isAdmin || isManager) && (
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full">
                              <FiMapPin className="mr-2 h-4 w-4" />
                                {selectedLocations.length > 0 
                                  ? `${selectedLocations.length} selected`
                                  : "All Locations"}
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
                                location?.map((group) => (
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
              )}

            <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "w-[100px]"
            )}
          >
            <IoCalendarOutline className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-muted-foreground ">Filter</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"    
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}

            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
              <Button
                variant="outline"
                onClick={(e) => {
                  exportExcel();
                }}
              >
              {exportLoading ? (
                      <div className="flex items-center justify-center">
                        <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                        <p>Loading</p>
                      </div>
                    ) : (
                          <div className="flex items-center justify-center">
                          <LuFileSpreadsheet className="mr-2 h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Export
                    </span>
                    </div>
                    )}
              </Button>
            </div>
          </div>
          <Card className="sm:col-span-1 col-span-2 w-screen sm:w-full">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Employee Attendance</CardTitle>
                  <CardDescription>List of attendance records</CardDescription>
                </div>
                { (!isAdmin || loading ) && (
                    <div className="flex gap-2 items-center">
                    <Button variant="outline" onClick={handleCheckIn} disabled={ loading || checkInLoading || isAdmin}>
                      {checkInLoading ? (
                        <div className="flex items-center justify-center">
                          <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                          <p>Loading</p>
                        </div>
                      ) : (
                        <p>Check In</p>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCheckOut} disabled={loading || checkOutLoading|| isAdmin}>
                    {checkOutLoading ? (
                        <div className="flex items-center justify-center">
                          <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                          <p>Loading</p>
                        </div>
                      ) : (
                        <p>Check Out</p>
                      )}
                      </Button>
                  </div>
                  )
                }
              </div>
            </CardHeader>
            
              <DataTable columns={columns} data={[...data]} search={"employeeNumber"} loading={loading} />
            
          </Card>
          <AlertDialog open={remarkDialog} >
            <AlertDialogContent className="w-[200rem]">
              <AlertDialogHeader>
                <AlertDialogTitle>Add Attenance Remark</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="remark" className="font-semibold">
                    Remark:
                  </Label>
                  <Textarea 
                    id="remark"
                    value={remark}
                    className="row-span-2 col-span-2"
                    onChange={(e) => {
                      setRemark( e.target.value);
                    }}
                    />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRemarkDialog(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setRemarkDialog(false);
                    setAttendanceRemark();
                  }}
                  className="bg-emerald-800 px-4 py-2 text-white transition hover:bg-emerald-600"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
          <AlertDialog open={dialogOpen}>
            <AlertDialogContent className="w-[250rem]">
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Employee Attendance</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid gap-7 py-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="date" className="font-semibold">
                    Date
                  </Label>
                  <Input
                    id="check-in"
                    type="date"
                    value={
                      editValues?.date
                        ? editValues.date
                        : ""
                    }
                    className="col-span-3"
                    onChange={(e) => {
                      setEditValues({ ...editValues, date: e.target.value});
                    }}
                    />
                  <Label htmlFor="check-in" className="font-semibold">
                    Check In Time
                  </Label>
                  <Input
                    id="check-in"
                    value={
                      editValues?.check_in_time
                        ? editValues.check_in_time
                        : ""
                    }
                    onChange={(e) => {
                      setEditValues({ ...editValues, check_in_time: e.target.value});
                    }}
                    placeholder={idLoading ? "Loading..." : ""}
                    className="col-span-3"
                    type="time"

                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="check-out" className="font-semibold">
                    Check Out Time:
                  </Label>
                  <Input
                    id="check-out"
                    value={
                      editValues?.check_out_time
                        ? editValues.check_out_time
                        : ""
                    }
                    onChange={(e) => {
                      // @ts-ignore
                      setEditValues({ ...editValues, check_out_time: e.target.value});
                    }}
                    placeholder={idLoading ? "Loading..." : ""}
                    className="col-span-3"
                    type="time"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="remark" className="font-semibold">
                    Remark:
                  </Label>
                  <Textarea 
                    id="remark"
                    value={
                      editValues?.remark
                        ? editValues.remark
                        : ""
                    }
                    className="row-span-2 col-span-2"
                    onChange={(e) => {
                      setEditValues({ ...editValues, remark: e.target.value});
                    }}
                    />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDialogOpen(false);
                    editAttendance();
                  }}
                  className="bg-emerald-800 px-4 py-2 text-white transition hover:bg-emerald-600"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </main>
      </div>
    </div>
  );
}
