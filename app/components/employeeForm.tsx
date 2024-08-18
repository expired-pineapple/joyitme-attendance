'use client'
import { PiSpinner } from "react-icons/pi";
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
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
  import { Button } from "@/components/ui/button";
  import { FormEvent, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useRegisterEmployee  from '@/app/hooks/useRegisterEmployee'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectGroup,
    SelectValue,
  } from "@/components/ui/select"
import { GoEye, GoEyeClosed } from "react-icons/go";




interface Props {
    isManager: boolean;
    onSuccess: () => Promise<void>;
}

const EmployeeForm: React.FC<Props> = ({isManager, onSuccess}) => {
    const {
        formData,
        setFormData,
        saveError,
        saveErrorMessage,
        success,
        loading,
        saveUserData,
      } = useRegisterEmployee();
      const [location, setLocation] = useState<Location[]>([]);
      const [showPassword, setShowPassword] = useState(false);
      const [locationLoading, setLocationLoading] = useState(false);
      const onSubmit = async(e: FormEvent<HTMLFormElement> | undefined) =>{
        saveUserData(e)
      }

      useEffect(() => {
        const fetchLocationData = async () => {
          setLocationLoading(true);
          try {
            const response = await fetch('/api/configs/location');
            const data = await response.json();
            setLocation(data.locations); // This assumes data is an array of Location objects
          } catch (error) {
            console.error('Error fetching locations:', error);
          } finally {
            setLocationLoading(false);
          }
        };
        if(success){
          onSuccess()
        }
        fetchLocationData();
      }, [success]);
    
    return(
        <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="h-7 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Employee
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
          <form onSubmit={(e)=>{
            onSubmit(e)
          }}
          action={'POST'}
          >
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
                      employeeNumber: e.target.value,
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectedHour" className="text-right">
                  Projected Hour
                </Label>
                <Input
                  id="projectedHour"
                  placeholder="0"
                  className="col-span-3"
                  type="number"
                  value={formData.projectedHour}
                  onChange={(e) =>
                    setFormData({ ...formData, projectedHour: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
                <div className="flex justify-between items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Select
onValueChange={(value) => setFormData((prevFormData) => ({
...prevFormData,
location: value,
}))}
defaultValue={formData.location as string}

>
<SelectTrigger className="w-full bg-transparent">
<SelectValue placeholder="Select location" />
</SelectTrigger>
{locationLoading ? (
<SelectContent>Loading...</SelectContent>
) : location?.length === 0 ? (
<SelectContent>No location found</SelectContent>
) : Array.isArray(location) ?  (
<SelectContent className="dark:bg-gray-900 dark:text-white">
  {location?.map((group: any) => (
    <SelectGroup key={group.id}>
      <SelectItem
        value={group.id}
      >
        {group.name}
      </SelectItem>
    </SelectGroup>
  ))}
</SelectContent>) : (
  <SelectContent>{location}</SelectContent>
)}
</Select>
</div>
            <div className="grid grid-cols-4 items-center gap-4 my-4">
<Label htmlFor="formula" className="text-right">
Formula
</Label>
<Input
id="formula"
placeholder="(A-68)*20"
className={`col-span-3`}
type="text"
value={formData.formula}
onChange={(e) =>
  setFormData({ ...formData, formula: e.target.value })
}
/>
</div>
<div className="grid grid-cols-4 items-center gap-4 my-4">
<Label htmlFor="password" className="text-right">
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
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

    )
}

export default EmployeeForm
