import { FaHeart } from "react-icons/fa";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
      <FaHeart className="text-primary text-5xl animate-pulse mb-4" />
      <p className="text-gray-400">{message}</p>
    </div>
  );
}
