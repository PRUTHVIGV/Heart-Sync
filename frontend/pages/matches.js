import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaHeart, FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Matches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`);
      setMatches(data.matches);
    } catch {
      console.error("Failed to fetch matches");
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      <Head><title>Matches - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FaHeart className="text-primary" /> Matches
              {matches.length > 0 && (
                <span className="text-sm font-normal text-white/30 ml-1">({matches.length})</span>
              )}
            </h1>
          </div>

          {fetching ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 glass rounded-3xl p-12"
            >
              <div className="text-6xl mb-4">💫</div>
              <h3 className="text-white text-xl font-bold mb-2">No matches yet</h3>
              <p className="text-white/40 mb-6 text-sm">Keep swiping to find your match!</p>
              <button onClick={() => router.push("/dashboard")} className="btn-primary">
                Start Swiping <FaFire className="inline ml-1" />
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {matches.map((match, i) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/chat/${match._id}`)}
                  className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={
                      match.user.photos?.[0] ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user.name)}&background=FF4458&color=fff&size=200&bold=true`
                    }
                    alt={match.user.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-bold truncate">{match.user.name}</p>
                    <p className="text-white/40 text-xs">
                      {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {match.unreadCount > 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {match.unreadCount}
                    </div>
                  )}
                  {/* New match badge */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                      Chat
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
