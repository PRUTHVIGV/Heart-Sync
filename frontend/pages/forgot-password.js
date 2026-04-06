import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

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
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Forgot Password - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaHeart className="text-primary text-3xl" />
              <span className="text-3xl font-bold">HeartSync</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-gray-400 mt-1">We&apos;ll send you a reset link</p>
          </div>

          <div className="card">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
                <p className="text-gray-400 text-sm mb-6">
                  We sent a password reset link to <span className="text-white">{email}</span>
                </p>
                <Link href="/login" className="btn-primary inline-block">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <p className="text-center text-gray-400 text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
