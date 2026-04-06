import { useRouter } from "next/router";
import { FaHeart, FaArrowLeft } from "react-icons/fa";
import Head from "next/head";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Head><title>404 - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30"
          >
            <FaHeart className="text-white text-3xl" />
          </motion.div>

          <h1 className="text-8xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-3">Lost in the swipe zone</h2>
          <p className="text-white/40 mb-8 max-w-sm">
            This page got lost looking for a match. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.back()}
              className="btn-outline flex items-center justify-center gap-2">
              <FaArrowLeft className="text-xs" /> Go Back
            </button>
            <button onClick={() => router.push("/")} className="btn-primary">
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
