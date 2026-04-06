import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Forgot Password - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <FaHeart className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-black text-white">Forgot Password?</h1>
            <p className="text-white/40 mt-1 text-sm">We&apos;ll send you a reset link</p>
          </div>

          <div className="glass p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-white font-bold text-lg mb-2">Check your inbox!</h2>
                <p className="text-white/40 text-sm mb-6">
                  We sent a reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <Link href="/login" className="btn-primary inline-block">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input-field" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
                <Link href="/login" className="flex items-center justify-center gap-2 text-white/30 text-sm hover:text-white/50 transition-colors">
                  <FaArrowLeft className="text-xs" /> Back to Login
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
