import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import SwipeCard from "../components/cards/SwipeCard";
import { FaHeart, FaTimes, FaStar } from "react-icons/fa";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [matchModal, setMatchModal] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/discover`);
      setProfiles(data.profiles);
    } catch {
      toast.error("Failed to load profiles");
    } finally {
      setFetching(false);
    }
  };

  const handleSwipe = async (direction, profileId) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/swipe`, {
        targetUserId: profileId,
        direction,
      });
      if (data.matched) {
        setMatchModal(profiles[currentIndex]);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSuperLike = async (profileId) => {
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
          <FaHeart className="text-primary text-5xl mx-auto animate-pulse mb-4" />
          <p className="text-gray-400">Finding matches for you...</p>
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
        <div className="flex flex-col items-center justify-center px-4 py-8">
          {/* Swipe Area */}
          <div className="relative w-full max-w-sm h-[520px] mb-8">
            {!currentProfile ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FaHeart className="text-gray-600 text-6xl mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">No more profiles</h3>
                <p className="text-gray-400 mb-6">Check back later for new matches!</p>
                <button onClick={fetchProfiles} className="btn-primary">Refresh</button>
              </div>
            ) : (
              <>
                {/* Next card preview */}
                {profiles[currentIndex + 1] && (
                  <div className="absolute inset-0 scale-95 opacity-50 rounded-3xl overflow-hidden">
                    <SwipeCard profile={profiles[currentIndex + 1]} preview />
                  </div>
                )}
                {/* Current card */}
                <SwipeCard
                  key={currentProfile._id}
                  profile={currentProfile}
                  onSwipeLeft={() => handleSwipe("left", currentProfile._id)}
                  onSwipeRight={() => handleSwipe("right", currentProfile._id)}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          {currentProfile && (
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleSwipe("left", currentProfile._id)}
                className="w-16 h-16 bg-card border-2 border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
              >
                <FaTimes className="text-2xl" />
              </button>
              <button
                onClick={() => handleSuperLike(currentProfile._id)}
                className="w-14 h-14 bg-card border-2 border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:border-yellow-400 hover:text-yellow-400 transition-all hover:scale-110 active:scale-95"
              >
                <FaStar className="text-xl" />
              </button>
              <button
                onClick={() => handleSwipe("right", currentProfile._id)}
                className="w-16 h-16 bg-card border-2 border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95"
              >
                <FaHeart className="text-2xl" />
              </button>
            </div>
          )}
        </div>

        {/* Match Modal */}
        {matchModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="card text-center max-w-sm w-full">
              <div className="text-6xl mb-4">💕</div>
              <h2 className="text-3xl font-bold text-primary mb-2">It&apos;s a Match!</h2>
              <p className="text-gray-400 mb-6">
                You and <span className="text-white font-semibold">{matchModal.name}</span> liked each other!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setMatchModal(null); router.push("/matches"); }}
                  className="btn-primary flex-1"
                >
                  Send Message
                </button>
                <button onClick={() => setMatchModal(null)} className="btn-outline flex-1">
                  Keep Swiping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
