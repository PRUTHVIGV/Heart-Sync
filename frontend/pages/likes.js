import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaHeart, FaCrown, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Likes() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [likes, setLikes] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user?.isPremium) fetchLikes();
    else setFetching(false);
  }, [user]);

  const fetchLikes = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/likes`);
      setLikes(data.likes);
    } catch {
      console.error("Failed to fetch likes");
    } finally {
      setFetching(false);
    }
  };

  const handleMatch = async (userId) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/swipe`, {
        targetUserId: userId,
        direction: "right",
      });
      if (data.matched) {
        setLikes((prev) => prev.filter((l) => l._id !== userId));
        router.push("/matches");
      }
    } catch {
      console.error("Failed to match");
    }
  };

  if (loading) return null;

  return (
    <>
      <Head><title>Likes You - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FaHeart className="text-primary" /> Liked You
              {user?.isPremium && likes.length > 0 && (
                <span className="text-sm font-normal text-white/30 ml-1">({likes.length})</span>
              )}
            </h1>
            {user?.isPremium && (
              <span className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1 rounded-full font-medium">
                <FaCrown className="text-xs" /> Premium
              </span>
            )}
          </div>

          {!user?.isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-primary/5 pointer-events-none" />
              <div className="relative z-10">
                {/* Blurred preview */}
                <div className="grid grid-cols-3 gap-3 mb-8 filter blur-sm pointer-events-none select-none">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <FaHeart className="text-white/30 text-2xl" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                    <FaLock className="text-yellow-400 text-2xl" />
                  </div>
                  <h2 className="text-white text-xl font-black mb-2">See Who Likes You</h2>
                  <p className="text-white/40 text-sm mb-6 max-w-xs">
                    Upgrade to Premium to see everyone who already liked your profile.
                  </p>
                  <button onClick={() => router.push("/premium")}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
                    <FaCrown /> Unlock with Premium
                  </button>
                </div>
              </div>
            </motion.div>
          ) : fetching ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : likes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass p-12 text-center">
              <div className="text-5xl mb-4">💫</div>
              <h3 className="text-white font-bold text-lg mb-2">No likes yet</h3>
              <p className="text-white/40 text-sm mb-6">Keep swiping — your likes will appear here!</p>
              <button onClick={() => router.push("/dashboard")} className="btn-primary">
                Start Swiping
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {likes.map((like, i) => (
                <motion.div
                  key={like._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer"
                  onClick={() => handleMatch(like._id)}
                >
                  <img
                    src={like.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(like.name)}&background=FF4458&color=fff&size=200&bold=true`}
                    alt={like.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                    <FaHeart className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100 transform duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-bold truncate">{like.name}</p>
                    <p className="text-white/50 text-xs">{like.age}</p>
                  </div>
                  {like.superLiked && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-xs">⭐</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
