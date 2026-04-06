import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaHeart, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 💕");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Login - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30"
            >
              <FaHeart className="text-white text-2xl" />
            </motion.div>
            <h1 className="text-3xl font-black text-white">Welcome back</h1>
            <p className="text-white/40 mt-1">Sign in to continue matching</p>
          </div>

          <div className="glass p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
