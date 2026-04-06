import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaHeart, FaStar, FaBolt, FaInfinity, FaCheck, FaCrown, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const PLANS = [
  { id: "monthly", label: "1 Month", price: "$9.99", perMonth: "$9.99", priceId: "price_monthly_id", savings: null },
  { id: "quarterly", label: "3 Months", price: "$19.99", perMonth: "$6.66", priceId: "price_quarterly_id", savings: "Save 33%", badge: "Most Popular" },
  { id: "yearly", label: "12 Months", price: "$47.99", perMonth: "$3.99", priceId: "price_yearly_id", savings: "Save 60%", badge: "Best Value" },
];

const FEATURES = [
  { label: "Daily Swipes", free: "20/day", premium: "Unlimited" },
  { label: "Super Likes", free: "1/day", premium: "5/day" },
  { label: "See Who Liked You", free: false, premium: true },
  { label: "Profile Boost", free: false, premium: "1/month" },
  { label: "Advanced Filters", free: false, premium: true },
  { label: "Read Receipts", free: false, premium: true },
  { label: "Rewind Last Swipe", free: false, premium: true },
  { label: "No Ads", free: false, premium: true },
  { label: "Priority in Discovery", free: false, premium: true },
  { label: "Incognito Mode", free: false, premium: true },
];

export default function Premium() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleSubscribe = async () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout`,
        { priceId: plan.priceId }
      );
      window.location.href = data.url;
    } catch (err) {
      if (err.response?.data?.message?.includes("not configured")) {
        toast.error("Payments not set up yet. Add Stripe keys to backend .env");
      } else {
        toast.error("Failed to start checkout. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.isPremium) {
    return (
      <>
        <Head><title>Premium - HeartSync</title></Head>
        <div className="min-h-screen bg-dark">
          <Navbar />
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-black text-white mb-2">You&apos;re Premium!</h1>
            <p className="text-white/40 mb-8">All premium features are unlocked for you.</p>
            <button onClick={async () => {
              try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/portal`);
                window.location.href = data.url;
              } catch { toast.error("Billing portal unavailable"); }
            }} className="btn-outline">
              Manage Subscription
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>HeartSync Premium - Unlock Everything</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10 relative">
          {/* Orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-bold mb-5">
              <FaCrown /> HeartSync Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Unlock Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Full Potential</span>
            </h1>
            <p className="text-white/40">More matches. More connections. More love.</p>
          </motion.div>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PLANS.map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-3xl border-2 text-center transition-all ${
                  selectedPlan === plan.id
                    ? "border-yellow-500/60 bg-yellow-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-0.5 rounded-full whitespace-nowrap font-bold ${
                    plan.id === "yearly" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-primary to-accent"
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <p className="text-white/40 text-xs mb-1">{plan.label}</p>
                <p className="text-white text-xl font-black">{plan.perMonth}</p>
                <p className="text-white/30 text-xs">/month</p>
                {plan.savings && <p className="text-green-400 text-xs font-bold mt-1">{plan.savings}</p>}
                <p className="text-white/20 text-xs mt-1">{plan.price} total</p>
              </motion.button>
            ))}
          </div>

          {/* Features list */}
          <div className="glass p-6 mb-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <FaCrown className="text-yellow-400" /> Everything in Premium
            </h2>
            <div className="space-y-3">
              {[
                { icon: <FaInfinity className="text-primary" />, text: "Unlimited swipes every day" },
                { icon: <FaStar className="text-yellow-400" />, text: "5 Super Likes per day" },
                { icon: <FaHeart className="text-pink-400" />, text: "See everyone who liked you" },
                { icon: <FaBolt className="text-orange-400" />, text: "1 free Profile Boost per month" },
                { icon: <FaCheck className="text-green-400" />, text: "Rewind your last swipe" },
                { icon: <FaCheck className="text-green-400" />, text: "Advanced discovery filters" },
                { icon: <FaCheck className="text-green-400" />, text: "Read receipts in chat" },
                { icon: <FaCheck className="text-green-400" />, text: "Incognito mode — browse privately" },
                { icon: <FaCheck className="text-green-400" />, text: "Priority placement in discovery" },
                { icon: <FaCheck className="text-green-400" />, text: "Zero ads, ever" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm flex-shrink-0">{f.icon}</span>
                  <span className="text-white/70 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all mb-4"
          >
            <FaCrown />
            {loading ? "Redirecting to checkout..." : `Get Premium — ${PLANS.find(p => p.id === selectedPlan)?.perMonth}/mo`}
          </motion.button>

          {/* Comparison toggle */}
          <button onClick={() => setShowComparison(!showComparison)}
            className="w-full text-white/30 text-sm hover:text-white/50 transition-colors py-2">
            {showComparison ? "Hide" : "See"} Free vs Premium comparison
          </button>

          {showComparison && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="glass mt-4 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/40 font-medium">Feature</th>
                    <th className="text-center p-4 text-white/40 font-medium">Free</th>
                    <th className="text-center p-4 text-yellow-400 font-bold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 text-white/60">{f.label}</td>
                      <td className="p-4 text-center">
                        {f.free === false ? <FaTimes className="text-red-400/50 mx-auto" /> :
                          <span className="text-white/40 text-xs">{f.free}</span>}
                      </td>
                      <td className="p-4 text-center">
                        {f.premium === true ? <FaCheck className="text-green-400 mx-auto" /> :
                          <span className="text-green-400 text-xs font-medium">{f.premium}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          <p className="text-center text-white/20 text-xs mt-4">
            Cancel anytime · Secure payment via Stripe · No hidden fees
          </p>
        </div>
      </div>
    </>
  );
}
