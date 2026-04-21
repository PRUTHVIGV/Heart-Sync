import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaBolt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function BoostButton({ isPremium }) {
  const [boosting, setBoosting] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const handleBoost = async () => {
    if (!isPremium) {
      toast.error("Upgrade to Premium to boost your profile! 👑");
      return;
    }
    if (boosted) return;
    setBoosting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/boost`);
      setBoosted(true);
      toast.success("Profile boosted for 30 minutes! 🚀");
      let seconds = 1800;
      setTimeLeft(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setTimeLeft(seconds);
        if (seconds <= 0) {
          clearInterval(interval);
          setBoosted(false);
          setTimeLeft(null);
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Boost failed");
    } finally {
      setBoosting(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBoost}
      disabled={boosting || boosted}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
        boosted
          ? "bg-purple-500/20 border border-purple-500/40 text-purple-400"
          : isPremium
          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 hover:from-purple-500/30"
          : "bg-white/5 border border-white/10 text-white/30"
      }`}
    >
      <FaBolt className={boosted ? "animate-pulse" : ""} />
      {boosted ? `Boosted ${formatTime(timeLeft)}` : boosting ? "Boosting..." : "Boost"}
    </motion.button>
  );
}
