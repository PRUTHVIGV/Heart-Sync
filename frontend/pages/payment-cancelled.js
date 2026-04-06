import { useRouter } from "next/router";
import Head from "next/head";
import { FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function PaymentCancelled() {
  const router = useRouter();
  return (
    <>
      <Head><title>Payment Cancelled - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass max-w-md w-full text-center p-10"
        >
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-2xl font-black text-white mb-2">Payment Cancelled</h1>
          <p className="text-white/40 mb-8 text-sm leading-relaxed">
            No worries! You can upgrade anytime to unlock unlimited swipes and premium features.
          </p>
          <div className="flex gap-3">
            <button onClick={() => router.push("/premium")} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FaCrown /> Try Again
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-outline flex-1">
              Continue Free
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
