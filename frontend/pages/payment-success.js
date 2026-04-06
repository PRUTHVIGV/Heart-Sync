import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Head from "next/head";
import { FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const router = useRouter();
  const { updateUser } = useAuth();

  useEffect(() => {
    // Refresh user to get updated premium status
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
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="card max-w-md w-full text-center py-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <FaCrown /> Premium Active
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Premium!</h1>
          <p className="text-gray-400 mb-8">
            You now have unlimited swipes, super likes, and all premium features unlocked.
          </p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary w-full text-lg py-4">
            Start Matching 💕
          </button>
        </motion.div>
      </div>
    </>
  );
}
