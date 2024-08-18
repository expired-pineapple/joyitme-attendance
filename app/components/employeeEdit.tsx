import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { PiSpinner } from "react-icons/pi";
import { BsCheck2Circle } from "react-icons/bs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";

import axios from 'axios';
import { Location } from "@/app/types";


interface Props {
  isManager: boolean;
  id: string;
  sheetOpen: boolean;
  onChange: (value: boolean) => void;
  onSuccess: () => Promise<void>
}

const EmployeeEditForm: React.FC<Props> = ({ isManager, id, sheetOpen, onChange,  onSuccess }) => {
  const [editformData, setEditformData] = useState({
    user: {
      employeeNumber: "",
      name: "",
      locationId: ""
    },
    formula: "",
    projectedHour: 0
  });

  const [editFetchLoading, setEditFetchLoading] = useState(true);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editLocation, setEditLocation] = useState<Location[]>([]); 
  const [editLocationLoading, setEditLocationLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const { toast } = useToast();

  const fetchEmployeeDataByID = async (id: string) => {
    try {
      const res = await axios.get(`/api/employee/${id}`);
      if (res.status === 200) {
        setEditformData(res.data); // Assuming res.data matches the structure of editformData
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // Handle error state if needed
    } finally {
      setEditFetchLoading(false);
    }
  };
  const editUserData = async () => {
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
      if(id !==""){
      const res = await axios.put(`/api/employee/${id}`, editformData);
      if (res.status === 200) {
        setEditSuccess(true);
        toast({
          description: res.data.message,
          className:
            "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
        });
        setEditEmployeeId("");
        onSuccess()
        setTimeout(() => {
          setEditSuccess(false);
        }, 3000);
      }
      }
    } catch (error: any) {
      toast({
        description: "Failed to update user data",
        className:
          "top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    }finally{
      setEditLoading(false);
    }


  }

  
  const updateLocation = (locationId: string) => {
    setEditformData((prevData) => ({
      ...prevData,
      user: { ...prevData.user, locationId },
    }));
  };


  useEffect(() => {
    const fetchLocationData = async () => {
      setEditLocationLoading(true);
      try {
        const response = await fetch('/api/configs/location'); // Replace with your API endpoint
        const data = await response.json();
        setEditLocation(data.locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setEditLocationLoading(false);
      }
    };
    fetchLocationData();
  }, []);



  useEffect(() => {
    if (id) {
      fetchEmployeeDataByID(id);
    }
  }, [id]);

  return (
    <Sheet open={sheetOpen} onOpenChange={onChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Employee</SheetTitle>
          <SheetDescription>
            Edit selected employee in the system
          </SheetDescription>
        </SheetHeader>
        {editSuccess && (
          <div className="border border-emerald-100 p-2 w-full mx-auto rounded-md bg-emerald-50/50 mt-2 text-emerald-700 flex items-center gap-4 justify-center">
            <BsCheck2Circle />
            <p>Employee edited successfully</p>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editUserData();
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Employee Number
              </Label>
              <Input
                id="email"
                disabled={editFetchLoading}
                placeholder={editFetchLoading ? "Loading..." : "EN001"}
                className="col-span-3"
                value={editformData.user?.employeeNumber}
                onChange={(e) =>
                  setEditformData({
                    ...editformData,
                    user: { ...editformData.user, employeeNumber: e.target.value.toLowerCase() },
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
                placeholder={editFetchLoading ? "Loading..." : "John Doe"}
                disabled={editFetchLoading}
                className="col-span-3"
                value={editformData.user?.name}
                onChange={(e) =>
                  setEditformData({
                    ...editformData,
                    user: { ...editformData.user, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectedHour" className="text-right">
                Projected Hour
              </Label>
              <Input
                id="projectedHour"
                disabled={editFetchLoading}
                placeholder={editFetchLoading ? "Loading..." : "0"}
                className="col-span-3"
                type="number"
                value={editformData.projectedHour}
                onChange={(e) =>
                  setEditformData({
                    ...editformData,
                    projectedHour: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          {!isManager && (
            <div className="flex justify-between items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select
                onValueChange={(value) => updateLocation(value)}
                value={editformData.user.locationId}
              >
                <SelectTrigger className="w-full bg-transparent">
                  <SelectValue placeholder={editFetchLoading ? "Loading..." : "Select Location"} />
                </SelectTrigger>
                {editLocationLoading ? (
                  <SelectContent>Loading...</SelectContent>
                ) : editLocation?.length === 0 ? (
                  <SelectContent>No location found</SelectContent>
                ) :  (
                  <SelectContent className="dark:bg-gray-900 dark:text-white">
                    {editLocation?.map((group) => (
                      <SelectGroup key={group.id}>
                        <SelectItem value={group.id}>{group.name}</SelectItem>
                      </SelectGroup>
                    
                    ))}
                  </SelectContent>
                ) 
                }
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4 my-4">
            <Label htmlFor="formula" className="text-right">
              Formula
            </Label>
            <Input
              id="formula"
              placeholder="(A-68)*20"
              className={`col-span-3`}
              type="text"
              value={editformData.formula}
              onChange={(e) =>
                setEditformData({ ...editformData, formula: e.target.value })
              }
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? (
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
  );
};

export default EmployeeEditForm;
