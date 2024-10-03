import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { PiSpinner } from "react-icons/pi";
import { BsCheck2Circle } from "react-icons/bs";
import { MdErrorOutline } from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from 'axios';

interface Props {
  id: string;
  sheetOpen: boolean;
  onClose: () => void;
}

const AttendanceForm: React.FC<Props> = ({ id, sheetOpen, onClose }) => {
  const [formData, setFormData] = useState({
    date: "",
    check_in_time: "",
    check_out_time: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default to user's timezone
  });

  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  const { toast } = useToast();

  const saveUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    setFetchLoading(true);
    setSaveError(false);
    setSaveErrorMessage("");

    // Basic validation
    if (!formData.date || !formData.check_in_time || !formData.check_out_time) {
      setSaveError(true);
      setSaveErrorMessage("All fields are required.");
      setFetchLoading(false);
      return;
    }

    try {
      const res = await axios.post(`/api/employee/attendance/admin/${id}`, formData);
      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      setSaveError(true);
      setSaveErrorMessage(error.response?.data?.message || "Failed to update user data");
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Attendance</SheetTitle>
          <SheetDescription>
            Register attendance for selected employee
          </SheetDescription>
        </SheetHeader>
        {saveError && (
          <div className="border border-red-100 p-2 w-full mx-auto rounded-md bg-red-50/50 mt-2 text-red-700 flex items-center gap-4 justify-center text-xs">
            <MdErrorOutline />
            <span>{saveErrorMessage || "Something went wrong"}</span>
          </div>
        )}
        {success && (
          <div className="border border-emerald-100 p-2 w-full mx-auto rounded-md bg-emerald-50/50 mt-2 text-emerald-700 flex items-center gap-4 justify-center">
            <BsCheck2Circle />
            <p>Attendance saved successfully</p>
          </div>
        )}
        <form onSubmit={saveUserData}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                className="col-span-3"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="check-in" className="text-right">Check In Time</Label>
              <Input
                id="check-in"
                value={formData.check_in_time}
                onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                placeholder={fetchLoading ? "Loading..." : ""}
                className="col-span-3"
                type="time"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="check-out" className="text-right">Check Out Time</Label>
              <Input
                id="check-out"
                value={formData.check_out_time}
                onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                placeholder={fetchLoading ? "Loading..." : ""}
                className="col-span-3"
                type="time"
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={fetchLoading}>
              {fetchLoading ? (
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
  );
};

export default AttendanceForm;