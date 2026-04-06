import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import SwipeCard from "../components/cards/SwipeCard";
import { FaHeart, FaTimes, FaStar, FaCrown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [matchModal, setMatchModal] = useState(null);
  const [swipesLeft, setSwipesLeft] = useState(20);
  const [actionHint, setActionHint] = useState(null); // "like" | "nope" | "star"

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/discover`);
      setProfiles(data.profiles);
      setCurrentIndex(0);
    } catch {
      toast.error("Failed to load profiles");
    } finally {
      setFetching(false);
    }
  };

  const handleSwipe = async (direction, profileId) => {
    if (!user?.isPremium && swipesLeft <= 0) {
      toast.error("Daily limit reached! Upgrade to Premium for unlimited swipes 👑");
      return;
    }
    setActionHint(direction === "right" ? "like" : "nope");
    setTimeout(() => setActionHint(null), 600);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/swipe`, {
        targetUserId: profileId,
        direction,
      });
      if (data.matched) setMatchModal(profiles[currentIndex]);
      if (!user?.isPremium) setSwipesLeft((p) => Math.max(0, p - 1));
    } catch (err) {
      if (err.response?.data?.limitReached) {
        toast.error("Daily limit reached! Upgrade to Premium 👑");
        return;
      }
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSuperLike = async (profileId) => {
    setActionHint("star");
    setTimeout(() => setActionHint(null), 600);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/superlike`, { targetUserId: profileId });
      toast.success("Super liked! ⭐");
    } catch {
      toast.error("Failed to super like");
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <FaHeart className="text-white text-2xl" />
          </motion.div>
          <p className="text-white/40">Finding your matches...</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <>
      <Head><title>Discover - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />

        <div className="flex flex-col items-center px-4 py-6">
          {/* Swipe limit bar (free users) */}
          {!user?.isPremium && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm mb-4"
            >
              <div className="glass px-4 py-3 flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Daily Swipes</span>
                    <span>{swipesLeft}/20</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      animate={{ width: `${(swipesLeft / 20) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => router.push("/premium")}
                  className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1.5 rounded-full hover:from-yellow-500/30 transition-all"
                >
                  <FaCrown className="text-xs" /> Upgrade
                </button>
              </div>
            </motion.div>
          )}

          {/* Swipe Area */}
          <div className="relative w-full max-w-sm h-[520px] mb-8">
            <AnimatePresence>
              {!currentProfile ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center glass p-8"
                >
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-white text-xl font-bold mb-2">You&apos;re all caught up!</h3>
                  <p className="text-white/40 mb-6 text-sm">No more profiles right now. Check back soon!</p>
                  <button onClick={fetchProfiles} className="btn-primary">
                    Refresh Profiles
                  </button>
                </motion.div>
              ) : (
                <>
                  {profiles[currentIndex + 1] && (
                    <div className="absolute inset-0 scale-[0.93] opacity-40 rounded-[2rem] overflow-hidden translate-y-4">
                      <SwipeCard profile={profiles[currentIndex + 1]} preview />
                    </div>
                  )}
                  <SwipeCard
                    key={currentProfile._id}
                    profile={currentProfile}
                    onSwipeLeft={() => handleSwipe("left", currentProfile._id)}
                    onSwipeRight={() => handleSwipe("right", currentProfile._id)}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Action hint overlay */}
            <AnimatePresence>
              {actionHint && (
                <motion.div
                  key={actionHint}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
                    actionHint === "like" ? "bg-green-500/30" :
                    actionHint === "nope" ? "bg-red-500/30" :
                    "bg-yellow-500/30"
                  }`}>
                    {actionHint === "like" ? "💚" : actionHint === "nope" ? "❌" : "⭐"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          {currentProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-5"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe("left", currentProfile._id)}
                className="w-16 h-16 glass rounded-full flex items-center justify-center text-white/50 hover:text-red-400 hover:border-red-500/50 transition-all"
              >
                <FaTimes className="text-2xl" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSuperLike(currentProfile._id)}
                className="w-14 h-14 glass rounded-full flex items-center justify-center text-white/50 hover:text-yellow-400 hover:border-yellow-500/50 transition-all"
              >
                <FaStar className="text-xl" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe("right", currentProfile._id)}
                className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 pulse-glow"
              >
                <FaHeart className="text-2xl" />
              </motion.button>
            </motion.div>
          )}

          {/* Swipe hint */}
          {currentProfile && (
            <p className="text-white/20 text-xs mt-4">Drag card or use buttons to swipe</p>
          )}
        </div>

        {/* Match Modal */}
        <AnimatePresence>
          {matchModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="glass max-w-sm w-full text-center p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: 3, duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    💕
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-2">It&apos;s a Match!</h2>
                  <p className="text-white/50 mb-6">
                    You and <span className="text-white font-bold">{matchModal.name}</span> liked each other!
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMatchModal(null); router.push("/matches"); }}
                      className="btn-primary flex-1"
                    >
                      Send Message
                    </button>
                    <button
                      onClick={() => setMatchModal(null)}
                      className="btn-outline flex-1"
                    >
                      Keep Swiping
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
