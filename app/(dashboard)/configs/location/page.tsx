"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
import { Location } from "@/app/types";
import  ImageUpload from "@/app/components/imageUpload";
import { RxCaretSort } from "react-icons/rx";
import { ColumnDef } from "@tanstack/react-table";
import Image  from "next/image";
import { GiCommercialAirplane } from "react-icons/gi";
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";



export default function Dashboard() {

  const [formData, setFormData] = useState({
    image: "",
    name: "",

  });

  
  const [editFormData, setEditFormData] = useState({
    image: "",
    name: "",

  });



  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState("");
  const [locationId, setLocationId] = useState("")
  const [deleteLocationId, setDeleteLocationId] = useState("")
  const [fetchEditLoading, setFetchEditLoading] = useState(false); 
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/configs/location");
      if (res.status === 200) {
        setData(res.data.locations);
        (res.data.locations)
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

  

  const fetchLocationDataByID = async (id: string) => {
    setFetchEditLoading(true);
    try {
      const res = await axios.get(`/api/configs/location/${id}`);
      if (res.status === 200) {
        setEditFormData(res.data);
        setImage(res.data.location.image);
        setLocationId("");

      }
    }catch(error){
      
    }finally{
      setFetchEditLoading(false);
    }
  };

  const editData = async (e: React.FormEvent) => {
    e.preventDefault();

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
      if(locationId !==""){
      editFormData.image=image;
      const res = await axios.put(`/api/configs/location/${locationId}`, editFormData);
      if (res.status === 200) {
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
        });
        setLocationId("");
        setTimeout(() => {
        }, 3000);
        // fetchData();
      }
      }
    } catch (error: any) {
      
      toast({
        description: "Failed to update location data",
        className:
          "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    }finally{
      setImage("")
    }
  }
  
  const deleteLocation = async () => {
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
      if(deleteLocationId !=""){
      const res = await axios.delete(`/api/configs/location/${deleteLocationId}`);
      if (res.status === 200) {
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
            
        });
        fetchData();
       
      }}
    } catch (error: any) {
      
      toast({
        description: "Failed to delete  data",
        className:
          "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    }
  }


  const columns: ColumnDef<Location>[] = [  
    {
      id: "image",
      cell: ({ row }) => {
      const image: string = row.original.image ? row.original.image : "";
      if(image !==""){
        return (
          <img  className="h-20 w-20" alt="image" src={image} />
        );
      }else{
        return (
        <GiCommercialAirplane className="h-10 w-14 text-gray-700"/>
        )
      }
     },
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
              fetchLocationDataByID(employee.id)
              setLocationId(employee.id); setSheetOpen(true)} }>Edit Location</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{
                setDeleteDialogOpen(true)
                setDeleteLocationId(employee.id)}}>
                  Delete Location
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>  
        </>
        )
      },
    },
  
  ];
  




  const saveUserData = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/configs/location", {
        image: image,
        name: formData.name,
      });
      if (res.status === 201) {
        setFormData({
          image: "",
          name: "",
        });
        setSuccess(true);
        fetchData();
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
      setSaveErrorMessage(e.response.data.error);
      setTimeout(() => {
        setSaveError(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [image]);

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
                      Add Location
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Register Location</SheetTitle>
                    <SheetDescription>
                      Add a new Location to the system
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
                          Location added successfully
                        </p>
                      </div>

                    )
                  }
                  <form onSubmit={saveUserData}>
                    <div className="grid gap-4 py-4">
                    <div className="flex justify-between gap-4 items-center">
                    <Label htmlFor="image" className="text-left">
                         <span>Image</span>
                          <p className="text-neutral-400 text-xs">(Optional)</p>
                        </Label>
                        <ImageUpload onChange={setImage} />
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <Label htmlFor="name" className="text-left">
                          Name:
                        </Label>
                        <Input
                          id="name"
                          placeholder="Joy Park Fly"
                          required
                          className="col-span-2"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
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
              <CardTitle>Location</CardTitle>
              <CardDescription>List of Location records</CardDescription>
            </CardHeader>
              <DataTable
                columns={columns}
                data={[...data]}
                loading={fetchLoading}
                search="name"
              />
            
          </Card>
          <AlertDialog open={deleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete location data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {setDeleteDialogOpen(false); deleteLocation()}} className="bg-red-800 px-4 py-2 text-white transition hover:bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
          <Sheet  open={sheetOpen} onOpenChange={()=>{setSheetOpen(!sheetOpen)}}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Location</SheetTitle>
                    <SheetDescription>
                    Edit a new Location to the system
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
                          Location edited successfully
                        </p>
                      </div>

                    )
                  }
                  <form onSubmit={(e)=>{editData(e)}}>
                    <div className="grid gap-4 py-4">
                    <div className="flex justify-between gap-4 items-center">
                    <Label htmlFor="image" className="text-left">
                         <span>Image</span>
                          <p className="text-neutral-400 text-xs">(Optional)</p>
                        </Label>
                        <ImageUpload onChange={setImage} />
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <Label htmlFor="name" className="text-left">
                          Name:
                        </Label>
                        <Input
                          id="name"
                          placeholder={ fetchEditLoading ? "Loading..." : `Joy Park Fly`}
                          required
                          className="col-span-2"
                          value={editFormData?.name}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, name: e.target.value })
                          }
                        />
                      </div>  
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit" disabled={loading}>
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
        </main>
      </div>
    </div>
  );
}
