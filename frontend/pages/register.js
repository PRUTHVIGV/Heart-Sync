import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";

const steps = ["Account", "About You", "Preferences"];

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    age: "", gender: "", interestedIn: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.password) return toast.error("Fill all fields");
      if (form.password.length < 6) return toast.error("Password min 6 characters");
    }
    if (step === 1) {
      if (!form.age) return toast.error("Enter your age");
      if (parseInt(form.age) < 18) return toast.error("Must be 18 or older");
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.gender || !form.interestedIn) return toast.error("Fill all fields");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Register - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <FaHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-black text-white">Create Account</h1>
            <p className="text-white/40 mt-1">Find your perfect match today</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-green-500 text-white" :
                  i === step ? "bg-gradient-to-br from-primary to-accent text-white" :
                  "bg-white/10 text-white/30"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs transition-colors ${i === step ? "text-white" : "text-white/30"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-green-500/50" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <div className="glass p-8">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Full Name</label>
                    <input name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Email</label>
                    <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        className="input-field pr-12"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={nextStep} className="btn-primary w-full flex items-center justify-center gap-2">
                    Continue <FaArrowRight />
                  </motion.button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Age</label>
                    <input name="age" type="number" placeholder="Must be 18+" min="18" max="100" value={form.age} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["male", "female", "non-binary", "other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`py-2.5 rounded-2xl text-sm font-medium capitalize transition-all border ${
                            form.gender === g
                              ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50 text-white"
                              : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)} className="btn-outline flex items-center gap-2 px-4">
                      <FaArrowLeft />
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={nextStep} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      Continue <FaArrowRight />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Interested In</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["men", "women", "everyone"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setForm({ ...form, interestedIn: opt })}
                          className={`py-2.5 rounded-2xl text-sm font-medium capitalize transition-all border ${
                            form.interestedIn === opt
                              ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50 text-white"
                              : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline flex items-center gap-2 px-4">
                      <FaArrowLeft />
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-primary flex-1">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : "Create Account 💕"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
