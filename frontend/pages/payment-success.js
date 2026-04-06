import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Head from "next/head";
import { FaCrown, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const router = useRouter();
  const { updateUser } = useAuth();

  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`);
        updateUser(data.user);
      } catch {}
    };
    refresh();
  }, []);

  return (
    <>
      <Head><title>Welcome to Premium - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="glass max-w-md w-full text-center p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-primary/5 pointer-events-none" />
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <FaCrown /> Premium Active
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Welcome to Premium!</h1>
            <p className="text-white/50 mb-8 leading-relaxed">
              You now have unlimited swipes, super likes, and all premium features unlocked. Go find your match!
            </p>
            <div className="space-y-3">
              <button onClick={() => router.push("/dashboard")}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
                <FaHeart /> Start Matching
              </button>
              <button onClick={() => router.push("/profile")}
                className="btn-outline w-full py-3 text-sm">
                Complete My Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
