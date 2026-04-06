import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaComments } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
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
      <Head><title>Messages - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FaComments className="text-primary" /> Messages
          </h1>

          {fetching ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20">
              <FaComments className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-400 mb-6">Match with someone and start a conversation!</p>
              <button onClick={() => router.push("/dashboard")} className="btn-primary">
                Start Swiping
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((match) => (
                <div
                  key={match._id}
                  onClick={() => router.push(`/chat/${match._id}`)}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl cursor-pointer hover:border-primary/40 border border-gray-800 transition-all"
                >
                  <div className="relative">
                    <img
                      src={
                        match.user.photos?.[0] ||
                        `https://ui-avatars.com/api/?name=${match.user.name}&background=FF4458&color=fff&size=100`
                      }
                      alt={match.user.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold">{match.user.name}</h3>
                      <span className="text-gray-500 text-xs">
                        {match.lastMessage
                          ? formatDistanceToNow(new Date(match.lastMessage.createdAt), { addSuffix: true })
                          : formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm truncate mt-0.5">
                      {match.lastMessage ? match.lastMessage.content : "💕 You matched! Say hello"}
                    </p>
                  </div>
                  {match.unreadCount > 0 && (
                    <div className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {match.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
