import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { FaHeart, FaComments, FaUser, FaFire, FaCog } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { icon: <FaFire />, label: "Discover", path: "/dashboard" },
    { icon: <FaHeart />, label: "Matches", path: "/matches" },
    { icon: <FaComments />, label: "Messages", path: "/messages" },
    { icon: <FaUser />, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-dark sticky top-0 z-40">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
        <FaHeart className="text-primary text-xl" />
        <span className="text-xl font-bold text-white">HeartSync</span>
      </div>

      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors text-xs ${
              router.pathname === item.path
                ? "text-primary bg-primary/10"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={() => router.push("/settings")}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
            router.pathname === "/settings"
              ? "text-primary bg-primary/10"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <FaCog className="text-xl" />
        </button>
      </div>
    </nav>
  );
}
