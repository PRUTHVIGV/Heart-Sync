import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, { token, password });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Reset Password - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <FaHeart className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-white/40 mt-1 text-sm">Enter your new password below</p>
          </div>

          <div className="glass p-8">
            {done ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-white font-bold text-lg mb-2">Password Updated!</h2>
                <p className="text-white/40 text-sm mb-6">You can now sign in with your new password.</p>
                <button onClick={() => router.push("/login")} className="btn-primary w-full">Go to Login</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" required className="input-field pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Confirm Password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password" required className="input-field" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : "Reset Password"}
                </button>
                <Link href="/login" className="block text-center text-white/30 text-sm hover:text-white/50 transition-colors">
                  Back to Login
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
