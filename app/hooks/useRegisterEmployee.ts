import { useState, useEffect } from 'react';
import validateFormula from '@/lib/validateFormula'
import { Location } from "@/app/types";
import axios from 'axios'

const useRegisterEmployee = (initialFormData = {}) => {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    name: "",
    location:"",
    formula:"",
    projectedHour:0,
    password:""
  });

  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location[]>([]); 
  const [locationLoading, setLocationLoading] = useState(false);

  const saveUserData = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      if(!validateFormula(formData.formula)){
        setSaveError(true)
        setSaveErrorMessage("Invalid Formula")
        setTimeout(() => {
          setSaveError(false);
        }, 5000);
        return  
      }

      const res = await axios.post("/api/register", formData);
      if (res.status === 201) {
        setFormData({
          employeeNumber: "",
          name: "",
          location:formData.location,
          formula:"",
          projectedHour:0,
          password:""
        });
        setSuccess(true);
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
      if(e.response.status === 400){
        setSaveError(true)
        setSaveErrorMessage(e.response.data.message);
        setTimeout(() => {
          setSaveError(false);
        }, 5000);
      }else{
      setSaveError(true)
      setSaveErrorMessage("Something went wrong");
      setTimeout(() => {
        setSaveError(false);
      }, 5000);
    }
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    const fetchLocationData = async () => {
      setLocationLoading(true);
      try {
        const response = await fetch('/api/configs/location'); // Replace with your API endpoint
        const data = await response.json();
        setLocation(data.locations);
      } catch (error) {
        
      } finally {
        setLocationLoading(false);
      }
    };
    fetchLocationData();
  }, []);

  return {
    formData,
    setFormData,
    saveError,
    saveErrorMessage,
    success,
    loading,
    location,
    locationLoading,
    saveUserData,
  };
};

export default useRegisterEmployee;
