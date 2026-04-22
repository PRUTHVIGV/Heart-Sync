import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { FaHeart, FaComments, FaUser, FaFire, FaCog, FaStar, FaShieldAlt, FaDoorOpen } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import { motion } from "framer-motion";

const navItems = [
  { icon: <FaFire />, label: "Discover", path: "/dashboard" },
  { icon: <FaHeart />, label: "Matches", path: "/matches" },
  { icon: <FaStar />, label: "Likes", path: "/likes" },
  { icon: <FaComments />, label: "Messages", path: "/messages" },
  { icon: <FaDoorOpen />, label: "Rooms", path: "/rooms" },
  { icon: <FaShieldAlt />, label: "Safe Date", path: "/safe-date" },
  { icon: <FaUser />, label: "Profile", path: "/profile" },
];

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => router.push("/dashboard")}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <FaHeart className="text-white text-xs" />
        </div>
        <span className="text-white font-bold text-lg hidden sm:block">HeartSync</span>
      </div>

      {/* Nav Items */}
      <div className="flex items-center gap-0.5">
        {navItems.map((item) => {
          const active = router.pathname === item.path;
          const isLikes = item.path === "/likes";
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-2xl transition-all text-xs ${
                active ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {active && (
                <motion.div layoutId="nav-pill"
                  className="absolute inset-0 bg-white/8 rounded-2xl border border-white/10" />
              )}
              <span className={`text-base relative z-10 ${active ? "text-primary" : ""}`}>
                {item.icon}
              </span>
              <span className="relative z-10 hidden sm:block">{item.label}</span>
              {/* Premium lock for likes */}
              {isLikes && !user?.isPremium && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs leading-none">👑</span>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <NotificationBell />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/settings")}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
            router.pathname === "/settings" ? "text-primary bg-white/8" : "text-white/30 hover:text-white/60"
          }`}
        >
          <FaCog />
        </motion.button>
      </div>
    </nav>
  );
}
