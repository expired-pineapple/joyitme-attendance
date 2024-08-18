import Image from "next/image";
import { PiSpinner } from "react-icons/pi";
import { MdWaves } from "react-icons/md";

const LoadingPage = () => {
  return (
    <div className="w-full h-screen flex flex-col gap-2 items-center justify-center align-center">
      <MdWaves className="h-24 w-24 transition-all group-hover:scale-110" />
      <PiSpinner className="h-10 w-10 animate-spin text-black" />
    </div>
  );
};

export default LoadingPage;
