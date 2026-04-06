import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaHeart, FaStar, FaBolt, FaInfinity, FaCheck, FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "monthly",
    label: "1 Month",
    price: "$9.99",
    period: "/month",
    priceId: "price_monthly_id",
    popular: false,
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: "$6.99",
    period: "/month",
    priceId: "price_quarterly_id",
    popular: true,
    badge: "Most Popular",
    savings: "Save 30%",
  },
  {
    id: "yearly",
    label: "12 Months",
    price: "$3.99",
    period: "/month",
    priceId: "price_yearly_id",
    popular: false,
    savings: "Save 60%",
  },
];

const FEATURES = [
  { icon: <FaInfinity />, label: "Unlimited Swipes", free: false },
  { icon: <FaStar />, label: "5 Super Likes per day", free: false },
  { icon: <FaBolt />, label: "1 Profile Boost per month", free: false },
  { icon: <FaHeart />, label: "See who liked you", free: false },
  { icon: <FaCheck />, label: "No ads", free: false },
  { icon: <FaCheck />, label: "Advanced filters", free: false },
  { icon: <FaCheck />, label: "Read receipts", free: false },
];

export default function Premium() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout`,
        { priceId: plan.priceId }
      );
      window.location.href = data.url;
    } catch {
      toast.error("Failed to start checkout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>HeartSync Premium</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <FaCrown /> HeartSync Premium
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3">
              Upgrade Your <span className="text-primary">Love Life</span>
            </h1>
            <p className="text-gray-400">Get more matches, more likes, and more connections.</p>
          </motion.div>

          {/* Features */}
          <div className="card mb-8">
            <h2 className="text-white font-semibold mb-4">What you get with Premium</h2>
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-primary">{f.icon}</span>
                  <span className="text-white text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {PLANS.map((plan) => (
              <motion.button
                key={plan.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/10"
                    : "border-gray-700 bg-card hover:border-gray-500"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <p className="text-gray-400 text-xs mb-1">{plan.label}</p>
                <p className="text-white text-2xl font-bold">{plan.price}</p>
                <p className="text-gray-500 text-xs">{plan.period}</p>
                {plan.savings && (
                  <p className="text-green-400 text-xs font-medium mt-1">{plan.savings}</p>
                )}
              </motion.button>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          >
            <FaCrown />
            {loading ? "Redirecting..." : "Get Premium Now"}
          </button>

          <p className="text-center text-gray-600 text-xs mt-4">
            Cancel anytime. Billed securely via Stripe. By subscribing you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </>
  );
}
