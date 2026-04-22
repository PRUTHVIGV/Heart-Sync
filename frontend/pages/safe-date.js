import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { motion } from "framer-motion";
import { FaShieldAlt, FaMapMarkerAlt, FaBell, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export default function SafeDate() {
  const [form, setForm] = useState({ trustedContact: "", dateLocation: "", dateTime: "" });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!form.trustedContact || !form.dateLocation) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/safedate/start`, form);
      setSession(data.sessionId);
      toast.success("Safe date session started 🛡️");
    } catch { toast.error("Failed to start session"); }
    finally { setLoading(false); }
  };

  const checkin = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/safedate/checkin`, { sessionId: session });
      toast.success("Check-in sent ✅ Your contact knows you're safe!");
    } catch { toast.error("Check-in failed"); }
  };

  const sos = async () => {
    if (!confirm("Send SOS to your trusted contact?")) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/safedate/sos`, { sessionId: session });
      toast.error("🚨 SOS sent to your trusted contact!");
    } catch { toast.error("SOS failed"); }
  };

  const end = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/safedate/end`, { sessionId: session });
      setSession(null);
      setForm({ trustedContact: "", dateLocation: "", dateTime: "" });
      toast.success("Date ended safely ✅");
    } catch { toast.error("Failed to end session"); }
  };

  return (
    <>
      <Head><title>Safe Date - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <FaShieldAlt className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Safe Date</h1>
              <p className="text-white/40 text-sm">Share your safety with someone you trust</p>
            </div>
          </div>

          {!session ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass p-5 space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Trusted Contact (name or phone)</label>
                  <input value={form.trustedContact} onChange={(e) => setForm({ ...form, trustedContact: e.target.value })}
                    placeholder="e.g. Mom, Best Friend, +91 98765 43210"
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <FaMapMarkerAlt className="text-primary" /> Date Location
                  </label>
                  <input value={form.dateLocation} onChange={(e) => setForm({ ...form, dateLocation: e.target.value })}
                    placeholder="e.g. Starbucks, MG Road, Bangalore"
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Date & Time</label>
                  <input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    className="input-field text-sm" />
                </div>
                <button onClick={start} disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <FaShieldAlt /> {loading ? "Starting..." : "Start Safe Date Session"}
                </button>
              </div>

              <div className="glass p-5">
                <h3 className="text-white font-bold text-sm mb-3">How it works</h3>
                <div className="space-y-2">
                  {[
                    ["🛡️", "Start a session before your date"],
                    ["✅", "Check in to let your contact know you're safe"],
                    ["🚨", "Hit SOS if you feel unsafe — contact gets notified instantly"],
                    ["👋", "End session when you're home safe"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-3 text-white/50 text-sm">
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="glass p-5 border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-bold text-sm">Session Active</span>
                </div>
                <p className="text-white/40 text-xs">📍 {form.dateLocation}</p>
                <p className="text-white/40 text-xs">👤 Trusted: {form.trustedContact}</p>
              </div>

              <button onClick={checkin}
                className="w-full py-4 glass border border-green-500/30 text-green-400 font-bold rounded-2xl hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-lg">
                <FaCheckCircle /> I'm Safe — Check In
              </button>

              <button onClick={sos}
                className="w-full py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-2xl hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-lg">
                <FaExclamationTriangle /> SOS — Send Alert
              </button>

              <button onClick={end}
                className="w-full py-3 glass text-white/40 font-medium rounded-2xl hover:text-white/60 transition-all text-sm">
                End Session (I'm home safe)
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
