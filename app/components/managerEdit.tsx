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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios'; 
import { Location } from "@/app/types";

interface Props {
  id: string;
  sheetOpen: boolean;
  onChange: (value: boolean) => void;
  onSuccess: () => Promise<void>
}

const ManagerEditForm: React.FC<Props> = ({ id, sheetOpen, onChange, onSuccess }) => {
  const [editformData, setEditformData] = useState({
    user: {
      employeeNumber: "",
      name: "",
      location: [] as { locationId: string }[],
    },
    formula: ""
  });

  const [editFetchLoading, setEditFetchLoading] = useState(true);
  const [editLocation, setEditLocation] = useState<Location[]>([]); 
  const [editLocationLoading, setEditLocationLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const { toast } = useToast();

  const fetchEmployeeDataByID = async (id: string) => {
    try {
      setEditFetchLoading(true);
      const res = await axios.get(`/api/employee/${id}`);
      if (res.status === 200) {
        setEditformData(res.data);
        setSelectedLocations(res.data.user.location.map((loc: { locationId: string }) => loc.locationId));
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        description: "Failed to fetch employee data",
        className:"top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    } finally {
      setEditFetchLoading(false);
    }
  };

  const editUserData = async () => {
    setEditLoading(true);
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
      if (id !== "") {
        const res = await axios.put(`/api/employee/${id}`, {
          ...editformData,
          user: {
            ...editformData.user,
            location: selectedLocations.map(locationId => ({ locationId })),
          },
        });
        if (res.status === 200) {
          setEditSuccess(true);
          toast({
            description: res.data.message,
            className:
              "top-0 right-0 bg-emerald-50 text-emerald-900 border-emerald-900",
          });
          onSuccess();
          setTimeout(() => {
            setEditSuccess(false);
          }, 3000);
        }
      }
    } catch (error: any) {
      toast({
        description: "Failed to update user data",
        className:"top-0 right-0 bg-red-50 text-red-900 border-red-900",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) ? prev.filter(id => id !== locationId) : [...prev, locationId]
    );
  };

  useEffect(() => {
    const fetchLocationData = async () => {
      setEditLocationLoading(true);
      try {
        const response = await fetch('/api/configs/location');
        const data = await response.json();
        setEditLocation(data.locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          description: "Failed to fetch locations",
          variant: "destructive",
        });
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

  const renderInput = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={editFetchLoading ? "Loading..." : `Enter ${label}`}
        className="col-span-3"
        disabled={editFetchLoading}
        value={value}
        onChange={onChange}
      />
    </div>
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={onChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Manager</SheetTitle>
          <SheetDescription>
            Edit selected manager in the system
          </SheetDescription>
        </SheetHeader>
        {editSuccess && (
          <div className="border border-emerald-100 p-2 w-full mx-auto rounded-md bg-emerald-50/50 mt-2 text-emerald-700 flex items-center gap-4 justify-center">
            <BsCheck2Circle />
            <p>Manager edited successfully</p>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); editUserData(); }}>
          <div className="grid gap-4 py-4">
            {renderInput("employeeNumber", "Employee Number", editformData.user.employeeNumber, 
              (e) => setEditformData({...editformData, user: {  ...editformData.user, employeeNumber: e.target.value} }))
            }
            {renderInput("name", "Name", editformData.user?.name || "", 
              (e) => setEditformData({ ...editformData, user: { ...editformData.user, name: e.target.value } }))
            }
           
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
              <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel>Locations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {editLocationLoading ? (
                  <DropdownMenuLabel>Loading...</DropdownMenuLabel>
                ) : editLocation?.length === 0 ? (
                  <DropdownMenuLabel>No location found</DropdownMenuLabel>
                ) : (
                  editLocation.map((location) => (
                    <DropdownMenuCheckboxItem
                      key={location.id}
                      checked={selectedLocations.includes(location.id)}
                      onCheckedChange={() => handleLocationChange(location.id)}
                    >
                      {location.name}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" disabled={editLoading || editFetchLoading}>
                {editLoading ? (
                  <div className="flex items-center justify-center">
                    <PiSpinner className="h-4 w-4 mr-2 animate-spin text-white" />
                    <p>Saving...</p>
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

export default ManagerEditForm;