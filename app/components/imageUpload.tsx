


import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { TbPhotoPlus } from 'react-icons/tb';

interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const api_key =  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

  useEffect(() => {
    if (value) {
      setPreviews([value]);
    } else {
      setPreviews([]);
    }
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const newPreviews = acceptedFiles.map((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            setPreviews([ reader.result as string]);
          };
          reader.readAsDataURL(file);
          return null;
        });

        // Upload images when files are dropped
        try {
          const formData = new FormData();
          acceptedFiles.forEach((file) => {
            formData.append("file", file);
          });
          formData.append("upload_preset", "cxd5yz2q");
          formData.append("api_key",api_key);

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
            formData
          );
          onChange(response.data.secure_url);
        } catch (error) {
          console.error("Error uploading images:", error);
          // Handle error
        }
      }
    },
    [setPreviews, onChange]
  );


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <>
      <div
        className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 p-20 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 rounded-lg"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm">Drop the files here</p>
        ) : (
          <div className="">
            <TbPhotoPlus className="w-8 h-8 text-neutral-600" />
          </div>
        )}
        {previews.length >0 && (
              <div className="
              absolute inset-0 w-full h-fit object-cover">
                <img
                  style={{ objectFit: 'cover' }} 
                  src={previews[0]} 
                  alt="Image" 
                />
              </div>
            )}
      </div>

    </>
  );
};

export default ImageUpload;
