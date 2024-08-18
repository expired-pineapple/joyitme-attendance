import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is imported correctly
import { Location } from "@/app/types";

const useEditEmployee = () => {
  const [editFetchLoading, setEditFetchLoading] = useState(true);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editError, setEditError] = useState(false);
  const [editLocation, setEditLocation] = useState<Location[]>([]); 
  const [editLocationLoading, setEditLocationLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editformData, setEditformData] = useState({
    user: {
      employeeNumber: "",
      name: "",
      locationId: ""
    },
    formula: "",
    projectedHour: 0
  });

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
    try {
      if (editEmployeeId !== "") {
        const res = await axios.put(`/api/employee/${editEmployeeId}`, editformData);
        if (res.status === 200) {
          setEditSuccess(true);
          setTimeout(() => {
            setEditSuccess(false);
          }, 3000);
        }
      }
      return true;
    } catch (error) {
      console.error('Error editing user data:', error);
      setEditError(true);
      return false;
    } finally {
      setEditLoading(false);
    }
  };

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

  return {
    updateLocation,
    editformData,
    editUserData,
    setEditformData,
    editError,
    editLocation,
    editLocationLoading,
    fetchEmployeeDataByID,
    editSuccess,
    editLoading,
    editFetchLoading,
  };
};

export default useEditEmployee;
